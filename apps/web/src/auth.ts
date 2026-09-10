import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@portal/db';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      issuer: 'https://github.com/login/oauth',
      authorization: { params: { scope: 'read:user user:email' } },
      //allowDangerousEmailAccountLinking: true, // 开启了 allowDangerousEmailAccountLinking: true 后，登录流程在发现没有关联的 Account 时，将直接把该 GitHub 账户链接绑定到你现有的 User 记录上，不会再产生 OAuthAccountNotLinked 报错。
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, attach role and latest name from DB
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, name: true },
        });
        token.id = user.id;
        token.role = dbUser?.role ?? 'viewer';
        if (dbUser?.name) {
          token.name = dbUser.name;
        }
      }
      // On session.update() triggered on client
      if (trigger === 'update') {
        if (session?.name !== undefined) {
          token.name = session.name;
        } else if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, role: true },
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.role = dbUser.role;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Pass JWT claims into session
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      if (token.name !== undefined) {
        session.user.name = token.name as string | null;
      }
      return session;
    },
  },
  // NextAuth 的 events.signIn 异步事件处理器中更新 Token 和 Scope
  events: {
    async signIn({ user, account }) {
      // Automatically update account credentials (token, scope) in the database asynchronously after successful sign-in
      if (account && user?.id) {
        await prisma.account
          .updateMany({
            where: {
              userId: user.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              scope: account.scope,
              expires_at: account.expires_at,
            },
          })
          .catch((err) => {
            console.error('Failed to update OAuth credentials in database:', err);
          });
      }
    },
  },
});

// Extend the Session type to include role
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

import { defaultAboutConfig, defineConfig } from '@portal/config';

const siteConfig = defineConfig({
  site: {
    title: 'Voocii',
    description: 'A modular personal website platform',
    url: 'https://voocii.com',
    locale: 'zh-CN',
    author: 'Rick',
  },
  preset: 'full',
  theme: {
    default: 'zenith',
    available: ['zenith', 'dark-neon', 'cyberpunk', 'retro-brown', 'minimal-light', 'lumiere'],
    allowUserSwitch: true,
  },
  homeLayout: 'classic',
  comments: {
    requireModeration: false,
  },

  /**
   * 头像服务配置 (Avatar Service)
   * 占位符支持:
   *  - {hash}     : 邮箱 MD5 Hash 小写哈希值
   *  - {name}     : 编码后的用户昵称
   *  - {email}    : 编码后的邮箱地址
   *  - {size}     : 头像尺寸 (像素)
   *  - {fallback} : 本地首字母彩图兜底 URL
   *
   * 常用服务商示例:
   *  - Cravatar (国内高速):     'https://cravatar.cn/avatar/{hash}?d={fallback}&s={size}'
   *  - WeAvatar (QQ/微信/全网): 'https://weavatar.com/avatar/{hash}?d=initials&name={name}'
   *  - Gravatar (官方国际服务):  'https://gravatar.com/avatar/{hash}?d={fallback}&s={size}'
   *  - DiceBear (基于email生成矢量图): 'https://api.dicebear.com/7.x/identicon/svg?seed={email}'
   *  - Robohash (基于email生成机器人): 'https://robohash.org/{email}?size={size}x{size}'
   */
  avatar: {
    urlTemplate: 'https://weavatar.com/avatar/{hash}?d=initials&name={name}',
  },
  email: {
    enabled: true,
    provider: 'mailgun',
  },
  about: defaultAboutConfig,
});

export default siteConfig;

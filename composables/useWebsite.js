import { indexApi } from '~/api/index.js'

/**
 * 站点信息 / 导航 / 友链的统一取数（二开）。
 *
 * 原来每个组件各自 getStorage/setStorage，把结果在 localStorage 里存 60 分钟。
 * 后果是后台改了网站名称、Logo、导航，员工端最长要等一个小时才变，
 * 而且 Header 和 Footer 还会各拉一次接口。
 *
 * 改用 useAsyncData：
 *   - 同一个 key 在一次页面渲染内只请求一次，Header/Footer 共用结果
 *   - 服务端渲染时就取好，首屏直接是正确的名称，不会先闪一下旧值
 *   - 不再往 localStorage 落盘，配置改动下次打开页面就生效
 * 接口本身在服务端有 Redis 缓存（改配置时会主动清除），不担心压力。
 */
// key 用 'website'，与 login.vue 里已有的 useAsyncData('website') 一致，
// 两者会共用同一次请求，不会各拉一遍
export function useWebsiteInfo() {
  const { data } = useAsyncData('website', () => indexApi.websiteInfo())
  return data
}

export function useWebsiteNav() {
  const { data } = useAsyncData('website-nav', () => indexApi.websiteNav())
  return data
}

export function useWebsiteLink() {
  const { data } = useAsyncData('website-link', () => indexApi.websiteLink())
  return data
}

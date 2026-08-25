import { setToken, removeToken } from '@/utils/cookie'
import { setStorage, getStorage } from '@/utils/storage'

export const login = (token) => {
  setToken(token)

  // 优先用地址栏里的 redirect：路由中间件拦截未登录访问时会带上它。
  // 只取站内路径，避免被构造成跳转到外部站点。
  const redirect = new URLSearchParams(window.location.search).get('redirect')
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    window.location.href = redirect
    return
  }

  const history = getStorage('history')
  if (history) {
    window.location.href = history
    setStorage('history', '')
  } else {
    window.location.href = '/'
  }
}

export const logout = () => {
  removeToken()
}

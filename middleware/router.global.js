import { getToken } from '~/utils/cookie.js'

/**
 * 需要登录才能访问的路径前缀。
 * 这些页面进来就会打 /auth 开头的接口取数据。
 */
const AUTH_PREFIXES = ['/account', '/exam']

export default defineNuxtRouteMiddleware((to) => {
  // 首页重定向
  if (to.path === '/index') {
    return navigateTo('/')
  }

  // 404页面
  if (to.matched.length === 0) {
    return navigateTo('/404')
  }

  // 登录校验
  //
  // 不做这一层的话，未登录进 /account/* 会是这样：页面照常渲染 ->
  // 取数据时打 /auth 接口 -> utils/request.js 的请求拦截器发现没有 token，
  // 弹「请先登录」并 Promise.reject(config) -> 这个拒绝冒泡成 Vue 未捕获错误
  // -> Nuxt 渲染出一张带堆栈的 500 页。弹窗背后是报错页，
  // 员工会以为系统坏了。
  // 在路由这一层拦住，页面根本不会开始渲染，也就不会走到那个拒绝。
  if (AUTH_PREFIXES.some((p) => to.path === p || to.path.startsWith(p + '/'))) {
    if (!getToken()) {
      // 目标地址用 query 传，不能只写 localStorage：
      // 员工从企业微信点链接进来是整页加载，中间件跑在服务端，
      // 那时候没有 localStorage，写不进去，登录完就跳回首页而不是他要看的那页。
      return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})

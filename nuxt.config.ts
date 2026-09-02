// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  experimental: {
    asyncContext: true
  },
  // theme 在前：main.scss 里的规则会用到它定义的 CSS 变量
  css: ['~/assets/styles/theme.scss', '~/assets/styles/main.scss'],
  modules: ['@element-plus/nuxt', '@vueuse/nuxt'],
  nitro: {
    devProxy: {
      '/gateway': {
        target: process.env.VITE_BASE_URL,
        changeOrigin: true
      }
    }
  },
  vite: {
    build: {
      minify: 'terser',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
      terserOptions: {
        compress: {
          drop_console: process.env.VITE_DROP_CONSOLE,
          drop_debugger: process.env.VITE_DROP_DEBUGGER
        }
      }
    }
  },
  sourcemap: {
    server: process.env.NODE_ENV === 'development',
    client: process.env.NODE_ENV === 'development'
  },
  // 关闭开发工具悬浮条：面向业务人员演示时不需要，也避免误点
  devtools: { enabled: false },
  // 关闭匿名使用数据上报：部署到公司内网后这属于对外网络请求，
  // 可能被安全策略拦截或在安全审计中被问及
  telemetry: false,
  compatibilityDate: '2025-08-25'
})

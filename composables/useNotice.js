import { noticeApi } from '~/api/notice.js'

/**
 * 未读消息数的共享状态（二开）。
 *
 * 侧边栏的角标在 layouts/account.vue，标记已读的操作在 pages/account/notice.vue，
 * 两个组件各自 ref('unread') 的话是两份互不相干的状态——
 * 点了「全部标记为已读」，列表清空了、角标还挂着旧数字，
 * 要刷新整页才对得上。
 *
 * 用 Nuxt 的 useState 把它提成一份共享状态，谁改了另一边立刻跟着变。
 */
export function useUnreadCount() {
  return useState('notice-unread', () => 0)
}

/** 重新拉一次未读数。取不到时不改动现有值，避免网络抖动把角标清掉 */
export async function refreshUnread() {
  const unread = useUnreadCount()
  try {
    unread.value = (await noticeApi.unread()) || 0
  } catch (e) {
    // 角标不是关键路径，失败就保持原样
  }
  return unread.value
}

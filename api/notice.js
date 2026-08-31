import { getRequest, putRequest } from '@/utils/request'

// 我的消息（二开）。目前只有课程逾期催办会产生消息
export const noticeApi = {
  // 未读数，用于菜单角标
  unread: () => {
    return getRequest('/course/auth/notice/unread')
  },
  // useTable 传的是 { pageCurrent, pageSize } 对象，不是位置参数——
  // 写成 (pageCurrent, pageSize) 会拼出 pageCurrent=[object Object]，接口直接 400
  list: (params = {}) => {
    const { pageCurrent = 1, pageSize = 10 } = params
    return getRequest(`/course/auth/notice/list?pageCurrent=${pageCurrent}&pageSize=${pageSize}`)
  },
  read: (id) => {
    return putRequest(`/course/auth/notice/read/${id}`)
  },
  readAll: () => {
    return putRequest('/course/auth/notice/read-all')
  }
}

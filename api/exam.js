import { getRequest, postRequest } from '@/utils/request'

export const examApi = {
  // 我的课程任务(必修/选修)
  myAssignList: () => {
    return getRequest('/course/auth/exam/my/assign/list')
  },
  // 课程下可考试卷
  paperList: (courseId) => {
    return getRequest('/course/auth/exam/paper/list?courseId=' + courseId)
  },
  // 开始考试
  start: (params = {}) => {
    return postRequest('/course/auth/exam/start', params)
  },
  // 交卷
  submit: (params = {}) => {
    return postRequest('/course/auth/exam/submit', params)
  },
  // 我的考试成绩
  myRecordList: () => {
    return getRequest('/course/auth/exam/my/record/list')
  }
}

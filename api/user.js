import { getRequest, postRequest, putRequest } from '@/utils/request'

export const userApi = {
  // 我的课程
  userCoursePage: (params = {}) => {
    return postRequest('/course/auth/user/course/page', params)
  },




  // 用户信息修改
  usersUpdate: (params = {}) => {
    return postRequest('/user/auth/users/edit', params)
  },

  // 只更新头像。edit 接口要求昵称/性别/生日都非空，换头像不该被这些挡住
  usersUpdateHead: (params = {}) => {
    return postRequest('/user/auth/users/head', params)
  },

  // 修改密码。凭原密码改新密码，不依赖短信——
  // 平台没配短信平台，原有的「忘记密码」走验证码那条路实际是断的
  usersUpdatePsw: (params = {}) => {
    return postRequest('/user/auth/users/psw', params)
  },

  // 用户信息
  getUserInfo: () => {
    return getRequest('/user/auth/users/view')
  },

  // 用户绑定微信
  userBinding: (params = {}) => {
    return postRequest('/user/auth/users/binding', params)
  },

  // 用户解绑微信
  userUnbind: () => {
    return getRequest('/user/auth/users/unbind')
  },

  // 课程收藏列出
  userCourseCollectPage: (params = {}) => {
    return postRequest('/course/auth/user/course/collect/page', params)
  }
}

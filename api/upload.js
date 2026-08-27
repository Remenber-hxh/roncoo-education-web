import { upload } from '@/utils/request'

export const uploadApi = {
  // 上传图片。
  // 第三个参数是表单字段名，必须传：后端形参是 @RequestParam("picFile")，
  // 不传的话 formData.append(undefined, file)，字段名变成字符串 "undefined"，
  // 后端一直收到 null。
  uploadPic: (file, onProgress) => {
    return upload('/system/auth/upload/pic', file, 'picFile', onProgress)
  }
}

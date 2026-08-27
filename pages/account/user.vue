<template>
  <NuxtLayout name="account">
    <el-tabs v-model="activeName">
      <el-tab-pane :name="1" label="基本资料">
        <!-- 原来表单整体限宽 600px，头像排在右边也放不下 -->
        <el-form :model="userInfo" label-width="60px" class="profile-form">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="15">
              <el-form-item label="手机：">
                {{ userInfo.mobile }}
                <span style="margin-left: 20px; color: #999">不可修改</span>
              </el-form-item>
              <el-form-item label="昵称：">
                <el-input v-model="userInfo.nickname" size="large" placeholder="请输入昵称" />
              </el-form-item>
              <!-- 性别在后端是必填（AuthUsersReq 上有 @NotNull），
                   但表单里一直没有这一项，点保存必然报「请选择性别」，
                   而员工又无处可选，等于个人资料根本改不了 -->
              <el-form-item label="性别：">
                <el-radio-group v-model="userInfo.userSex">
                  <el-radio :value="1">男</el-radio>
                  <el-radio :value="2">女</el-radio>
                  <el-radio :value="3">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日：">
                <el-date-picker v-model="userInfo.userAge" value-format="YYYY-MM-DD" format="YYYY-MM-DD" type="date" placeholder="请选择出生日期" />
              </el-form-item>
              <el-form-item label="">
                <el-button type="primary" size="large" @click="onSubmit"> 保存设置 </el-button>
              </el-form-item>
            </el-col>
            <!-- 头像原来只是展示，没法换。上传接口后端本来就有
                 （/system/auth/upload/pic），缺的是这里的入口。
                 之前这块被 el-col 外面套的两层 el-row 挤到了表单下方——
                 el-row 是 width:100% 的块级栅格行，作为 el-col 的兄弟会独占一整行。 -->
            <el-col :xs="24" :sm="9">
              <div class="avatar-box">
                <div v-loading="avatarUploading" class="avatar-click" @click="pickAvatar">
                  <common-avatar :url="userInfo.userHead" :name="userInfo.nickname" :size="100" />
                  <div class="avatar-mask">更换头像</div>
                </div>
                <input ref="avatarInput" type="file" accept="image/*" class="avatar-input" @change="onAvatarChange" />
                <div class="avatar-tip">支持 JPG / PNG，2M 以内</div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :name="2" label="账号设置">
        <el-card class="account-setting">
          <div class="setting">
            <div class="setting-info">
              <img src="../../assets/svg/account/password.svg" width="60px" />
              <div>
                重置登录密码
                <br />
                ********
              </div>
            </div>
            <el-button text type="primary">
              <nuxt-link :to="{ name: 'reset' }"> 密码重置 </nuxt-link>
            </el-button>
          </div>
        </el-card>
        <el-card v-if="websiteInfo?.wxPcLoginEnable === '1'" class="account-setting">
          <div class="setting">
            <div class="setting-info">
              <img src="../../assets/svg/account/wechat.svg" width="60px" />
              <div>
                微信账号绑定
                <br />
                <span v-if="userInfo.unionId || userInfo.openId" style="color: #999">已绑定</span>
                <span v-else style="color: #999">未绑定</span>
              </div>
            </div>
            <el-button text type="primary">
              <div v-if="userInfo.unionId || userInfo.openId" @click="handleUnBind">解除绑定</div>
              <div v-else @click="handleBinding">绑定微信</div>
            </el-button>
          </div>
          <account-wechat v-model="binding" @callback="getUserInfo()" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </NuxtLayout>
</template>
<script setup>
  import { userApi } from '~/api/user.js'
  import { uploadApi } from '~/api/upload.js'
  import { ElMessage } from 'element-plus'
  import { ref } from 'vue'
  import { indexApi } from '~/api'

  const router = useRouter()
  const route = useRoute()

  const activeName = ref(1)
  const userInfo = ref({})
  const binding = ref(false)
  const wxCode = ref('')

  const { data: websiteInfo } = await useAsyncData('website', async () => {
    return indexApi.websiteInfo()
  })

  onMounted(() => {
    wxCode.value = route.query.code
    if (wxCode.value) {
      // 进行绑定
      userBinding()
    }
    getUserInfo()
  })

  // 获取用户信息
  const getUserInfo = async () => {
    userInfo.value = await userApi.getUserInfo()
  }

  // ===== 头像上传 =====
  const avatarInput = ref()
  const avatarUploading = ref(false)
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024

  const pickAvatar = () => {
    if (avatarUploading.value) {
      return
    }
    avatarInput.value.click()
  }

  const onAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    // 选完先把 input 清空，否则连续选同一张图不会再触发 change
    e.target.value = ''
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      ElMessage.warning('请选择图片文件')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      ElMessage.warning('图片不能超过 2M')
      return
    }

    avatarUploading.value = true
    try {
      const url = await uploadApi.uploadPic(file)
      if (!url) {
        ElMessage.error('上传失败，未拿到图片地址')
        return
      }
      // 上传成功只是拿到地址，还要写回用户资料才算换好。
      // 走专用的 updateHead 而不是 usersUpdate：后者要求昵称、性别、生日
      // 都非空，没填过生日的员工换头像会被打回，而他在这一步也没法补。
      // 这里单独提交，不要求用户再去点「保存设置」——
      // 点了头像就该立刻生效，不然会以为没换上。
      await userApi.usersUpdateHead({ userHead: url })
      userInfo.value.userHead = url
      ElMessage.success('头像已更新')
    } finally {
      avatarUploading.value = false
    }
  }

  // 绑定
  const handleBinding = () => {
    binding.value = true
  }

  // 用户绑定微信
  const userBinding = async () => {
    const res = await userApi.userBinding({ code: wxCode.value })
    await router.push({
      query: Object.assign({ ...route.query }, { code: '', state: '' })
    })
    await getUserInfo()
    ElMessage.success(res)
    activeName.value = 2
  }

  // 解除绑定
  const handleUnBind = () => {
    ElMessageBox.confirm('确定解除绑定？解绑后，将无法使用微信账号快捷登录', '解绑提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userApi.userUnbind().then((res) => {
        ElMessage.success(res)
        getUserInfo()
        activeName.value = 2
      })
    })
  }

  // 校验项与后端 AuthUsersReq 上的注解保持一致：
  // 昵称 @NotBlank、性别 @NotNull、生日 @NotNull。
  // 原来这里只校验了昵称，还拿日期去比 userAge < 0（永远为 false，等于没校验），
  // 结果是前端放行、后端打回，员工只看到一句没头没尾的错误提示。
  const onSubmit = () => {
    if (!userInfo.value.nickname) {
      ElMessage.warning('请输入昵称')
      return
    }
    if (userInfo.value.userSex === undefined || userInfo.value.userSex === null) {
      ElMessage.warning('请选择性别')
      return
    }
    if (!userInfo.value.userAge) {
      ElMessage.warning('请选择生日')
      return
    }

    userApi.usersUpdate(userInfo.value).then((res) => {
      ElMessage.success(res)
    })
  }
</script>
<style lang="scss" scoped>
  .el-form {
    margin: 20px;
    .el-form-item {
      margin: 20px;
    }
  }

  .account-setting {
    margin: 20px auto;
    width: 90%;
  }

  .setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 30px;
    img {
      padding: 10px 20px;
    }
    .setting-info {
      font-size: 16px;
      display: flex;
      align-items: center;
    }
  }

  // 表单整体限宽，避免宽屏下输入框拉得过长；头像列跟着一起限制
  .profile-form {
    max-width: 860px;
  }

  // 头像可点击更换，悬停时压一层提示
  .avatar-box {
    text-align: center;
    padding-top: 8px;
  }

  .avatar-click {
    position: relative;
    display: inline-block;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    line-height: 0;

    .avatar-mask {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 30px;
      line-height: 30px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .avatar-mask {
      opacity: 1;
    }
  }

  // 原生 file 选择框藏起来，点头像时用代码触发
  .avatar-input {
    display: none;
  }

  .avatar-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    // 不让它在窄列里折成「支持 JPG/PNG，2」+「M 以内」两行
    white-space: nowrap;
  }

  // 手机：表单原本左右各 40px 内缩（.el-form 与 .el-form-item 各 20px），
  // 窄屏下输入框会被挤得很短，这里收掉横向留白
  @media (max-width: 768px) {
    // 手机没有 hover，遮罩要常驻，否则看不出头像能点
    .avatar-click .avatar-mask {
      opacity: 1;
    }

    .el-form {
      margin: 10px 0;
      .el-form-item {
        margin: 16px 0;
      }
    }

    .account-setting {
      width: 100%;
      margin: 12px auto;
    }

    .setting {
      img {
        padding: 10px;
        width: 40px;
      }
      .setting-info {
        font-size: 14px;
      }
    }
  }
</style>

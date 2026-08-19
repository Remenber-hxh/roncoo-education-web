<template>
  <NuxtLayout>
    <div class="login_body">
      <div class="login_box">
        <div class="login_content">
          <div class="login_title">
            <div class="login_title_name">账号注册</div>
            <div>已有账号，<nuxt-link to="/login"> 立即登录 </nuxt-link></div>
          </div>
          <div class="login_form">
            <el-form v-loading="loading" :model="registerForm" @keyup.enter="onSubmit">
              <el-form-item prop="mobile">
                <el-input v-model="registerForm.mobile" placeholder="手机号" autofocus />
              </el-form-item>
              <el-form-item prop="code">
                <el-input v-model="registerForm.code" placeholder="验证码">
                  <template #suffix>
                    <el-button link type="primary" @click="getCode"> 获取验证码 </el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="mobilePwd">
                <el-input v-model="mobilePwd" type="password" show-password placeholder="密码由6-20位大写和小写字母和数字组成" />
              </el-form-item>
              <el-form-item prop="mobilePwdRepeat">
                <el-input v-model="mobilePwdRepeat" type="password" show-password placeholder="确认密码" />
              </el-form-item>
              <el-button class="login-button" type="primary" size="large" @click="onSubmit"> 注 册 </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup>
  import { loginApi } from '~/api/login.js'
  import { indexApi } from '~/api'

  const router = useRouter()
  const loading = ref(false)

  // 密码
  const mobilePwd = ref('')
  const mobilePwdRepeat = ref('')

  // 注册信息
  const registerForm = reactive({})
  const { data: websiteInfo } = await useAsyncData('website', async () => {
    return indexApi.websiteInfo()
  })

  useHead({
    title: '用户注册',
    meta: [
      { hid: 'keywords', name: 'keywords', content: '内部培训平台、员工培训、在线学习、在线考试' },
      { hid: 'description', name: 'description', content: websiteInfo.value?.websiteDesc }
    ]
  })

  // 获取验证码
  async function getCode() {
    if (!registerForm.mobile) {
      ElMessage.error('请输入手机号')
      return
    }
    if (!/^1[3456789]\d{9}$/.test(registerForm.mobile)) {
      ElMessage.error('请输入正确的手机号')
      return
    }
    loading.value = true
    try {
      const res = await loginApi.getMobileCode({ mobile: registerForm.mobile })
      ElMessage.success(res)
    } finally {
      loading.value = false
    }
  }

  async function onSubmit() {
    if (!registerForm.mobile) {
      ElMessage.error('请输入手机号')
      return
    }
    if (!/^1[3456789]\d{9}$/.test(registerForm.mobile)) {
      ElMessage.error('请输入正确的手机号')
      return
    }
    if (!mobilePwd.value) {
      ElMessage.error('请输入密码')
      return
    }
    if (mobilePwd.value !== mobilePwdRepeat.value) {
      ElMessage.error('两次密码输入不一致')
      return
    }
    loading.value = true
    try {
      // 密码加密
      registerForm.mobilePwdEncrypt = encrypt(mobilePwd.value, websiteInfo.value.rsaLoginPublicKey)
      const res = await loginApi.register(registerForm)
      ElMessage.success(res)
      await router.replace({ path: '/login' })
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
</script>
<style lang="scss" scoped>
  .login_body {
    background-color: #2256f7;
    min-height: calc(100vh - 130px);
    .login_box {
      width: 100%;
      max-width: 1400px;
      padding: 20px 16px;
      box-sizing: border-box;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 170px);
    }
    .login_logo {
      float: left;
      width: 50%;
    }
    .login_content {
      float: right;
      width: 350px;
      max-width: 100%;
      background-color: #fff;
      padding: 0 40px;
      border-radius: 10px;

      .login_title {
        margin: 30px 0;
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        .login_title_name {
          font-weight: bold;
        }
        a {
          color: #2256f7;
        }
      }
      .login-button {
        width: 100%;
        margin: 10px 0 30px;
      }
    }
  }

  .el-input {
    height: 40px;
    line-height: 40px;
  }

  // 手机：隐藏左侧宣传图，表单占满（二开响应式改造）
  @media (max-width: 768px) {
    .login_body {
      .login_logo {
        display: none;
      }

      .login_content {
        float: none;
        width: 100%;
      }

      .login_pc,
      .login_app {
        padding: 0 20px !important;
      }
    }

    .login-button {
      margin-top: 30px !important;
    }

    .var-input {
      width: calc(100% - 110px);
    }
  }
</style>
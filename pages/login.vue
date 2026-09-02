<template>
  <NuxtLayout>
    <div class="login_body">
      <div class="login_box">
        <div class="login_logo">
          <img src="../assets/image/common_login.png" alt="" />
        </div>
        <div class="login_content">
          <!-- 二开：原为外链 roncoo CDN 的图片，内网访问不到会裂图，改用 Element Plus 图标 -->
          <!-- 账号登录 -->
          <el-icon v-if="isPwdLogin && websiteInfo?.wxPcLoginEnable === '1'" class="login_ico" :size="32" @click="switchLogin"><Grid /></el-icon>
          <!-- 扫码登录 -->
          <el-icon v-if="!isPwdLogin && websiteInfo?.wxPcLoginEnable === '1'" class="login_ico" :size="32" @click="switchLogin"><Monitor /></el-icon>
          <div v-if="isPwdLogin" class="login_pc">
            <div class="login_form">
              <div class="login_title">账号登录</div>
              <el-form v-loading="loading" :model="loginForm" @keyup.enter="handleLogin()">
                <el-form-item class="form-group" prop="mobile">
                  <el-input v-model="loginForm.mobile" placeholder="手机号" autofocus />
                </el-form-item>
                <el-form-item class="form-group" prop="password">
                  <el-input v-model="mobilePwd" placeholder="密码" type="password" show-password />
                </el-form-item>
                <el-form-item class="form-group" prop="verCode">
                  <el-input v-model="loginForm.verCode" class="var-input" placeholder="验证码" />
                  <img class="var-img" :src="verImg" @click="getCaptcha" />
                </el-form-item>
                <div class="login-info">
                  <!-- 链接在 checkbox 的 label 里，点它默认会连带切换勾选状态，故 stop+prevent -->
                  <el-checkbox v-model="loginForm.isAgreement" size="default">
                    登录即同意<span class="blue_text" @click.stop.prevent="agreementVisible = true">《隐私政策》</span>
                  </el-checkbox>
                  <!-- 原为跳「忘记密码」页，那条路要发短信验证码，而平台没配短信平台：
                       请求会真的去调阿里云、因密钥为空而超时，员工看到的却是
                       「操作频繁，请稍后再试」这种完全误导的提示。
                       改成直接说清怎么办，不再把人引进死胡同。 -->
                  <div class="login-info-reset" @click="forgotVisible = true">忘记密码？</div>
                </div>
                <el-button class="login-button" type="primary" size="large" @click="handleLogin()"> 马上登录</el-button>
              </el-form>
              <div class="login_other login_tip">
                <!-- 原为「没有账号，我要注册」。员工账号由管理员统一导入，
                     内部系统不该让人自行注册；注册流程本身也依赖短信，同样是断的 -->
                首次登录请使用本人手机号，初始密码为手机号后 6 位
              </div>
            </div>
          </div>
          <div v-if="!isPwdLogin" class="login_app">
            <iframe v-if="!binding" :src="wxLoginUrl" class="login_iframe" />
            <div v-if="binding" class="login_form">
              <div class="login_title">账号绑定</div>
              <el-form v-loading="loading" :model="bindingForm" @keyup.enter="handleBinding()">
                <el-form-item class="form-group" prop="mobile">
                  <el-input v-model="bindingForm.mobile" placeholder="手机号" autofocus />
                </el-form-item>
                <el-form-item prop="code">
                  <el-input v-model="bindingForm.code" placeholder="验证码">
                    <template #suffix>
                      <el-button link type="primary" @click="getCode"> 获取验证码</el-button>
                    </template>
                  </el-input>
                </el-form-item>
                <div style="color: var(--t-text-weak); margin-bottom: 74px">若手机号没注册，则会自动注册</div>
                <el-button class="login-button" type="primary" size="large" @click="handleBinding()"> 绑定登录 </el-button>
              </el-form>
            </div>
          </div>
        </div>
      </div>
      <common-agreement v-model="agreementVisible" type="privacy" />

      <el-dialog v-model="forgotVisible" title="忘记密码怎么办" width="min(420px, 92vw)" align-center>
        <div class="forgot-body">
          <p>本平台的账号由公司统一创建，密码找回需经管理员核实身份，请按以下方式处理：</p>
          <ol>
            <li><b>还记得密码</b>：登录后在「个人信息 → 修改密码」里自行修改。</li>
            <li><b>完全忘记</b>：联系人力资源部重置，重置后密码恢复为本人手机号后 6 位。</li>
          </ol>
          <p class="dim">初始密码为手机号后 6 位，建议首次登录后尽快修改。</p>
        </div>
        <template #footer>
          <el-button type="primary" @click="forgotVisible = false">我知道了</el-button>
        </template>
      </el-dialog>
    </div>
  </NuxtLayout>
</template>
<script setup>

  import { Grid, Monitor } from '@element-plus/icons-vue'
  import { loginApi } from '~/api/login.js'
  import { encrypt, getBrowserInfo, getOsInfo } from '~/utils/base'
  import { indexApi } from '~/api'
  import { login } from '~/utils/login'

  // 关键词里的站点名取自「参数配置」，不再写死。
  // useWebsiteInfo 必须在 setup 顶层调用——它内部是 useAsyncData，
  // 放进 computed 会在每次求值时重新调用组合式函数。
  const seoSite = useWebsiteInfo()
  const siteKeywords = computed(() => (seoSite.value?.websiteName || '内部培训平台') + '、员工培训、在线学习、在线考试')


  const router = useRouter()
  const route = useRoute()
  const loading = ref(false)
  const binding = ref(false)

  // 隐私政策弹窗
  const agreementVisible = ref(false)
  const forgotVisible = ref(false)

  // 是否为密码登录
  const isPwdLogin = ref(true)
  // 密码
  const mobilePwd = ref('')

  // 登录信息
  const loginForm = reactive({
    verCode: '',
    isAgreement: true
  })
  // 绑定信息
  const bindingForm = reactive({
    isAgreement: true
  })

  const wxLoginUrl = ref('')

  const { data: websiteInfo } = await useAsyncData('website', async () => {
    return indexApi.websiteInfo()
  })

  useHead({
    title: '用户登录',
    meta: [
      { hid: 'keywords', name: 'keywords', content: siteKeywords },
      { hid: 'description', name: 'description', content: websiteInfo.value?.websiteDesc }
    ]
  })

  onMounted(async () => {
    if (route.query.code) {
      // 微信登录
      isPwdLogin.value = false
      // 根据授权码获取用户信息
      try {
        const res = await loginApi.wxCode({
          code: route.query.code,
          loginAuthType: 1,
          clientType: 1,
          os: getOsInfo(),
          browser: getBrowserInfo().name
        })
        if (res.bindingStatus) {
          // 已经绑定直接登录
          login(res.token)
        } else {
          // 进行绑定
          binding.value = true
          bindingForm.unionId = res.userInfo.unionId
          bindingForm.openId = res.userInfo.openid
        }
      } catch (e) {
        isPwdLogin.value = true
        // 重新扫码
        switchLogin()
      }
    }

    if (isPwdLogin.value) {
      // 密码登录，获取验证码
      await getCaptcha()
    }
  })

  // 切换登录方式
  const switchLogin = () => {
    isPwdLogin.value = !isPwdLogin.value
    if (!isPwdLogin.value) {
      const redirectUrl = websiteInfo.value.websiteDomain + 'login'
      loginApi.wxLogin({ loginAuthType: 1, redirectUrl: redirectUrl }).then((res) => {
        wxLoginUrl.value = res
      })
    }

    if (isPwdLogin.value) {
      // 密码登录，获取验证码
      getCaptcha()
    }
  }

  // 获取图形验证码
  const verImg = ref()

  async function getCaptcha() {
    try {
      const res = await loginApi.getCodeImg()
      loginForm.verToken = res.verToken
      verImg.value = res.img
    } catch (error) {
      console.error(error)
    }
  }

  // 获取手机验证码
  async function getCode() {
    if (!bindingForm.mobile) {
      ElMessage.error('请输入手机号')
      return
    }
    if (!/^1[3456789]\d{9}$/.test(bindingForm.mobile)) {
      ElMessage.error('请输入正确的手机号')
      return
    }
    loading.value = true
    try {
      const res = await loginApi.getMobileCode({ mobile: bindingForm.mobile })
      ElMessage.success(res)
    } finally {
      loading.value = false
    }
  }

  async function handleBinding() {
    if (!bindingForm.mobile) {
      ElMessage.error('请输入手机号')
      return
    }
    if (!/^1[3456789]\d{9}$/.test(bindingForm.mobile)) {
      ElMessage.error('请输入正确的手机号')
      return
    }
    loading.value = true
    try {
      // 绑定
      bindingForm.os = getOsInfo()
      bindingForm.browser = getBrowserInfo().name
      const res = await loginApi.wxBinding(bindingForm)
      login(res.token)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function handleLogin() {
    if (!mobilePwd) {
      ElMessage.warning('请输入密码')
      return
    }
    if (!loginForm.verCode) {
      ElMessage.warning('请填写验证码')
      return
    }
    if (!loginForm.isAgreement) {
      ElMessage.warning('请阅读并同意用户协议')
      return
    }
    loading.value = true
    try {
      // 密码加密
      loginForm.mobilePwdEncrypt = encrypt(mobilePwd.value, websiteInfo.value.rsaLoginPublicKey)
      loginForm.os = getOsInfo()
      loginForm.browser = getBrowserInfo().name
      const res = await loginApi.userLogin(loginForm)
      login(res.token)
    } catch (error) {
      console.error(error)
      await getCaptcha()
    } finally {
      loading.value = false
    }
  }
</script>
<style lang="scss" scoped>
  .login_body {
    background-color: var(--t-primary);
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
      min-height: calc(100vh - 130px);
    }

    .login_logo {
      float: left;
      width: 40%;
      margin-right: 10%;
    }

    .login_content {
      float: right;
      width: 400px;
      max-width: 100%;
      min-height: 480px;
      background-color: #fff;
      border-radius: 10px;

      .login_pc {
        padding: 0 40px;
      }

      .login_app {
        height: 100%;
        padding: 0 40px;

        .login_iframe {
          border: none;
          width: 100%;
          height: 100%;
        }
      }
    }

    .login_ico {
      float: right;
    }

    .login_title {
      color: var(--t-primary);
      font-size: 24px;
      margin: 20px auto;
      text-align: center;
    }

    .login-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .login-info-reset {
        color: var(--t-primary);
        // 改成弹窗触发后不再是链接，得自己声明手型
        cursor: pointer;
      }

      // 原项目引用了 .blue_text 但全局没有定义，链接看起来跟普通文字一样，
      // 没有任何可点击的提示
      .blue_text {
        color: var(--t-primary);
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .login-button {
      margin-top: 100px;
    }

    .login_other {
      color: var(--t-primary);
      font-size: 14px;
      overflow: hidden;
      text-align: center;
      margin-bottom: 20px;
    }

    // 首次登录提示不是链接，用弱化的灰色，别和可点的蓝字混淆
    .login_tip {
      color: var(--t-text-weak);
      font-size: 13px;
    }
  }

  .forgot-body {
    font-size: 14px;
    line-height: 1.8;
    color: var(--t-text-regular);

    ol {
      padding-left: 20px;
      margin: 10px 0;
    }

    .dim {
      color: var(--t-text-weak);
      font-size: 13px;
      margin-bottom: 0;
    }
  }

  .var-input {
    width: 220px;
  }

  .var-img {
    margin-left: 20px;
    width: 80px;
  }

  // 手机：左侧宣传图占掉一半空间放不下，隐藏后让登录框独占
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

    // 登录按钮原本靠 100px 上边距推到底部，窄屏下会把内容顶出可视区
    .login-button {
      margin-top: 30px !important;
    }

    .var-input {
      width: calc(100% - 110px);
    }
  }

  .el-input {
    height: 40px;
    line-height: 40px;
  }

  .el-button {
    width: 100%;
    margin: 20px 0;
  }
</style>

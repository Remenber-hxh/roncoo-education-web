<template>
  <el-header>
    <div class="top">
      <div v-if="nav" class="top-nav">
        <a href="/"><img v-if="info" :src="info.websiteLogo" alt="" /></a>
        <div v-for="(item, index) in nav" :key="index" class="top-nav-title">
          <nuxt-link v-if="!isExternalUrl(item.navUrl)" :to="{ path: item.navUrl }" :class="{ active: activeUrl === item.navUrl }">
            {{ item.navTitle }}
          </nuxt-link>
          <a v-else :href="item.navUrl" :target="item.target">{{ item.navTitle }}</a>
        </div>
      </div>
      <div v-if="pathUrl !== '/search'" class="top-search">
        <el-input v-model="search" autofocus placeholder="请输入搜索内容" @keyup.enter="handleSearch">
          <template #prefix>
            <!-- 二开：原为外链 roncoo CDN 的图片，内网访问不到会裂图，改用 Element Plus 图标 -->
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="top-user">
        <div v-if="loginStatus">
          <common-user />
        </div>
        <div v-else>
          <nuxt-link :to="{ name: 'login' }"> 登录</nuxt-link>
          <nuxt-link :to="{ name: 'register' }"> 注册</nuxt-link>
        </div>
      </div>
    </div>
  </el-header>
</template>
<script setup>
  import { Search } from '@element-plus/icons-vue'
  import { indexApi } from '~/api/index.js'
  import { getStorage, setStorage } from '~/utils/storage.js'

  // 网站信息
  const info = ref({})
  // 导航信息
  const nav = ref([])
  //
  const loginStatus = ref(false)

  // 搜索
  const pathUrl = useRoute().path
  const search = ref('')
  const activeUrl = ref(useRoute().path)

  onMounted(() => {
    // 站点信息
    info.value = getStorage('WebsiteInfo')
    if (!info.value) {
      indexApi.websiteInfo().then((res) => {
        setStorage('WebsiteInfo', res, 60)
        info.value = res
      })
    }

    // 导航信息
    nav.value = getStorage('WebsiteNav')
    if (!nav.value) {
      indexApi.websiteNav().then((res) => {
        setStorage('WebsiteNav', res, 60)
        nav.value = res
      })
    }
    const token = getToken()
    if (token) {
      loginStatus.value = true
    }
  })

  // 搜索
  function handleSearch() {
    useRouter().push({ name: 'search', query: { kw: search.value } })
  }
</script>
<style lang="scss" scoped>
  .el-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 999;
    height: 70px;
    display: flex;
    justify-content: center;
    border: 1px solid #ebeef5;
  }

  .active {
    color: #46c37b;
  }

  .top {
    // 原为 width/min-width 均 1200px。min-width 禁止头部收窄，
    // 是手机上整页横向溢出的元凶，改为最大宽度限制。
    width: 100%;
    max-width: 1200px;
    padding: 0 16px;
    box-sizing: border-box;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    .top-nav {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .top-nav-title {
        margin-left: 30px;
        font-size: 18px;
      }
    }

    .top-search {
      // 中间搜索框吸收剩余空间，窄屏时自动变窄而不是把两侧挤出去
      flex: 1;
      min-width: 0;
      margin: 0 16px;

      .el-input {
        height: 35px;
        line-height: 35px;
      }

      img {
        width: 20px;
        height: 20px;
      }
    }

    .top-user {
      flex-shrink: 0;

      img {
        border-radius: 50%;
      }

      a {
        font-size: 16px;
        margin-left: 10px;
      }
    }

    img {
      height: 35px;
      width: auto;
    }
  }

  // 手机：导航项和搜索框都放不下，隐藏导航文字与搜索，只留 Logo 和用户入口。
  // 课程入口在首页和底部都有，藏掉顶部导航不影响主链路。
  @media (max-width: 768px) {
    .top {
      padding: 0 12px;

      .top-nav {
        .top-nav-title {
          display: none;
        }
      }

      .top-search {
        display: none;
      }

      .top-user a {
        font-size: 14px;
      }

      img {
        height: 28px;
      }
    }
  }
</style>

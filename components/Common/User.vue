<template>
  <client-only>
    <el-dropdown>
      <span class="el-dropdown-link">
        <!-- 原来没头像时用一张通用人头图，谁看都一样。改成姓名首字，能认出是自己 -->
        <common-avatar :url="userInfo?.userHead" :name="userInfo?.nickname" :size="35" />
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <nuxt-link :to="{ name: 'account-course' }"> 我的课程 </nuxt-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <nuxt-link :to="{ name: 'account-collect' }"> 我的收藏 </nuxt-link>
          </el-dropdown-item>
          <el-dropdown-item>
          </el-dropdown-item>
          <el-dropdown-item>
            <nuxt-link :to="{ name: 'account-user' }"> 个人信息 </nuxt-link>
          </el-dropdown-item>
          <el-dropdown-item @click="handleLogout"> 安全退出 </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </client-only>
</template>
<script setup>
  import { userApi } from '~/api/user'
  import { logout } from '~/utils/login'

  const userInfo = ref(null)
  onMounted(async () => {
    userInfo.value = await userApi.getUserInfo()
  })

  // 退出登录
  function handleLogout() {
    ElMessageBox.confirm('确认退出', '退出登录', {
      confirmButtonText: '确认',
      showCancelButton: false,
      type: 'warning'
    }).then(() => {
      logout()
      location.reload()
    })
  }
</script>
<style lang="scss" scoped>
  .header-image {
    border-radius: 50%;
    height: 40px;
  }
</style>

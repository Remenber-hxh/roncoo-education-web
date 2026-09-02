<template>
  <common-header />
  <el-main>
    <el-container class="main">
      <el-aside>
        <el-affix :offset="91">
          <client-only>
            <el-menu :default-active="defaultActive">
              <nuxt-link v-for="(item, index) in menuList" :key="index" :to="{ name: item.name }">
                <el-menu-item :index="item.name">
                  <img :src="item.icon" class="img-icon" /> {{ item.title }}
                  <el-badge v-if="item.name === 'account-notice' && unread > 0" :value="unread" :max="99" class="menu-badge" />
                </el-menu-item>
              </nuxt-link>
            </el-menu>
          </client-only>
        </el-affix>
      </el-aside>

      <div class="account">
        <slot />
      </div>
    </el-container>
    <common-footer />
  </el-main>
  <common-tab-bar />
</template>
<script setup>
  import course from 'assets/svg/account/course.svg'
  import collect from 'assets/svg/account/collect.svg'
  import order from 'assets/svg/account/order.svg'
  import user from 'assets/svg/account/user.svg'

  useHead({
    title: '用户中心'
  })

  const route = useRoute()
  const defaultActive = ref(route.name)

  const menuList = [
    {
      name: 'account-course',
      icon: course,
      title: '我的课程'
    },
    {
      name: 'account-exam',
      icon: course,
      title: '我的考试'
    },
    {
      name: 'account-notice',
      icon: order,
      title: '我的消息'
    },
    {
      name: 'account-collect',
      icon: collect,
      title: '我的收藏'
    },
    {
      name: 'account-user',
      icon: user,
      title: '个人信息'
    }
  ]

  // 未读角标。放在布局里而不是消息页里，这样在「我的课程」等
  // 任意个人中心页面都能看到有没有新催办。
  // 用共享状态而不是本地 ref：消息页标记已读后，这里的角标要跟着变
  const unread = useUnreadCount()
  onMounted(refreshUnread)
</script>
<style lang="scss" scoped>
  .account {
    width: calc(100% - 200px);
    padding: 20px;
    background: #fff;
    margin-bottom: 20px;
    border-radius: 5px;
  }
  .el-aside {
    width: 200px;
    margin-right: 20px;
    text-align: center;
    min-height: calc(100vh - 150px);
    ul {
      border-right: none;
      padding: 10px;
      border-radius: 10px;
      li {
        margin: 10px;
      }
      .is-active {
        background: var(--t-primary-light);
        border-radius: 4px;
        color: var(--t-primary);
      }
    }
    .img-icon {
      width: 20px;
      margin-right: 5px;
    }
    // 角标跟在文字后面，不要顶到菜单项外面去
    .menu-badge {
      margin-left: 8px;
      transform: translateY(-2px);
    }
  }

  /* 同 default.vue：固定高度改为 min-height + flex，避免内容不足一屏时页脚下方留大片空白 */
  .el-main {
    padding: 20px 0 0;
    margin: 70px auto 0;
    min-height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
  }

  // ============================================================
  // 手机适配（二开）
  //
  // 原为「左侧 200px 菜单 + 右侧内容」两栏。375px 的屏上菜单要吃掉一半宽度，
  // 改为菜单横排在顶部、内容占满整宽。
  // el-affix 会把菜单吸顶固定，横排后会盖住正文，这里把它还原成随页面滚动。
  // ============================================================
  @media (max-width: 768px) {
    // 给固定定位的底部标签栏垫出高度，否则会盖住页面末尾
    .el-main {
      margin-top: 58px;
      padding-bottom: calc(52px + env(safe-area-inset-bottom));
    }

    .main {
      flex-direction: column;
    }

    .el-aside {
      width: 100%;
      margin-right: 0;
      min-height: auto;

      :deep(.el-affix) {
        height: auto !important;
      }

      :deep(.el-affix > div) {
        position: static !important;
        width: auto !important;
      }

      ul {
        display: flex;
        padding: 4px;
        // 菜单项多时可横向滑动，不换行也不溢出页面
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        a {
          flex-shrink: 0;
        }

        li {
          margin: 4px;
          height: 42px;
          line-height: 42px;
          font-size: 14px;
          padding: 0 12px !important;
        }
      }
    }

    .account {
      width: 100%;
      box-sizing: border-box;
      padding: 16px 12px;
    }
  }
</style>

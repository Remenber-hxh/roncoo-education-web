<template>
  <!-- 只在手机宽度出现。十月要把员工端嵌进企业微信工作台，
       打开就是手机 H5，顶部导航在窄屏已被隐藏，需要一个固定的底部入口。 -->
  <nav class="tab-bar">
    <nuxt-link v-for="t in tabs" :key="t.path" :to="t.path" class="tab-item" :class="{ active: isActive(t) }">
      <el-icon :size="20">
        <component :is="t.icon" />
      </el-icon>
      <span class="tab-label">{{ t.label }}</span>
    </nuxt-link>
  </nav>
</template>

<script setup>
  import { House, Reading, EditPen, User } from '@element-plus/icons-vue'

  const route = useRoute()

  const tabs = [
    { path: '/', label: '首页', icon: House, exact: true },
    { path: '/course/list', label: '课程', icon: Reading },
    { path: '/account/exam', label: '考试', icon: EditPen },
    { path: '/account/course', label: '我的', icon: User }
  ]

  // 首页要精确匹配，否则任何路径都会以 '/' 开头把它点亮
  function isActive(t) {
    return t.exact ? route.path === t.path : route.path.startsWith(t.path)
  }
</script>

<style lang="scss" scoped>
  .tab-bar {
    display: none;
  }

  @media (max-width: 768px) {
    .tab-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: flex;
      background: #fff;
      border-top: 1px solid #ebeef5;
      // 全面屏底部有安全区，不加会被小横条压住
      padding-bottom: env(safe-area-inset-bottom);
    }

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      height: 52px;
      color: #909399;
      font-size: 11px;
      text-decoration: none;

      &.active {
        color: #2256f6;
      }
    }

    .tab-label {
      line-height: 1;
    }
  }
</style>

<template>
  <common-header />
  <el-main>
    <div class="page-content">
      <slot />
    </div>
    <common-footer />
  </el-main>
</template>
<script setup></script>
<style lang="scss" scoped>
  /*
   * 原先 el-main 是固定高度 height: calc(100vh - 70px) + overflow:auto，
   * 内容不足一屏时页脚紧跟内容排完，容器剩余高度全成了空白。
   * 改为 min-height + 纵向 flex：内容区 flex:1 撑开，把页脚顶到底部；
   * 内容超过一屏时页面自然滚动（头部是 position:fixed，不受影响）。
   */
  .el-main {
    padding: 0;
    margin: 70px auto 0;
    min-height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
  }

  .page-content {
    flex: 1;
  }
</style>

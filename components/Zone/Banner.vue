<template>
  <div class="banner">
    <div class="carousel">
      <el-carousel height="360px">
        <el-carousel-item v-for="(item, index) in carouselList" :key="index">
          <a :href="item.carouselUrl" :title="item.carouselTitle" :target="item.carouselTarget">
            <img :src="item.carouselImg" alt="item.carouselTitle" />
          </a>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>
<script setup>
  import { indexApi } from '~/api/index.js'
  // 轮播
  const carouselList = ref()
  onMounted(async () => {
    carouselList.value = await indexApi.carouselList()
  })
</script>
<style lang="scss" scoped>
  .banner {
    position: relative;
    // 原为写死 1200px，窄屏会撑破视口
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    display: flex;
    justify-content: space-between;
    .carousel {
      width: 100%;
      //margin-left: 200px;
      img {
        width: 100%;
        height: 100%;
        //border-radius: 0 10px 10px 0;
        border-radius: 10px;
      }
    }
  }

  // 手机：360px 高的轮播在 375 宽的屏上几乎是正方形，图会被裁得只剩中间一条。
  // el-carousel 的高度是内联样式，只能用 !important 覆盖。
  @media (max-width: 768px) {
    .banner {
      margin: 12px auto;

      .carousel :deep(.el-carousel__container) {
        height: 180px !important;
      }
    }
  }
</style>

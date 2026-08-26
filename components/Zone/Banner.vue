<template>
  <div class="banner">
    <div class="carousel">
      <el-carousel height="360px">
        <el-carousel-item v-for="(item, index) in carouselList" :key="index">
          <a class="slide" :href="item.carouselUrl" :title="item.carouselTitle" :target="item.carouselTarget">
            <img :src="item.carouselImg" :alt="item.carouselTitle" />
            <!-- 标题叠在图上渲染，不再烧进图片里。
                 原来 banner1.svg 直接把「内部培训学习平台」画在图上，
                 后台改了轮播标题也不会变，只能重新做图。 -->
            <!-- 轮播表只有 carousel_title，没有副标题字段 -->
            <div v-if="item.carouselTitle" class="slide-caption">
              <div class="slide-title">{{ item.carouselTitle }}</div>
            </div>
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

      .slide {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
      }

      .slide-caption {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        transform: translateY(-50%);
        text-align: center;
        color: #fff;
        padding: 0 24px;
        // 浅色图上也要看得清
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        pointer-events: none;
      }

      .slide-title {
        font-size: 44px;
        font-weight: 700;
        line-height: 1.3;
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

      // 44px 的标题在 375px 屏上会撑破，跟着缩
      .slide-title {
        font-size: 22px;
      }
    }
  }
</style>

<template>
  <!-- 暂没数据 -->
  <div v-if="props.list.length === 0" class="no-data">暂无数据</div>
  <el-row v-else class="zone_body" :gutter="20">
    <!-- 响应式栅格：手机1列、大手机/小平板2列、平板3列、桌面4列 -->
    <el-col v-for="(course, int) in props.list" :key="int" :xs="24" :sm="12" :md="8" :lg="6" class="zone_body_course">
      <nuxt-link target="_blank" :to="{ name: 'course-detail', query: { id: course.id } }">
        <img :src="course.courseLogo" alt="" />
        <div class="course_name" v-html="course.courseName" />
        <div class="course_desc">
          <div class="collect">
            <course-collect :course-id="course.id" />
          </div>
        </div>
      </nuxt-link>
    </el-col>
  </el-row>
</template>
<script setup>
  const props = defineProps({
    list: {
      type: Array,
      default: () => []
    }
  })
</script>
<style lang="scss" scoped>
  .zone_body {
    .zone_body_course {
      // 原为固定 255px；封面改成按宽度等比缩放后，卡片高度也要跟着自适应
      border-radius: 6px;
      margin: 10px 0;

      &:hover {
        box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
        transition: all 0.3s;
      }

      a {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        background: #fff;
        border-radius: 6px;

        &:hover {
          color: #000;
          text-decoration: none;
        }

        .course_name {
          font-size: 16px;
          margin-top: 5px;
          padding-left: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 25px;
          height: 50px;
        }

        .course_desc {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .price_box {
            font-size: 16px;
            margin-top: 5px;
            margin-left: 10px;
            color: red;
          }

          .collect {
            margin-right: 8px;
            font-size: 12px;
          }
        }
      }
    }
    img {
      // 原为写死 285x158，窄屏会溢出卡片。改为占满卡片宽度并保持 16:9
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      display: block;
      border-radius: 6px 6px 0 0;
    }
  }
</style>

<template>
  <NuxtLayout>
    <div class="lecturer">
      <div class="lecturer-info">
        <img :src="lecturerInfo.lecturerHead" :alt="lecturerInfo.lecturerName" />
        <div class="item-info">
          <div>{{ lecturerInfo.lecturerName }} {{ lecturerInfo.lecturerPosition }}</div>
          <div v-html="lecturerInfo.introduce" />
        </div>
      </div>
    </div>
    <div class="course">
      <div v-if="lecturerInfo.courseViewVO.length > 0" class="course-info">
        <!-- 课程列表 -->
        <course-list :list="lecturerInfo.courseViewVO" />
      </div>
      <div v-else class="no-data">暂无数据</div>
    </div>
  </NuxtLayout>
</template>
<script setup>

  import { lecturerApi } from '~/api/lecturer'

  // 关键词里的站点名取自「参数配置」，不再写死。
  // useWebsiteInfo 必须在 setup 顶层调用——它内部是 useAsyncData，
  // 放进 computed 会在每次求值时重新调用组合式函数。
  const seoSite = useWebsiteInfo()
  const siteKeywords = computed(() => (seoSite.value?.websiteName || '内部培训平台') + '、员工培训、在线学习、在线考试')

  const route = useRoute()
  const { data: lecturerInfo } = await useAsyncData('lecturer-detail' + route.query.id, async () => {
    return lecturerApi.lecturerDetail({ id: route.query.id })
  })
  useHead({
    title: lecturerInfo.value?.lecturerName,
    meta: [
      { hid: 'keywords', name: 'keywords', content: siteKeywords },
      { hid: 'description', name: 'description', content: lecturerInfo.value?.introduce }
    ]
  })
</script>
<style lang="scss" scoped>
  .lecturer {
    background: #39364d;
    color: #fff;

    .lecturer-info {
      width: 100%;
      max-width: 1200px;
      box-sizing: border-box;
      margin: 0 auto;
      border-radius: 10px;
      padding: 20px 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .item-info {
        margin-left: 20px;
        font-size: 14px;
        line-height: 25px;
      }
    }
  }

  .course {
    .course-info {
      width: 100%;
      max-width: 1200px;
      box-sizing: border-box;
      padding: 0 16px;
      margin: 0 auto;
    }
  }

  // 手机：头像 150px + 简介横排会挤，改为上下堆叠并缩小头像
  @media (max-width: 768px) {
    .lecturer {
      .lecturer-info {
        flex-direction: column;
        text-align: center;

        img {
          width: 90px;
          height: 90px;
        }

        .item-info {
          margin-left: 0;
          margin-top: 12px;
        }
      }
    }
  }
</style>

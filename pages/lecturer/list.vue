<template>
  <NuxtLayout>
    <div class="main course-list">
      <!-- 讲师列表 -->
      <lecturer-list v-loading="page.loading" :list="page.list" />

      <!-- 分页功能 -->
      <div v-if="page.totalCount >= 1" class="pagination clearfix">
        <common-pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup>

  import useTable from '~/utils/table.js'
  import { indexApi } from '~/api'
  import { lecturerApi } from '~/api/lecturer'

  // 关键词里的站点名取自「参数配置」，不再写死。
  // useWebsiteInfo 必须在 setup 顶层调用——它内部是 useAsyncData，
  // 放进 computed 会在每次求值时重新调用组合式函数。
  const seoSite = useWebsiteInfo()
  const siteKeywords = computed(() => (seoSite.value?.websiteName || '内部培训平台') + '、员工培训、在线学习、在线考试')


  // 分页查询
  const { page, handlePage } = useTable({
    page: lecturerApi.lecturerList
  })

  const { data } = useAsyncData('website', async () => {
    return indexApi.websiteInfo()
  })
  useHead({
    title: '讲师列表',
    meta: [
      { hid: 'keywords', name: 'keywords', content: siteKeywords },
      { hid: 'description', name: 'description', content: data.value?.websiteDesc }
    ]
  })
</script>
<style lang="scss" scoped>
  .course-list {
    padding: 10px 0;
  }
</style>

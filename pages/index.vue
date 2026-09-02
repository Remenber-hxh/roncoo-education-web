<template>
  <NuxtLayout>
    <div class="main">
      <zone-banner />
      <zone-course />
    </div>
    <!-- 二开：移除友情链接。这是对外门户网站的概念，
         公司内部培训平台不会往外链，留着只会让页脚显得像个半成品 -->
  </NuxtLayout>
</template>
<script setup>

  import { indexApi } from '~/api'

  // 关键词里的站点名取自「参数配置」，不再写死。
  // useWebsiteInfo 必须在 setup 顶层调用——它内部是 useAsyncData，
  // 放进 computed 会在每次求值时重新调用组合式函数。
  const seoSite = useWebsiteInfo()
  const siteKeywords = computed(() => (seoSite.value?.websiteName || '内部培训平台') + '、员工培训、在线学习、在线考试')


  const { data } = await useAsyncData('website', async () => {
    return indexApi.websiteInfo()
  })

  useHead({
    title: data.value?.websiteName,
    meta: [
      { hid: 'keywords', name: 'keywords', content: siteKeywords },
      { hid: 'description', name: 'description', content: data.value?.websiteDesc }
    ]
  })
</script>
<style lang="scss" scoped></style>

<template>
  <NuxtLayout>
    <div class="main">
      <zone-banner />
      <zone-course />
    </div>
    <common-link />
  </NuxtLayout>
</template>
<script setup>
  import { indexApi } from '~/api'

  const { data } = await useAsyncData('website', async () => {
    return indexApi.websiteInfo()
  })

  useHead({
    title: data.value?.websiteName,
    meta: [
      { hid: 'keywords', name: 'keywords', content: '内部培训平台、员工培训、在线学习、在线考试' },
      { hid: 'description', name: 'description', content: data.value?.websiteDesc }
    ]
  })
</script>
<style lang="scss" scoped></style>

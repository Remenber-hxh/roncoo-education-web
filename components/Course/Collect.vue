<template>
  <div class="collect" @click="handleCollect">
    <!-- 二开：原为外链 roncoo CDN 的图片，内网访问不到会裂图，改用 Element Plus 图标 -->
    <el-icon class="collect-icon" :class="{ on: status }" :size="20">
      <StarFilled v-if="status" />
      <Star v-else />
    </el-icon>
    <span>收藏</span>
  </div>
</template>

<script setup>
  import { Star, StarFilled } from '@element-plus/icons-vue'
  import { courseApi } from '~/api/course'

  const props = defineProps({
    courseId: {
      type: String,
      default: ''
    },
    collectStatus: {
      type: Boolean,
      default: false
    }
  })

  const { collectStatus } = toRefs(props)
  const status = ref(false)
  watch(
    collectStatus,
    (newValue) => {
      status.value = newValue
    },
    {
      immediate: true
    }
  )

  const handleCollect = () => {
    courseApi.courseCollectAdd({ courseId: props.courseId }).then((res) => {
      if (res && res === 'add') {
        status.value = true
        ElMessage.success('收藏成功')
      } else {
        status.value = false
        ElMessage.success('取消收藏')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .collect {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    float: right;
    margin-left: 20px;

    .collect-icon {
      margin-right: 4px;

      &.on {
        color: #f7ba2a;
      }
    }
  }
</style>

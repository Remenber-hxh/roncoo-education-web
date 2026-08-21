<template>
  <img v-if="src" :src="src" :alt="name" class="user-avatar" :style="sizeStyle" @error="onError" />
  <!-- 没有头像时用姓名首字兜底，不再渲染 <img> 免得出现裂图 -->
  <span v-else class="user-avatar text-avatar" :style="[sizeStyle, { backgroundColor: color }]">{{ initial }}</span>
</template>

<script setup>
  const props = defineProps({
    url: { type: String, default: '' },
    name: { type: String, default: '' },
    size: { type: Number, default: 40 }
  })

  // 图片加载失败也降级：库里存了地址但文件没了同样会裂图
  const broken = ref(false)
  watch(
    () => props.url,
    () => (broken.value = false)
  )
  const onError = () => (broken.value = true)

  const src = computed(() => (props.url && !broken.value ? props.url : ''))
  const initial = computed(() => (props.name ? props.name.trim().charAt(0) : '?'))

  const sizeStyle = computed(() => ({
    width: props.size + 'px',
    height: props.size + 'px',
    lineHeight: props.size + 'px',
    fontSize: Math.round(props.size * 0.45) + 'px'
  }))

  const PALETTE = ['#5b8ff9', '#5ad8a6', '#5d7092', '#f6bd16', '#6f5ef9', '#6dc8ec', '#945fb9', '#ff9845', '#1e9493', '#ff99c3']
  const color = computed(() => {
    const s = props.name || ''
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0
    }
    return PALETTE[h % PALETTE.length]
  })
</script>

<style lang="scss" scoped>
  .user-avatar {
    display: inline-block;
    border-radius: 50%;
    vertical-align: middle;
    object-fit: cover;
    flex-shrink: 0;
  }
  .text-avatar {
    text-align: center;
    color: #fff;
    user-select: none;
  }
</style>

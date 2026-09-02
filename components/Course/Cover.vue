<template>
  <!-- 有封面就用封面；加载失败也退回占位图，避免裂图 -->
  <img v-if="src && !failed" :src="src" :alt="name" class="cover-img" @error="failed = true" />
  <div v-else class="cover-fallback" :style="{ background: bg }">
    <span class="cover-text">{{ short }}</span>
    <span v-if="moduleName" class="cover-tag">{{ moduleName }}</span>
  </div>
</template>

<script setup>
  /**
   * 课程封面（二开新增）。
   *
   * 课程封面全靠人工上传，没传就是一张裂图或空白——
   * 列表里几门课各是一张随手截的图，整个页面看着就不像正经系统。
   * 这里在没有封面时按课程名生成占位图，底色由课程名哈希决定：
   * 同一门课每次进来颜色一致，不同课程之间又能区分开。
   */
  const props = defineProps({
    src: { type: String, default: '' },
    name: { type: String, default: '' },
    // 所属模块名称，有就在角标上显示
    moduleName: { type: String, default: '' }
  })

  const failed = ref(false)
  // 换了一门课要重新给机会加载，否则列表翻页后所有卡片都停在失败态
  watch(() => props.src, () => (failed.value = false))

  // 六种底色，色相跨度拉开，保证相邻卡片不会撞色
  const PALETTE = [
    'linear-gradient(135deg, #4a7dff 0%, #2f5fd8 100%)',
    'linear-gradient(135deg, #3fb98c 0%, #2a8f68 100%)',
    'linear-gradient(135deg, #f0912f 0%, #d1701a 100%)',
    'linear-gradient(135deg, #8a63d2 0%, #6742ad 100%)',
    'linear-gradient(135deg, #e5636b 0%, #c04049 100%)',
    'linear-gradient(135deg, #3aa8bf 0%, #24808f 100%)'
  ]

  const bg = computed(() => {
    const key = props.name || ''
    let h = 0
    for (let i = 0; i < key.length; i++) {
      h = (h * 31 + key.charCodeAt(i)) >>> 0
    }
    return PALETTE[h % PALETTE.length]
  })

  // 占位图上最多放 8 个字，再长就截断——字号已经很大，塞满会挤成一团
  const short = computed(() => {
    const n = (props.name || '课程').trim()
    return n.length > 8 ? n.slice(0, 8) + '…' : n
  })
</script>

<style lang="scss" scoped>
  .cover-img,
  .cover-fallback {
    width: 100%;
    aspect-ratio: 16 / 9;
    display: block;
    border-radius: 6px 6px 0 0;
  }

  .cover-img {
    object-fit: cover;
  }

  .cover-fallback {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .cover-text {
    color: #fff;
    font-size: clamp(15px, 2.2vw, 20px);
    font-weight: 600;
    line-height: 1.4;
    text-align: center;
    letter-spacing: 1px;
    // 长课程名换行后不至于顶出卡片
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cover-tag {
    position: absolute;
    left: 10px;
    top: 10px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.92);
    background: rgba(0, 0, 0, 0.22);
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
  }
</style>

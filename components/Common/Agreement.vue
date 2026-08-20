<template>
  <el-dialog v-model="show" :title="title" width="min(720px, 92vw)" align-center append-to-body class="agreement-dialog">
    <div v-loading="loading" class="agreement-body">
      <!-- 正文由后台「参数配置」里的富文本编辑器录入，故用 v-html 渲染 -->
      <div v-if="content" class="agreement-content" v-html="content" />
      <!-- 内容没录入时给出明确提示，而不是弹一个空白框让人以为页面坏了 -->
      <el-empty v-else-if="!loading" :description="emptyTip" :image-size="80" />
    </div>
    <template #footer>
      <el-button type="primary" @click="show = false">我知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { indexApi } from '~/api/index.js'
  import { getStorage, setStorage } from '~/utils/storage.js'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    // 对应站点配置里的三个富文本项
    type: {
      type: String,
      default: 'privacy',
      validator: (v) => ['privacy', 'agreement', 'about'].includes(v)
    }
  })
  const emit = defineEmits(['update:modelValue'])

  const show = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })

  const TYPE_MAP = {
    privacy: { title: '隐私政策', field: 'websitePrivacyPolicy' },
    agreement: { title: '用户协议', field: 'websiteUserAgreement' },
    about: { title: '关于我们', field: 'websiteAboutUs' }
  }
  const title = computed(() => TYPE_MAP[props.type].title)
  const emptyTip = computed(() => `管理员尚未设置${title.value}内容`)

  const info = ref({})
  const loading = ref(false)
  const content = computed(() => info.value?.[TYPE_MAP[props.type].field] || '')

  // 与 Header/Footer 一致：优先用本地缓存的站点信息，缓存未命中再请求。
  // 登录页在 Header 之外单独用到，不能假定缓存一定已写入。
  async function loadInfo() {
    if (content.value) return
    const cached = getStorage('WebsiteInfo')
    if (cached) {
      info.value = cached
      if (content.value) return
    }
    loading.value = true
    try {
      const res = await indexApi.websiteInfo()
      setStorage('WebsiteInfo', res, 60)
      info.value = res
    } finally {
      loading.value = false
    }
  }

  onMounted(loadInfo)
  // 首次打开时若仍无内容再取一次，避免缓存里是旧的空值
  watch(show, (v) => v && loadInfo())
</script>

<style lang="scss" scoped>
  .agreement-body {
    // 正文可能很长，弹窗内部滚动，不要把整个页面撑高
    max-height: 60vh;
    overflow-y: auto;
  }

  .agreement-content {
    font-size: 14px;
    line-height: 1.8;
    color: #333;
    // 富文本里可能带宽图或宽表格，限制住避免撑破弹窗
    :deep(img),
    :deep(table) {
      max-width: 100%;
    }
    :deep(table) {
      display: block;
      overflow-x: auto;
    }
  }

  @media (max-width: 768px) {
    .agreement-body {
      max-height: 65vh;
    }
    .agreement-content {
      font-size: 13px;
    }
  }
</style>

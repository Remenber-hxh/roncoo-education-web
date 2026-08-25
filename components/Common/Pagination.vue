<!-- 基于 element-plus 的 el-pagination 简单封装，方便统一 -->
<template>
  <el-pagination
    v-show="props.total > 0"
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="props.total"
    :background="true"
    :page-sizes="[20, 50, 100, 200]"
    :layout="layout"
    :pager-count="isMobile ? 5 : 7"
    :small="isMobile"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>
<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'

  const props = defineProps({
    // 总条目数
    total: {
      required: true,
      type: Number
    },
    // 当前页数
    currentPage: {
      type: Number,
      default: 1
    },
    // 每页条数
    pageSize: {
      type: Number,
      default: 20
    }
  })

  // 手机上塞不下 6 个部件：实测 375px 屏宽下整条分页有 412px，
  // 右侧「前往第几页」被裁在屏外，点不到。窄屏只保留翻页本身。
  const isMobile = ref(false)
  const layout = computed(() => (isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'))

  const syncMobile = () => (isMobile.value = window.innerWidth <= 768)
  onMounted(() => {
    syncMobile()
    window.addEventListener('resize', syncMobile)
  })
  onUnmounted(() => window.removeEventListener('resize', syncMobile))

  const emit = defineEmits(['update:current-page', 'update:page-size', 'pagination'])
  const currentPage = computed({
    get() {
      return props.currentPage
    },
    set(val) {
      emit('update:current-page', val)
    }
  })
  const pageSize = computed({
    get() {
      return props.pageSize
    },
    set(val) {
      emit('update:page-size', val)
    }
  })
  const handleSizeChange = (val) => {
    if (currentPage.value * val > props.total) {
      currentPage.value = 1
    }
    emit('pagination', { currentPage: currentPage.value, pageSize: val })
  }
  const handleCurrentChange = (val) => {
    emit('pagination', { currentPage: val, pageSize: pageSize.value })
  }

  defineOptions({ name: 'Pagination' })
</script>

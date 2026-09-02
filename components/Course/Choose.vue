<template>
  <div class="search_type_list">
    <div class="tag">
      <p>{{ changeNumToHan(index + 1) }}级分类：</p>
      <div class="item_box">
        <span v-for="(item, index) in menu.list" :key="index" class="search_type_item" :data-id="item.id" :class="{ active: map.key === item.id }" @click="handleClick(item)">
          {{ item.categoryName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { changeNumToHan } from '~/utils/base'

  const props = defineProps({
    menu: {
      type: Object,
      default: () => {
        return { active: '', list: [] }
      }
    },
    index: {
      type: Number,
      default: () => {
        return 0
      }
    }
  })
  const { menu, index } = toRefs(props)
  const map = reactive({
    key: ''
  })
  watch(
    menu,
    (val) => {
      if (val) {
        map.key = val.active
      }
    },
    { immediate: true }
  )
  const emit = defineEmits(['change'])
  const handleClick = (row) => {
    if (row.id !== map.key) {
      map.key = row.id
      emit('change', index.value, row)
    }
  }
</script>

<style scoped lang="scss">
  .search_type_list {
    display: flex;
    line-height: 20px;
    p {
      font-weight: bold;
    }
    .tag {
      display: flex;
      align-items: center;
      .item_box {
        flex: 1;
      }
    }

    .search_type_item {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      color: var(--t-text);
      cursor: pointer;
      margin-right: 10px;
      padding: 5px 8px;
      &.not_right {
        margin-right: 0;
      }

      &.active {
        color: var(--t-primary);
        font-weight: bold;
        background: var(--t-primary-light);
        border-radius: 5px;
      }
    }
  }

  // ============================================================
  // 手机适配（二开）
  //
  // 六个模块在 375px 屏上会折成两行，而「一级分类：」这个标签
  // 是 flex 的第一项、没有 flex-shrink 限制，被右侧挤得只剩半截。
  // 手机上把标签藏掉（分类项本身已经说明了这是分类），
  // 分类改为一行横向滑动。
  // ============================================================
  @media (max-width: 768px) {
    .search_type_list {
      p {
        display: none;
      }

      .tag {
        width: 100%;
      }

      .item_box {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        // 滚动条在手机上是多余的视觉噪音
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .search_type_item {
        flex: 0 0 auto;
        white-space: nowrap;
      }
    }
  }
</style>

<template>
  <NuxtLayout name="account">
    <div class="notice-head">
      <span class="notice-title">我的消息</span>
      <el-button v-if="unread > 0" size="small" text type="primary" @click="handleReadAll"> 全部标记为已读 </el-button>
    </div>

    <el-table v-loading="page.loading" :border="false" :data="page.list" :show-header="false">
      <el-table-column>
        <template #default="scope">
          <div class="notice-item" :class="{ 'is-unread': scope.row.isRead === 0 }">
            <div class="notice-line">
              <span v-if="scope.row.isRead === 0" class="dot" />
              <span class="subject">{{ scope.row.title }}</span>
              <span class="time">{{ formatTime(scope.row.gmtCreate) }}</span>
            </div>
            <!-- 正文里的附言是换行拼上去的，用 pre-line 保住这个换行 -->
            <div class="body">{{ scope.row.content }}</div>
            <div v-if="scope.row.courseId" class="actions">
              <el-button size="small" type="primary" plain @click="goStudy(scope.row)"> 去学习 </el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!page.loading && !page.list.length" description="暂无消息" :image-size="90" />

    <div v-if="page.totalCount >= 1" class="pagination">
      <common-pagination
        v-model:current-page="page.pageCurrent"
        v-model:page-size="page.pageSize"
        :total="page.totalCount"
        @pagination="handlePage"
      />
    </div>
  </NuxtLayout>
</template>

<script setup>
  import useTable from '~/utils/table.js'
  import { noticeApi } from '~/api/notice.js'

  const { page, handlePage } = useTable({
    page: noticeApi.list
  })

  // 与侧边栏角标共用同一份状态，这里改了那边立刻跟着变
  const unread = useUnreadCount()

  onMounted(refreshUnread)

  const formatTime = (t) => {
    if (!t) return ''
    // 后端返回的是 'yyyy-MM-dd HH:mm:ss'，只留到分钟
    return String(t).slice(0, 16).replace('T', ' ')
  }

  const handleReadAll = async () => {
    await noticeApi.readAll()
    ElMessage.success('已全部标记为已读')
    unread.value = 0
    handlePage()
  }

  // 点「去学习」顺手把这条标记已读——员工点进去学了，
  // 消息还挂着未读角标没有意义
  const goStudy = async (row) => {
    if (row.isRead === 0) {
      await noticeApi.read(row.id)
      row.isRead = 1
      unread.value = Math.max(0, unread.value - 1)
    }
    navigateTo({ name: 'course-detail', query: { id: row.courseId } })
  }
</script>

<style lang="scss" scoped>
  .notice-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .notice-title {
    font-size: 16px;
    font-weight: 500;
  }
  .notice-item {
    padding: 4px 0;
  }
  .notice-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--t-danger);
    flex: none;
  }
  .subject {
    font-size: 15px;
    color: var(--t-text-weak);
  }
  .is-unread .subject {
    color: var(--t-text);
    font-weight: 500;
  }
  .time {
    margin-left: auto;
    font-size: 12px;
    color: #a8abb2;
    flex: none;
  }
  .body {
    margin-top: 6px;
    font-size: 14px;
    color: #606266;
    line-height: 1.7;
    white-space: pre-line;
  }
  .actions {
    margin-top: 10px;
  }
  .pagination {
    margin-top: 16px;
  }

  @media (max-width: 768px) {
    .notice-line {
      flex-wrap: wrap;
    }
    .time {
      margin-left: 0;
      width: 100%;
    }
  }
</style>

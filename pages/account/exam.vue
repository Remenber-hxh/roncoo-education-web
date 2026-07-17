<template>
  <NuxtLayout name="account">
    <client-only>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的任务" name="task">
          <el-table v-loading="taskLoading" :data="taskList">
            <el-table-column label="课程" min-width="200">
              <template #default="scope">
                {{ scope.row.courseName || '课程' + scope.row.courseId }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="类型" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.assignType === 1 ? 'danger' : 'info'" size="small">
                  {{ scope.row.assignType === 1 ? '必修' : '选修' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="完成期限" prop="deadline" width="120">
              <template #default="scope">{{ scope.row.deadline ? scope.row.deadline.slice(0, 10) : '—' }}</template>
            </el-table-column>
            <el-table-column align="center" label="状态" width="110">
              <template #default="scope">
                <el-tag :type="finishTag(scope.row.finishStatus)" size="small">{{ finishText(scope.row.finishStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="120">
              <template #default="scope">
                <el-button plain size="small" type="primary" @click="openPapers(scope.row)">去考试</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我的成绩" name="record">
          <el-table v-loading="recordLoading" :data="recordList">
            <el-table-column label="试卷" min-width="200">
              <template #default="scope">{{ scope.row.paperName || '试卷' + scope.row.paperId }}</template>
            </el-table-column>
            <el-table-column align="center" label="场次" width="80">
              <template #default="scope">{{ scope.row.attemptNo === 1 ? '正考' : '补考' + (scope.row.attemptNo - 1) }}</template>
            </el-table-column>
            <el-table-column align="center" label="得分" prop="score" width="80">
              <template #default="scope">{{ scope.row.score == null ? '—' : scope.row.score }}</template>
            </el-table-column>
            <el-table-column align="center" label="结果" width="90">
              <template #default="scope">
                <el-tag v-if="scope.row.examStatus === 1" size="small" type="warning">进行中</el-tag>
                <el-tag v-else :type="scope.row.isPass === 1 ? 'success' : 'danger'" size="small">
                  {{ scope.row.isPass === 1 ? '通过' : '未过' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="交卷时间" prop="submitTime" width="170">
              <template #default="scope">{{ scope.row.submitTime || '—' }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="paperDialog" title="选择试卷" width="560px">
        <el-table v-loading="paperLoading" :data="papers">
          <el-table-column label="试卷" min-width="180" prop="paperName" />
          <el-table-column align="center" label="总分" prop="totalScore" width="60" />
          <el-table-column align="center" label="及格" prop="passScore" width="60" />
          <el-table-column align="center" label="时长(分)" prop="durationMinutes" width="80" />
          <el-table-column align="center" label="操作" width="110">
            <template #default="scope">
              <el-button size="small" type="primary" @click="goExam(scope.row)">开始考试</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!paperLoading && papers.length === 0" description="该课程暂无试卷" />
      </el-dialog>
    </client-only>
  </NuxtLayout>
</template>
<script setup>
  import { examApi } from '~/api/exam.js'

  useHead({ title: '我的考试' })

  const activeTab = ref('task')
  const taskList = ref([])
  const taskLoading = ref(false)
  const recordList = ref([])
  const recordLoading = ref(false)
  const paperDialog = ref(false)
  const paperLoading = ref(false)
  const papers = ref([])

  const finishText = (s) => ({ 0: '未开始', 1: '学习中', 2: '已学完', 3: '已通过考试' })[s] || '未开始'
  const finishTag = (s) => ({ 0: 'info', 1: 'warning', 2: 'primary', 3: 'success' })[s] || 'info'

  onMounted(() => {
    loadTasks()
    loadRecords()
  })

  function loadTasks() {
    taskLoading.value = true
    examApi
      .myAssignList()
      .then((res) => (taskList.value = res || []))
      .finally(() => (taskLoading.value = false))
  }

  function loadRecords() {
    recordLoading.value = true
    examApi
      .myRecordList()
      .then((res) => (recordList.value = res || []))
      .finally(() => (recordLoading.value = false))
  }

  function openPapers(row) {
    paperDialog.value = true
    paperLoading.value = true
    papers.value = []
    examApi
      .paperList(row.courseId)
      .then((res) => (papers.value = res || []))
      .finally(() => (paperLoading.value = false))
  }

  function goExam(paper) {
    navigateTo({ path: '/exam/take', query: { paperId: paper.id } })
  }
</script>

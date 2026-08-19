<template>
  <div class="exam-page">
    <client-only>
      <!-- 考试中 -->
      <template v-if="exam && !result">
        <div class="exam-header">
          <div class="exam-title">
            {{ exam.paperName }}
            <el-tag size="small" style="margin-left: 10px">{{ exam.attemptNo === 1 ? '正考' : '补考' }}</el-tag>
          </div>
          <div class="exam-meta">
            总分 {{ exam.totalScore }} · 及格 {{ exam.passScore }} 分
            <span :class="{ 'time-warn': remainSeconds < 300 }" class="exam-timer">⏱ {{ remainText }}</span>
            <el-button :loading="submitting" style="margin-left: 16px" type="primary" @click="confirmSubmit">交 卷</el-button>
          </div>
        </div>

        <div class="exam-body">
          <div v-for="q in exam.questions" :key="q.questionId" class="question">
            <div class="q-title">
              <span class="q-seq">{{ q.seq }}.</span>
              <el-tag size="small" type="info">{{ typeText(q.questionType) }}</el-tag>
              <span class="q-text">{{ q.questionTitle }}</span>
              <span class="q-score">（{{ q.score }}分）</span>
            </div>
            <!-- 多选 -->
            <el-checkbox-group v-if="q.questionType === 2" v-model="multiAnswers[q.questionId]" class="q-options">
              <el-checkbox v-for="opt in parseOptions(q.optionsJson)" :key="opt.key" :label="opt.key" size="large">
                {{ opt.key }}. {{ opt.value }}
              </el-checkbox>
            </el-checkbox-group>
            <!-- 单选/判断 -->
            <el-radio-group v-else v-model="singleAnswers[q.questionId]" class="q-options">
              <el-radio v-for="opt in parseOptions(q.optionsJson)" :key="opt.key" :label="opt.key" size="large">
                {{ opt.key }}. {{ opt.value }}
              </el-radio>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 成绩单 -->
      <template v-if="result">
        <div class="result-card">
          <div :class="result.isPass ? 'pass' : 'fail'" class="result-score">{{ result.score }}<span class="result-total">/{{ result.totalScore }}</span></div>
          <el-tag :type="result.isPass ? 'success' : 'danger'" size="large">
            {{ result.isPass ? '恭喜，考试通过！' : '未达到及格线（' + result.passScore + '分）' }}
          </el-tag>
          <div class="result-btns">
            <el-button v-if="!result.isPass && result.canRetake" type="primary" @click="retake">立即补考</el-button>
            <el-button @click="navigateTo({ name: 'account-exam' })">返回我的考试</el-button>
          </div>

          <div v-if="result.wrongList && result.wrongList.length" class="wrong-box">
            <el-divider>错题解析（{{ result.wrongList.length }} 题）</el-divider>
            <div v-for="(w, i) in result.wrongList" :key="i" class="wrong-item">
              <div class="w-title">{{ w.questionTitle }}</div>
              <div class="w-line">你的答案：<span class="fail">{{ w.yourAnswer || '未作答' }}</span>　正确答案：<span class="pass">{{ w.correctAnswer }}</span></div>
              <div v-if="w.analysis" class="w-line">解析：{{ w.analysis }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- 加载/错误 -->
      <div v-if="!exam && !result" class="exam-loading">
        <el-empty :description="loadError || '试卷加载中...'">
          <el-button v-if="loadError" @click="navigateTo({ name: 'account-exam' })">返回我的考试</el-button>
        </el-empty>
      </div>
    </client-only>
  </div>
</template>
<script setup>
  import { ElMessageBox } from 'element-plus'
  import { examApi } from '~/api/exam.js'

  useHead({ title: '在线考试' })

  const route = useRoute()
  const exam = ref(null)
  const result = ref(null)
  const loadError = ref('')
  const submitting = ref(false)
  const singleAnswers = reactive({})
  const multiAnswers = reactive({})
  const remainSeconds = ref(0)
  let timer = null

  const remainText = computed(() => {
    const s = Math.max(0, remainSeconds.value)
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })

  const typeText = (t) => ({ 1: '单选', 2: '多选', 3: '判断' })[t] || '单选'

  function parseOptions(json) {
    try {
      return JSON.parse(json || '[]')
    } catch (e) {
      return []
    }
  }

  onMounted(() => startExam())
  onUnmounted(() => timer && clearInterval(timer))

  function startExam() {
    result.value = null
    loadError.value = ''
    exam.value = null
    examApi
      .start({ paperId: route.query.paperId })
      .then((res) => {
        exam.value = res
        for (const q of res.questions) {
          if (q.questionType === 2 && !multiAnswers[q.questionId]) multiAnswers[q.questionId] = []
        }
        const end = new Date(res.startTime).getTime() + res.durationMinutes * 60 * 1000
        timer && clearInterval(timer)
        timer = setInterval(() => {
          remainSeconds.value = Math.floor((end - Date.now()) / 1000)
          if (remainSeconds.value <= 0) {
            clearInterval(timer)
            doSubmit(true)
          }
        }, 1000)
        remainSeconds.value = Math.floor((end - Date.now()) / 1000)
      })
      .catch((e) => {
        loadError.value = (e && e.data && e.data.msg) || '开考失败'
      })
  }

  function confirmSubmit() {
    const total = exam.value.questions.length
    const answered = exam.value.questions.filter((q) => {
      return q.questionType === 2 ? (multiAnswers[q.questionId] || []).length > 0 : !!singleAnswers[q.questionId]
    }).length
    const tip = answered < total ? `还有 ${total - answered} 题未作答，` : ''
    ElMessageBox.confirm(`${tip}确定交卷吗？`, '交卷确认', { confirmButtonText: '交卷', cancelButtonText: '再看看', type: 'warning' })
      .then(() => doSubmit(false))
      .catch(() => {})
  }

  function doSubmit(auto) {
    if (submitting.value || !exam.value) return
    submitting.value = true
    const answers = exam.value.questions.map((q) => ({
      questionId: q.questionId,
      answer: q.questionType === 2 ? (multiAnswers[q.questionId] || []).join(',') : singleAnswers[q.questionId] || ''
    }))
    examApi
      .submit({ recordId: exam.value.recordId, answers })
      .then((res) => {
        result.value = res
        timer && clearInterval(timer)
      })
      .finally(() => (submitting.value = false))
  }

  function retake() {
    startExam()
  }
</script>
<style lang="scss" scoped>
  .exam-page {
    max-width: 900px;
    margin: 20px auto 40px;
    padding: 0 20px;
  }
  .exam-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 8px;
    padding: 16px 24px;
    position: sticky;
    top: 10px;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    .exam-title {
      font-size: 18px;
      font-weight: 600;
    }
    .exam-meta {
      color: #666;
      display: flex;
      align-items: center;
    }
    .exam-timer {
      margin-left: 16px;
      font-size: 18px;
      font-weight: 600;
      color: #3d7fff;
      &.time-warn {
        color: #f56c6c;
      }
    }
  }
  .exam-body {
    background: #fff;
    border-radius: 8px;
    margin-top: 16px;
    padding: 8px 24px 24px;
  }
  .question {
    padding: 18px 0;
    border-bottom: 1px dashed #eee;
    .q-title {
      font-size: 15px;
      .q-seq {
        font-weight: 600;
        margin-right: 6px;
      }
      .q-text {
        margin-left: 8px;
      }
      .q-score {
        color: #999;
        font-size: 13px;
      }
    }
    .q-options {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin: 10px 0 0 26px;
    }
  }
  .result-card {
    background: #fff;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    .result-score {
      font-size: 64px;
      font-weight: 700;
      margin-bottom: 12px;
      .result-total {
        font-size: 24px;
        color: #999;
        font-weight: 400;
      }
    }
    .result-btns {
      margin-top: 24px;
    }
    .wrong-box {
      margin-top: 32px;
      text-align: left;
    }
    .wrong-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
      margin-bottom: 10px;
      .w-title {
        font-weight: 600;
        margin-bottom: 6px;
      }
      .w-line {
        font-size: 13px;
        color: #666;
        margin-top: 4px;
      }
    }
  }
  .pass {
    color: #67c23a;
  }
  .fail {
    color: #f56c6c;
  }
  .exam-loading {
    background: #fff;
    border-radius: 8px;
    padding: 60px;
  }

  // 手机：标题和倒计时挤在一行会把倒计时压没，改为上下两行；
  // 内边距同步收窄，题干才有足够宽度。
  @media (max-width: 768px) {
    .exam-page {
      margin: 12px auto 24px;
      padding: 0 12px;
    }
    .exam-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      .exam-title {
        font-size: 16px;
      }
      .exam-meta {
        width: 100%;
        justify-content: space-between;
      }
      .exam-timer {
        margin-left: 0;
        font-size: 16px;
      }
    }
    .exam-body {
      padding: 8px 16px 20px;
    }
    .question {
      .q-options {
        margin-left: 0;
      }
      // 选项文字长时要能换行，否则会顶出容器
      :deep(.el-radio),
      :deep(.el-checkbox) {
        white-space: normal;
        height: auto;
        margin-right: 0;
        line-height: 22px;
        padding: 6px 0;
      }
      :deep(.el-radio__label),
      :deep(.el-checkbox__label) {
        white-space: normal;
        word-break: break-all;
      }
    }
    .result-card {
      padding: 24px 16px;
      .result-score {
        font-size: 44px;
      }
    }
    .exam-loading {
      padding: 40px 16px;
    }
  }
</style>

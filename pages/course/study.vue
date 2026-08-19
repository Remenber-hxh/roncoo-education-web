<template>
  <div class="detail-video">
    <div class="video-header">
      <div class="header-left">
        <span class="cursor" @click="handleBack">
          <!-- 二开：原为外链 roncoo CDN 的图片，内网访问不到会裂图，改用 Element Plus 图标 -->
          <el-icon class="cursor-image" :size="22"><ArrowLeftBold /></el-icon>
        </span>
        <nuxt-link :to="{ name: 'course-detail', query: { id: courseInfo?.id } }" class="left_col">
          <span class="header-course">
            {{ courseInfo?.courseName }}
          </span>
        </nuxt-link>
        <course-collect :course-id="courseInfo?.id" :collect-status="courseInfo?.courseCollect" />
      </div>
      <div class="header-right">
        <common-user />
      </div>
    </div>
    <div class="video-body">
      <div class="video-content" :class="{ show_panel: cateType }">
        <div class="player-box">
          <!-- 图文课时（二开）：正文阅读区，带进度条与签署确认 -->
          <div v-if="article.show" class="article-wrap">
            <div class="article-progress">
              <span>阅读进度</span>
              <el-progress :percentage="article.percent" :stroke-width="10" style="flex: 1; margin: 0 12px" />
              <span v-if="article.completed" class="article-done">已完成</span>
            </div>
            <div class="article-body" v-html="article.content" />
            <div v-if="article.needSign === 1" class="article-sign">
              <template v-if="article.signed">
                <span class="article-signed">✓ 你已签署确认本文件</span>
              </template>
              <template v-else>
                <el-button type="primary" :disabled="!article.completed" @click="handleArticleSign">
                  {{ article.completed ? '我已阅读并确认' : '请先读完全文' }}
                </el-button>
                <span class="article-sign-tip">签署将记录你的确认时间，作为培训留痕</span>
              </template>
            </div>
          </div>
          <!-- 播放器 -->
          <div v-show="showing && !article.show" id="player" v-loading="loading" class="player-video" />
          <div v-show="!showing" class="study-tip">
            <div v-if="nextPeriod">
              下一节：{{ nextPeriod?.periodName }}
              <el-button size="small" type="success" @click="handleStudy(nextPeriod)"> 马上学习</el-button>
            </div>
          </div>
        </div>
        <div class="video-info">
          <div class="video-info-tab">
            <div :class="{ on: cateType === 'chapter' }" class="video-info-button cursor" @click="handleTab('chapter')"><img src="~/assets/svg/chapter.svg" class="img-icon" />目录</div>
            <div :class="{ on: cateType === 'comment' }" class="video-info-button cursor" @click="handleTab('comment')"><img src="~/assets/svg/comment.svg" class="img-icon" />评论</div>
          </div>
          <div v-if="cateType != ''" class="video-info-content">
            <div v-if="cateType === 'chapter'" class="video-info-chapter">
              <div v-for="(one, index) in courseInfo?.chapterRespList" :key="index">
                <div class="catalog-chapter">第{{ index + 1 }}章：{{ one.chapterName }}</div>
                <div v-for="(two, num) in one.periodRespList" :key="num" class="catalog-chapter-period cursor" :class="{ on: studyPeriodId == two?.id }" @click="handleStudy(two)">
                  <div class="period-name">
                    &nbsp;&nbsp;
                    <span v-if="two.periodType === 10">{{ getResourceTypeName(two.resourceResp?.resourceType) }}：</span>
                    {{ index + 1 }}-{{ num + 1 }} {{ two.periodName }}
                    <span v-if="two.resourceResp && two.resourceResp.resourceType < 3 && two.resourceResp.videoStatus === 1">(未更新)</span>
                    <div v-if="two.periodType === 10" class="period-progress">
                      <el-progress v-if="two" :percentage="two.periodProgress ? two.periodProgress : 0" :stroke-width="2" :status="two.periodProgress > 99 ? 'success' : ''" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="cateType === 'comment'" class="video-info-comment">
              <course-comment :course-id="courseInfo?.id" :show-page="false" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { ArrowLeftBold } from '@element-plus/icons-vue'
  import { courseApi } from '~/api/course.js'
  import { getClient, getClientForPri } from '~/utils/polyv'
  import { getLocalPlayer } from '~/utils/localPlayer'

  const route = useRoute()

  useHead({
    title: '课程详情',
    meta: [
      { hid: 'keywords', name: 'keywords', content: '课程详情' },
      { hid: 'description', name: 'description', content: '课程详情' }
    ],
    script: [{ src: 'https://player.polyv.net/resp/vod-player/latest/player.js' }]
  })

  const courseInfo = ref(null)
  const loading = ref(false)
  const showing = ref(true)

  // 当前播放的课时id
  const studyPeriodId = ref()
  // 下一个课时
  const nextPeriod = ref()
  // 用户学习信息
  const userStudy = {}
  let progressInterval = null
  let polyvPlayerClient = null

  // 学习时长心跳（二开）：progressInterval 上报的是播放位置，
  // 这里单独上报「实际学了多少秒」，服务端按天累加，用于后台的学习时长统计。
  let heartbeatInterval = null
  let lastBeatAt = 0
  const HEARTBEAT_MS = 30000

  function sendHeartbeat() {
    // 按实际经过的时间算，而不是假定固定 30 秒：
    // 浏览器对后台标签页的 setInterval 会限流，假定固定值会多算。
    const now = Date.now()
    const seconds = Math.round((now - lastBeatAt) / 1000)
    lastBeatAt = now
    if (seconds <= 0) {
      return
    }
    courseApi
      .studyHeartbeat({
        courseId: courseInfo.value.id,
        periodId: studyPeriodId.value,
        seconds
      })
      .catch(() => {
        // 心跳失败不打扰学员，丢一次不影响整体统计
      })
  }

  function startHeartbeat() {
    stopHeartbeat(false)
    lastBeatAt = Date.now()
    heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_MS)
  }

  // ---------- 图文课时（二开新增）----------
  const article = reactive({
    show: false,
    content: '',
    needSign: 0,
    signed: false,
    readSeconds: 0,
    percent: 0,
    completed: false
  })
  let articleTimer = null
  let articleLastReport = 0

  /**
   * 展示图文正文。
   * 完成判定和视频不同：视频有"播完"这个信号，图文没有，
   * 用「滚动到底 + 停留够时长」双条件，服务端最终裁决。
   */
  function showArticle(studyRes) {
    article.show = true
    article.content = studyRes.content || ''
    article.needSign = studyRes.needSign || 0
    article.signed = !!studyRes.signed
    article.readSeconds = studyRes.readSeconds || 0
    article.percent = Number(studyRes.progress) || 0
    article.completed = article.percent >= 100

    showing.value = false
    stopArticleTracking()
    articleLastReport = Date.now()

    nextTick(() => {
      const box = document.querySelector('.article-body')
      if (box) {
        box.scrollTop = 0
        box.addEventListener('scroll', onArticleScroll)
      }
      // 每 15 秒上报一次，服务端累计停留时长
      articleTimer = setInterval(reportArticleRead, 15000)
    })
  }

  function onArticleScroll(e) {
    const el = e.target
    const total = el.scrollHeight - el.clientHeight
    // 内容不足一屏时（total<=0）视为已看完
    const p = total <= 0 ? 100 : Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100)
    if (p > article.percent) {
      article.percent = Math.min(100, p)
    }
  }

  async function reportArticleRead() {
    if (!article.show || !studyPeriodId.value) return
    const now = Date.now()
    const stay = Math.round((now - articleLastReport) / 1000)
    articleLastReport = now
    try {
      const res = await courseApi.articleRead({
        periodId: studyPeriodId.value,
        percent: article.percent,
        staySeconds: stay
      })
      if (res === 'COMPLETE') {
        article.completed = true
        article.percent = 100
        await getCourseInfo()
      }
    } catch (e) {
      // 上报失败不打扰阅读
    }
  }

  function stopArticleTracking() {
    if (articleTimer) {
      clearInterval(articleTimer)
      articleTimer = null
    }
    const box = document.querySelector('.article-body')
    if (box) box.removeEventListener('scroll', onArticleScroll)
  }

  async function handleArticleSign() {
    try {
      // 先把最新进度报上去，避免刚读完就点签署时服务端还认为没读完
      await reportArticleRead()
      await courseApi.articleSign({ periodId: studyPeriodId.value })
      article.signed = true
      ElMessage.success('签署成功')
    } catch (e) {
      // 错误提示由请求拦截器统一弹出
    }
  }

  function stopHeartbeat(flush = true) {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
      if (flush) {
        // 补报最后一段不足 30 秒的时长
        sendHeartbeat()
      }
    }
  }

  onMounted(async () => {
    // 课程信息
    await getCourseInfo()

    // 初始化学习
    await handleStudy({ id: route.query.periodId })
  })

  onUnmounted(() => {
    // 清除
    handleClear()
  })

  // 学习
  async function handleStudy(period) {
    loading.value = true
    showing.value = true

    // 更新课程信息
    await getCourseInfo()
    let studyRes
    try {
      studyRes = await courseApi.studySign({ periodId: period.id, courseId: route.query.id })
    } catch (e) {
      loading.value = false
    }

    studyPeriodId.value = studyRes.periodId
    userStudy.studyId = studyRes.studyId
    userStudy.resourceId = studyRes.resourceId

    // 图文课时（二开）：正文直接在返回里，不走资源与播放器
    if (studyRes.periodType === 30) {
      handleClear()
      showArticle(studyRes)
      loading.value = false
      return
    }

    // 资源类型
    if (studyRes.resourceType <= 2) {
      handleClear()
      // 音视频播放
      handlePlay(studyRes)
    } else if (studyRes.resourceType === 3) {
      // 文档播放
      handleDoc(JSON.parse(studyRes.docStudyConfig).previewUrl)
    } else if (studyRes.resourceType === 4) {
      // 图片播放
      handleDoc(JSON.parse(studyRes.picStudyConfig).previewUrl)
    } else {
      ElMessage.warning('暂不支持该类型资源')
    }
    loading.value = false
  }

  /**
   *  获取课程信息
   */
  async function getCourseInfo() {
    courseInfo.value = await courseApi.userCourseDetail({ courseId: route.query.id })
    return courseInfo.value
  }

  /**
   * 获取课程学习中的下一节
   * @param periodId
   * @returns {*}
   */
  function getNextPeriod(periodId) {
    for (let i = 0; i < courseInfo.value.chapterRespList.length; i++) {
      for (let j = 0; j < courseInfo.value.chapterRespList[i].periodRespList.length; j++) {
        if (courseInfo.value.chapterRespList[i].periodRespList[j].id === periodId) {
          if (courseInfo.value.chapterRespList[i].periodRespList.length === j + 1) {
            if (courseInfo.value.chapterRespList[i + 1]) {
              return courseInfo.value.chapterRespList[i + 1].periodRespList[0]
            }
          } else {
            return courseInfo.value.chapterRespList[i].periodRespList[j + 1]
          }
        }
      }
    }
  }

  /**
   * 文档图片播放
   */
  function handleDoc(srcPath) {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('src', srcPath)
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    const player = document.getElementById('player')
    player.innerHTML = ''
    player.appendChild(iframe)

    // 记录进度
    handleStudyRecord()
  }

  // 音视频播放
  function handlePlay(playRes) {
    // 清除内容
    document.getElementById('player').innerHTML = ''
    if (playRes.vodPlatform === 1) {
      // 私有云
      polyvPlayerClient = getClientForPri(playRes, courseInfo.value.speedDouble, courseInfo.value.speedDrag)
      polyvPlayerClient.on('s2j_onVideoPlay', function () {
        // 开始播放
        handleStart()
      })
      polyvPlayerClient.on('s2j_onVideoPause', function () {
        // 暂停播放
        handlePause()
      })
      polyvPlayerClient.on('s2j_onPlayOver', function () {
        // 完成播放
        handleComplete()
      })
    } else if (playRes.vodPlatform === 2) {
      // 保利威
      polyvPlayerClient = getClient(playRes, courseInfo.value.speedDouble, courseInfo.value.speedDrag)
      polyvPlayerClient.on('s2j_onVideoPlay', function () {
        // 开始播放
        handleStart()
      })
      polyvPlayerClient.on('s2j_onVideoPause', function () {
        // 暂停播放
        handlePause()
      })
      polyvPlayerClient.on('s2j_onPlayOver', function () {
        // 完成播放
        handleComplete()
      })
    } else if (playRes.vodPlatform === 5) {
      // 本地存储（二开新增）：原生 video 播放，接口与保利威播放器一致
      polyvPlayerClient = getLocalPlayer(playRes, courseInfo.value.speedDouble, courseInfo.value.speedDrag)
      polyvPlayerClient.on('s2j_onVideoPlay', function () {
        // 开始播放
        handleStart()
      })
      polyvPlayerClient.on('s2j_onVideoPause', function () {
        // 暂停播放
        handlePause()
      })
      polyvPlayerClient.on('s2j_onPlayOver', function () {
        // 完成播放
        handleComplete()
      })
    } else {
      // 其他
      ElMessage.warning('暂不支持该平台的播放')
    }
  }

  // 记录进度
  function handleStudyRecordForVod(studyStatus) {
    userStudy.currentDuration = polyvPlayerClient.j2s_getCurrentTime()
    // studyStatus 1学习中 2暂停
    userStudy.studyStatus = studyStatus
    courseApi
      .studyProgress(userStudy)
      .then((res) => {
        if (res === 'OK') {
          // 完成，暂停同步
          if (progressInterval) {
            clearInterval(progressInterval)
          }
        }
      })
      .catch((error) => {
        polyvPlayerClient.j2s_pauseVideo()
        ElMessageBox.confirm('系统异常将暂停观看，请联系管理员', '提示', {
          confirmButtonText: '返回',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          handleBack()
        })
      })
  }

  // 记录进度
  function handleStudyRecord() {
    userStudy.currentPage = 1
    courseApi
      .studyProgress(userStudy)
      .then((res) => {
        if (res === 'OK') {
          // 完成，暂停同步
          if (progressInterval) {
            clearInterval(progressInterval)
          }
        }
      })
      .catch((error) => {
        ElMessageBox.confirm('系统异常将暂停观看，请联系管理员', '提示', {
          confirmButtonText: '返回',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          handleBack()
        })
      })
  }

  // tab切换
  const cateType = ref('chapter')

  function handleTab(item) {
    if (item === cateType.value) {
      cateType.value = ''
    } else {
      cateType.value = item
    }
  }

  // 开始
  function handleStart() {
    // 播放
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    progressInterval = setInterval(() => {
      handleStudyRecordForVod(1)
    }, 3000)
    // 开始累计学习时长
    startHeartbeat()
  }

  // 暂停
  function handlePause() {
    // 更新进度
    handleStudyRecordForVod(2)
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    stopHeartbeat()
  }

  // 完成播放
  function handleComplete() {
    // 更新进度
    handleStudyRecordForVod(1)
    // 播放完成
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    stopHeartbeat()

    // 显示下一节
    showing.value = false
    nextPeriod.value = getNextPeriod(studyPeriodId.value)
  }

  // 清除
  function handleClear() {
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    stopHeartbeat()
    // 图文：切换课时或离开前补报一次，避免最后一段阅读时长丢失
    if (article.show) {
      reportArticleRead()
      stopArticleTracking()
      article.show = false
    }
    if (polyvPlayerClient) {
      // 暂停学习
      handleStudyRecordForVod(2)
      polyvPlayerClient.destroy()
    }
  }

  function handleBack() {
    window.history.go(-1)
  }
</script>
<style lang="scss">
  .video-header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    height: 66px;
    line-height: 66px;
    margin: 0 auto;
    font-size: 18px;

    .cursor-image {
      width: 20px;
    }

    .header-left {
      margin-left: 20px;

      .header-course {
        margin-left: 20px;
      }
    }

    .header-right {
      margin-right: 20px;
      display: flex;
      align-items: center;
    }
  }

  .video-body {
    background: #000;

    .video-content {
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;

      .player-box {
        width: calc(100% - 66px);
        padding: 10px 20px;

        .player-video {
          height: calc(100vh - 86px);
        }

        /* 图文课时阅读区（二开） */
        .article-wrap {
          height: calc(100vh - 86px);
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 8px;
        }

        .article-progress {
          display: flex;
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
          color: #666;
          flex-shrink: 0;
        }

        .article-done {
          color: #67c23a;
          font-weight: 600;
        }

        /* 正文自己滚动，滚动比例即阅读进度 */
        .article-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
          line-height: 1.9;
          font-size: 15px;
          color: #333;

          :deep(img) {
            max-width: 100%;
            height: auto;
          }
          :deep(table) {
            border-collapse: collapse;
            width: 100%;
            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }
          }
          :deep(a) {
            color: #409eff;
          }
        }

        .article-sign {
          padding: 16px 24px;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .article-sign-tip {
          margin-left: 12px;
          color: #999;
          font-size: 12px;
        }

        .article-signed {
          color: #67c23a;
          font-weight: 600;
        }

        .study-tip {
          height: calc(100vh - 86px);
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 16px;
        }
      }

      .video-info {
        background: #1c1f21;
        display: flex;
        flex-direction: row-reverse;

        .video-info-tab {
          width: 80px;
          margin-top: calc(50vh - 120px);
          font-size: 16px;

          .video-info-button {
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0;

            .img-icon {
              width: 25px;
            }

            &:hover {
              background-color: #333;
            }
          }

          .on {
            background-color: #333;
          }
        }

        .content {
          display: block;
        }

        .video-info-content {
          background-color: #333;
          color: #fff;
          width: 400px;
          padding: 20px;
          height: calc(100vh - 86px);
          overflow: auto;

          .catalog-chapter {
            font-size: 16px;
            margin: 15px 0;
          }

          .catalog-chapter-period {
            font-size: 14px;
            margin: 10px;

            &:hover {
              color: red;
            }

            .period-name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 350px;
            }

            .period-progress {
              height: 20px;
              width: 300px;
              margin-left: 50px;
            }

            .period-live {
              font-size: 12px;
              text-align: right;
            }
          }

          .on {
            color: #2256f6;
          }
        }
      }
    }
  }

  // ============================================================
  // 手机适配（二开）
  //
  // 原布局是「左侧播放区 + 右侧目录侧栏」横向并排，且播放区高度写死
  // calc(100vh - 86px)。手机上侧栏会把播放区挤成一条，视频几乎看不见。
  // 改为上下堆叠：播放区按 16:9 显示在上，目录在下方正常滚动。
  // ============================================================
  @media (max-width: 768px) {
    .video-header {
      height: auto;
      padding: 8px 0;
      flex-wrap: wrap;

      .header-left {
        margin-left: 10px;

        .header-course {
          margin-left: 10px;
          font-size: 14px;
        }
      }

      .header-right {
        margin-right: 10px;
      }
    }

    .video-body {
      .video-content {
        // 横向并排改为纵向堆叠
        flex-direction: column;
        flex-wrap: wrap;

        .player-box {
          width: 100%;
          padding: 0;
          box-sizing: border-box;

          // 视频按 16:9 而不是占满一屏高，下方要留给目录
          .player-video {
            height: auto;
            aspect-ratio: 16 / 9;
          }

          // 图文正文给足高度，但不霸占整屏
          .article-wrap {
            height: auto;
            min-height: 60vh;
            border-radius: 0;
          }

          .article-body {
            padding: 16px;
            font-size: 15px;
          }

          .article-sign {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .article-sign-tip {
            margin-left: 0;
          }

          .study-tip {
            height: 120px;
          }
        }

        .video-info {
          width: 100%;
          // 目录标签页原本竖排在右侧，手机上改为横排在目录上方
          flex-direction: column;

          .video-info-tab {
            width: 100%;
            margin-top: 0;
            display: flex;
            flex-direction: row;

            .video-info-button {
              flex: 1;
              flex-direction: row;
              justify-content: center;
              gap: 6px;
              padding: 12px 0;
              font-size: 14px;

              .img-icon {
                width: 18px;
              }
            }
          }

          .video-info-content {
            width: 100%;
            box-sizing: border-box;
            height: auto;
            max-height: 50vh;
            padding: 12px;

            .catalog-chapter-period {
              margin: 10px 0;

              // 原写死 350px/300px，窄屏会溢出
              .period-name {
                width: 100%;
              }

              .period-progress {
                width: calc(100% - 30px);
                margin-left: 20px;
              }
            }
          }
        }
      }
    }
  }
</style>

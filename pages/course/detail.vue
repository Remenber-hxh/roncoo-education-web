<template>
  <NuxtLayout>
    <div class="detail_content">
      <div class="detail_body">
        <div class="detail_header clearfix">
          <div class="detail_title">
            <nuxt-link :to="{ path: '/' }"> 首页 </nuxt-link>
            <span>></span>
          </div>
          <div class="detail_title">
            <nuxt-link :to="{ name: 'course-list' }"> 课程中心 </nuxt-link>
            <span>></span>
          </div>
          <div class="detail_title">
            {{ courseInfo.courseName }}
          </div>
        </div>
        <div class="clearfix">
          <div class="video_box">
            <img class="detail_view" :src="courseInfo?.courseLogo" :alt="courseInfo?.courseName" />
            <div class="view_info">
              <!-- 课程详情 -->
              <div class="view_info_course">
                {{ courseInfo.courseName }}
              </div>
              <div v-if="courseInfo.lecturerResp" class="view_info_item">
                <span class="text_b">讲师名称:</span>{{ courseInfo.lecturerResp.lecturerName }}（{{ courseInfo.lecturerResp.lecturerPosition }}）
              </div>
              <div class="view_info_item"><span class="text_b">学习人数:</span>{{ courseInfo.countStudy }} 人</div>
              <div class="foot_box">
                <button v-if="courseInfo.allowStudy === 1" class="buy_btn" @click="handleStudy">马上学习</button>
                <button v-else class="buy_btn" @click="handleLogin">登录观看</button>
                <div class="handle_info_btn">
                  <div class="collect_btn">
                    <course-collect :course-id="courseInfo.id" :collect-status="courseInfo.courseCollect" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <!-- 章节详情 -->
      <div class="course_info clearfix">
        <div class="layout_left">
          <el-tabs type="border-card" @tab-click="handleTabClick">
            <el-tab-pane label="课程介绍">
              <div class="introduce" v-html="courseInfo.introduce" />
            </el-tab-pane>
            <el-tab-pane label="课程目录">
              <course-chapter :list="courseInfo.chapterRespList" />
            </el-tab-pane>
            <el-tab-pane label="课程评论" name="comment">
              <course-comment v-if="activeName === 'comment'" :course-id="courseInfo.id" />
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="layout_right">
          <div class="teacher_info clearfix">
            <span class="head">讲师简介</span>
            <div class="teacher_msg">
              <nuxt-link target="_blank" :to="{ name: 'lecturer-detail', query: { id: courseInfo.lecturerResp.id } }">
                <div v-if="courseInfo.lecturerResp" class="teacher_msg_right">
                  <img v-if="courseInfo.lecturerResp.lecturerHead" class="teacher_phone" :src="courseInfo.lecturerResp.lecturerHead" alt="" />
                  <img v-else class="teacher_phone" src="~/assets/image/common_head.jpg" alt="" />
                  <div class="teacher_info_content">
                    <span class="teacher_name">{{ courseInfo.lecturerResp.lecturerName }}</span>
                    <br />
                    {{ courseInfo.lecturerResp.lecturerPosition }}
                  </div>
                </div>
              </nuxt-link>
              <div class="info_box" v-html="courseInfo.lecturerResp?.introduce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup>
  import { courseApi } from '~/api/course.js'
  import { setStorage } from '~/utils/storage.js'
  const route = useRoute()

  const { data: courseInfo } = await useAsyncData('course-detail' + route.query.id, async () => {
    if (getToken()) {
      // 已登录
      return courseApi.userCourseDetail({ courseId: route.query.id })
    } else {
      // 未登录
      return courseApi.courseDetail({ courseId: route.query.id })
    }
  })

  useHead({
    title: courseInfo.value?.courseName,
    meta: [
      { hid: 'keywords', name: 'keywords', content: '内部培训平台、员工培训、在线学习、在线考试' },
      { hid: 'description', name: 'description', content: courseInfo.value?.lecturerResp?.introduce }
    ]
  })

  // 学习
  function handleStudy() {
    useRouter().push('/course/study?id=' + courseInfo.value.id)
  }

  // 登录
  function handleLogin() {
    setStorage('history', window.location.href, 5)
    useRouter().push('/login')
  }

  const activeName = ref('')
  function handleTabClick(tab) {
    activeName.value = tab.props.name
  }
</script>
<style lang="scss" scoped>
  .detail_content {
    background: #fff;
    color: #999;
    font-size: 14px;
    .detail_body {
      width: 100%;
      max-width: 1200px;
      padding: 0 16px;
      box-sizing: border-box;
      margin: 0 auto;
      min-height: 373px;
    }
    .detail_header {
      .detail_title {
        float: left;
        line-height: 57px;
        margin: 0 5px;
        max-width: 600px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        span {
          margin-left: 10px;
        }
      }
    }

    .video_box {
      overflow: hidden;
      .detail_view {
        float: left;
        // 原为写死 504x280（16:9）。平板宽度下 504+650 放不进容器，
        // 改为按比例占宽，高度由 16:9 推出。
        width: 42%;
        height: auto;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        background-size: 100%;
        border-radius: 5px;

        &.float_win {
          position: fixed;
          right: 10px;
          bottom: 30px;
          z-index: 9999;
        }
      }
      .view_info {
        float: right;
        // 原为写死 650px，同上改为按比例占宽（与封面 42% 之间留 3% 间距）
        width: 55%;
        min-height: 270px;
        position: relative;

        .view_info_item {
          line-height: 30px;
          .text_b {
            margin-right: 20px;
          }
        }

        .view_price {
          background: #f5f5f5;
          color: rgb(102, 102, 102);
          padding: 15px 10px;
          margin: 10px 0;
          span {
            font-size: 20px;
            color: #d51423;
            font-weight: bold;
            margin-left: 20px;
          }
        }

        .view_info_course {
          font-size: 18px;
          margin: 5px 0;
          color: #333;
          height: 25px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .foot_box {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .buy_btn {
          display: block;
          width: 136px;
          height: 36px;
          background: #2256f6;
          color: #fff;
          border: none;
          border-radius: 6px;
          line-height: 36px;
          text-align: center;
          font-size: 14px;
          &:hover {
            text-decoration: none;
            color: #fff;
            cursor: pointer;
          }
        }
        .handle_info_btn {
          display: flex;
          align-items: center;
          color: #999;
          font-size: 14px;
        }
      }
    }
  }

  .course_info {
    margin: 20px 0;
    overflow: hidden;
    .layout_left {
      // 原为写死 920px。容器加了左右内边距后可用宽度不足 1180，
      // 右侧 260px 的讲师栏会被挤到下一行，故改为按剩余宽度计算。
      width: calc(100% - 280px);
      float: left;
      .introduce {
        font-size: 14px;
        line-height: 30px;
        color: #333;
        padding-left: 8px;
      }
    }

    .layout_right {
      width: 260px;
      float: right;
      img {
        width: 50px;
        border-radius: 50px;
      }
      .teacher_info {
        background-color: #fff;
        padding: 20px;
        .head {
          font-size: 18px;
        }
        .teacher_msg_right {
          float: left;
          display: flex;
          padding: 20px 0;
          align-items: center;
          .teacher_info_content {
            margin-left: 10px;
          }
          .teacher_name {
            font-size: 16px;
            font-weight: bold;
          }
        }
        .info_box {
          clear: both;
        }
      }
    }
  }

  // ============================================================
  // 手机适配（二开）
  //
  // 原来靠 float + 写死像素（封面 504、右侧信息 650、正文 920、侧栏 260）
  // 拼出两栏。窄屏放不下这些宽度，必须取消浮动改为上下堆叠。
  // ============================================================
  @media (max-width: 768px) {
    .detail_content {
      .detail_body {
        height: auto;
      }

      .detail_header {
        .detail_title {
          line-height: 40px;
          font-size: 13px;
          max-width: 100%;
        }
      }

      .video_box {
        .detail_view {
          float: none;
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;

          // 手机上没有「小窗跟随」的空间，跟随时会挡住正文，直接按常规位置显示
          &.float_win {
            position: static;
          }
        }

        .view_info {
          float: none;
          width: 100%;
          height: auto;
          margin-top: 12px;
        }
      }
    }

    .course_info {
      .layout_left,
      .layout_right {
        float: none;
        width: 100%;
      }

      .layout_right {
        margin-top: 16px;
      }
    }
  }
</style>

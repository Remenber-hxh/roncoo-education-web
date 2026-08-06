# 内部培训平台 - 员工门户

公司内部员工培训学习平台的员工端，供员工浏览课程、在线学习、参加考试与补考、查看成绩。

### 技术栈

Nuxt3 + Vue3 + Vite + Element-Plus + Pinia

### 本地运行

```bash
npm install --legacy-peer-deps
npm run dev
```

* 需要 Node 20+
* 开发服务器：http://localhost:3000
* 接口地址由 `.env.development` 指向网关 http://localhost:7700

完整的后端启动方式见后端仓库的 `LOCAL_RUN.md`。

### 主要页面

| 页面 | 说明 |
| --- | --- |
| 首页 | 课程专区、轮播、导航 |
| 课程列表 / 详情 | 浏览与选课 |
| 课程学习 | 视频播放、章节进度 |
| 我的考试 | 考试任务、我的成绩 |
| 在线答题 | 倒计时答题、交卷评分、错题解析、补考 |

### 开源声明

本项目基于开源项目 roncoo-education-web 二次开发，遵循 **AGPL v3** 许可证。原项目版权归其作者所有，源码中的版权声明依许可证要求予以保留。

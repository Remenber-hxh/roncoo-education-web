/**
 * 本地存储视频的播放器（二开新增）
 *
 * roncoo 原本只支持第三方点播云（保利威等），播放器实例由 window.polyvPlayer 提供。
 * 视频改放本地磁盘后没有第三方播放器可用，这里用原生 <video> 元素包一层，
 * 对外暴露与保利威播放器一致的接口，这样 study.vue 里的进度上报、
 * 暂停控制、防拖拽等逻辑完全不用改：
 *
 *   on('s2j_onVideoPlay' | 's2j_onVideoPause' | 's2j_onPlayOver', cb)
 *   j2s_getCurrentTime()   取当前播放位置(秒)
 *   j2s_pauseVideo()       暂停
 *   destroy()              销毁
 *
 * @param playRes     播放接口返回，vodPlayConfig 里是 { playUrl }
 * @param speedDouble 0=不允许倍速
 * @param speedDrag   0=禁止拖拽进度条
 */
export function getLocalPlayer(playRes, speedDouble, speedDrag) {
  const params = JSON.parse(playRes.vodPlayConfig || '{}')
  const wrap = document.getElementById('player')

  const video = document.createElement('video')
  video.src = params.playUrl
  video.controls = true
  video.preload = 'metadata'
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.backgroundColor = '#000'
  // 禁止下载/画中画等入口，减少绕过学习记录的口子
  video.setAttribute('controlsList', 'nodownload noplaybackrate')
  video.setAttribute('disablePictureInPicture', 'true')
  wrap.appendChild(video)

  // 续播：从上次学习位置开始
  const startAt = Number(playRes.currentDuration) || 0
  if (startAt > 0) {
    video.addEventListener(
      'loadedmetadata',
      () => {
        if (startAt < video.duration) {
          video.currentTime = startAt
        }
      },
      { once: true }
    )
  }

  // 禁止拖拽：记录允许到达的最大位置，越界就拉回去
  let maxAllowed = startAt
  if (speedDrag === 0) {
    video.addEventListener('timeupdate', () => {
      if (video.currentTime > maxAllowed) {
        maxAllowed = video.currentTime
      }
    })
    video.addEventListener('seeking', () => {
      // 留 1 秒容差，避免正常播放时的微小抖动被误判
      if (video.currentTime > maxAllowed + 1) {
        video.currentTime = maxAllowed
      }
    })
  }

  // 禁止倍速
  if (speedDouble === 0) {
    video.addEventListener('ratechange', () => {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1
      }
    })
  }

  // 事件名映射到保利威的命名
  const listeners = {}
  const bind = (domEvent, polyvEvent) => {
    video.addEventListener(domEvent, () => {
      ;(listeners[polyvEvent] || []).forEach((cb) => cb())
    })
  }
  bind('play', 's2j_onVideoPlay')
  bind('pause', 's2j_onVideoPause')
  bind('ended', 's2j_onPlayOver')

  return {
    on(event, cb) {
      if (!listeners[event]) {
        listeners[event] = []
      }
      listeners[event].push(cb)
    },
    j2s_getCurrentTime() {
      return Math.floor(video.currentTime) || 0
    },
    j2s_pauseVideo() {
      video.pause()
    },
    j2s_resumeVideo() {
      video.play()
    },
    destroy() {
      video.pause()
      video.removeAttribute('src')
      video.load()
      if (video.parentNode) {
        video.parentNode.removeChild(video)
      }
    }
  }
}

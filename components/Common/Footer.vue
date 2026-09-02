<template>
  <el-footer v-if="info" class="footer-bottom">
    <div class="foot-line">
      <span class="site-name">{{ info.websiteName || '培训平台' }}</span>
      <span class="sep">·</span>
      <span class="scope">内部培训系统，仅供在职员工使用</span>
    </div>

    <div class="foot-line links">
      <a href="javascript:;" @click="openDoc('privacy')">隐私政策</a>
      <span class="sep">|</span>
      <a href="javascript:;" @click="openDoc('about')">关于我们</a>
      <span class="sep">|</span>
      <span class="help">使用问题请联系人力资源部</span>
    </div>

    <div class="foot-line dim">
      <span v-html="info.websiteCopyright || '璟邑科技'" />
      <span class="sep">·</span>
      <span>© {{ year }}</span>
      <!-- 备案号在有值时才显示。内部系统在没对外开放前是空的，
           挂个空链接反而显得没配好 -->
      <template v-if="info.websiteIcp">
        <span class="sep">·</span>
        <a href="https://beian.miit.gov.cn/" target="_blank">{{ info.websiteIcp }}</a>
      </template>
      <template v-if="info.websitePrn">
        <span class="sep">·</span>
        <a :href="'https://beian.mps.gov.cn/#/query/webSearch?code=' + info.websitePrnNo" target="_blank">
          <!-- 二开：原为外链 roncoo CDN 的备案徽标，内网访问不到会裂图，直接显示备案号文字 -->
          {{ info.websitePrn }}
        </a>
      </template>
    </div>

    <common-agreement v-model="docShow" :type="docType" />
  </el-footer>
</template>
<script setup>
  // 与 Header 共用同一份取数结果，不再各拉一次、也不再落 localStorage
  const info = useWebsiteInfo()

  const year = new Date().getFullYear()

  const docShow = ref(false)
  const docType = ref('privacy')
  const openDoc = (type) => {
    docType.value = type
    docShow.value = true
  }
</script>
<style lang="scss" scoped>
  .footer-bottom {
    background: rgb(51, 51, 51);
    z-index: 999;
    // 版权和备案号在窄屏会换行，固定高度会把第二行裁掉
    height: auto;
    min-height: 60px;
    padding: 5px 12px;
    box-sizing: border-box;
  }

  .foot-line {
    text-align: center;
    line-height: 24px;
    color: #c8c9cc;
    font-size: 13px;

    a {
      color: #c8c9cc;

      &:hover {
        color: #fff;
        text-decoration: underline;
      }
    }
  }

  .site-name {
    color: #f0f0f0;
    font-weight: 500;
  }

  .scope {
    font-size: 12px;
  }

  .sep {
    margin: 0 8px;
    color: #6b6b6b;
  }

  .help {
    font-size: 12px;
  }

  // 版权与备案号是次要信息，压暗一档，视觉重心留给上面两行
  .dim {
    color: #8c8c8c;
    font-size: 12px;

    a {
      color: #8c8c8c;
    }
  }

  @media (max-width: 768px) {
    .footer-bottom {
      padding: 10px 12px;
    }
    // 手机上「仅供在职员工使用」这类补充说明换行会占掉两行，直接收起
    .scope,
    .help {
      display: none;
    }
    .site-name + .sep {
      display: none;
    }
  }
</style>

<template>
  <el-footer v-if="info" class="footer-bottom">
    <div v-if="info.websiteCopyright" class="copyright">
      <span v-html="info.websiteCopyright" />
    </div>
    <div class="icp_num">
      <span v-if="info.websiteIcp">
        <a href="https://beian.miit.gov.cn/" target="_blank" class="lingke_link">{{ info.websiteIcp }}</a>
      </span>
      <span v-if="info.websitePrn">
        &nbsp;|&nbsp;
        <a :href="'https://beian.mps.gov.cn/#/query/webSearch?code=' + info.websitePrnNo" target="_blank" class="lingke_link">
          <!-- 二开：原为外链 roncoo CDN 的备案徽标，内网访问不到会裂图，直接显示备案号文字 -->
          {{ info.websitePrn }}
        </a>
      </span>
    </div>
  </el-footer>
</template>
<script setup>
  // 与 Header 共用同一份取数结果，不再各拉一次、也不再落 localStorage
  const info = useWebsiteInfo()
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

  .copyright {
    min-height: 20px;
    line-height: 20px;
    text-align: center;
    padding-top: 5px;
    color: #ccc;

    a {
      color: #ccc;
    }
  }

  .icp_num {
    min-height: 30px;
    line-height: 30px;
    text-align: center;
    color: #ccc;

    .lingke_link {
      color: #ccc;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .prn_icon {
    width: 12px;
    height: 12px;
    position: relative;
  }
</style>

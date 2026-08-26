<template>
  <div v-if="friendLinkList" class="friend">
    <div class="friend_link">
      <div class="link_one">友情链接:</div>
      <div v-for="(item, index) in friendLinkList" :key="index">
        <a :href="item.linkUrl" :target="item.linkTarget">{{ item.linkName }}</a>
      </div>
    </div>
  </div>
</template>
<script setup>
  // 友链同样不再走 localStorage 缓存，后台改完下次打开就生效
  const friendLinkList = useWebsiteLink()
</script>
<style lang="scss" scoped>
  .friend {
    clear: both;
    background-color: rgb(51, 51, 51);
    // 原为写死 30px，窄屏下友链会换行被截断
    min-height: 30px;
    width: 100%;
    overflow: hidden;

    .friend_link {
      width: 100%;
      max-width: 1200px;
      padding: 10px 16px 0;
      box-sizing: border-box;
      margin: 0 auto;

      div {
        float: left;
        font-size: 14px;

        &.link_one {
          color: #fff;
          margin-right: 20px;
        }

        a {
          color: #ccc;
          margin: 0px 10px;

          &:hover {
            color: #fff;
            text-decoration: none;
          }
        }
      }
    }
  }
</style>

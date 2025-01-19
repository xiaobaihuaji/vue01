<template>
  <div id="app">
    <!-- Header，负责显示状态栏 -->
    <Header @changePage="handleChangePage" :currentPage="currentPage" />

    <!-- 根据 currentPage 的值，决定显示哪个主体界面 -->
    <div class="container">
      <Content 
        v-if="currentPage === 'status'" 
      />
      <LogContent 
        v-else-if="currentPage === 'log'"
      />
      <SystemsettingContent 
        v-else-if="currentPage === 'SystemsettingContent'"
      />
      <!-- 可以继续增加更多页面，如： -->
      <!-- <AnotherComponent v-else-if="currentPage === 'anotherPage'" /> -->
    </div>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Content from './components/Content.vue'
import LogContent from './components/LogContent.vue'
import SystemsettingContent from './components/SystemsettingContent.vue';

export default {
  name: 'App',
  components: {
    Header,
    Content,
    LogContent,
    SystemsettingContent,  // 引入 SystemsettingContent 组件
  },
  data() {
    return {
      // 默认显示第一个页面：状态概览
      currentPage: 'status'  // 默认为 'status' 页面
    }
  },
  methods: {
    // 统一处理来自 Header 或其他组件的 "切换页面" 事件
    handleChangePage(pageName) {
      this.currentPage = pageName  // 更新 currentPage，控制显示不同的组件
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  padding: 20px;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
}
</style>
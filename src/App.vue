<template>
  <div id="app">
    <!-- 1. 未认证时，先显示登录组件 -->
    <Login
      v-if="!isAuthenticated"
      @login-success="onLoginSuccess"
    />

    <!-- 2. 认证通过后，显示整站内容 -->
    <div v-else>
      <!-- Header，负责显示状态栏 -->
      <Header
        @changePage="handleChangePage"
        :currentPage="currentPage"
      />

      <div class="container">
        <Content                    v-if="currentPage === 'status'" />
        <LogContent                 v-else-if="currentPage === 'log'" />
        <SystemsettingContent       v-else-if="currentPage === 'SystemsettingContent'" />
        <netsetting                 v-else-if="currentPage === 'NetworkSettings'" />
        <MultiplexingInput          v-else-if="currentPage === 'MultiplexingInput'" />
        <ClockSync                  v-else-if="currentPage === 'ClockSync'" />
        <ModulationOutput           v-else-if="currentPage === 'ModulationOutput'" />
        <BasebandRecording          v-else-if="currentPage === 'BasebandRecording'" />
        <!-- <PAPR                       v-else-if="currentPage === 'PAPR'" /> -->
        <!-- <RFOutput                   v-else-if="currentPage === 'RFOutput'" /> -->
        <EnvelopeOutput             v-else-if="currentPage === 'EnvelopeOutput'" />
      </div>
    </div>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Content from './components/Content.vue'
import LogContent from './components/LogContent.vue'
import SystemsettingContent from './components/SystemsettingContent.vue'
import netsetting from './components/netsetting.vue'
import MultiplexingInput from './components/MultiplexingInput.vue'
import ClockSync from './components/ClockSync.vue'
import ModulationOutput from './components/ModulationOutput.vue'
import BasebandRecording from './components/BasebandRecording.vue'
//import PAPR from './components/PAPR.vue'
//import RFOutput from './components/RFOutput.vue'
import EnvelopeOutput from './components/EnvelopeOutput.vue'
import Login from './components/Login.vue'  // ← 新增

export default {
  name: 'App',
  components: {
    Header,
    Content,
    LogContent,
    SystemsettingContent,
    netsetting,
    MultiplexingInput,
    ClockSync,
    ModulationOutput,
    BasebandRecording,
    //PAPR,
    //RFOutput,
    EnvelopeOutput,
    Login                            // ← 新增
  },
  data() {
    return {
      currentPage: 'status',        // 默认页面
      isAuthenticated: false        // 登录状态
    }
  },
  methods: {
    handleChangePage(pageName) {
      this.currentPage = pageName
    },
    onLoginSuccess() {
      // 从 Login.vue 收到登录成功事件
      this.isAuthenticated = true
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

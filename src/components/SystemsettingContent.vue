<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>系统设置</h2>

        <!-- WebSocket连接状态 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 修改密码部分 -->
        <div class="section">
          <h3>修改登录密码</h3>
          <table>
            <tr>
              <td>当前密码：</td>
              <td>
                <input
                  type="password"
                  v-model="currentPassword"
                  placeholder="请输入当前密码"
                />
              </td>
            </tr>
            <tr>
              <td>新密码：</td>
              <td>
                <input
                  type="password"
                  v-model="newPassword"
                  placeholder="请输入新密码"
                />
              </td>
            </tr>
            <tr>
              <td>重复新密码：</td>
              <td>
                <input
                  type="password"
                  v-model="confirmPassword"
                  placeholder="请再次输入新密码"
                />
              </td>
            </tr>
          </table>
          <div class="button-container">
            <button
              @click="changePassword"
              :disabled="!isPasswordFormValid"
              :class="{ disabled: !isPasswordFormValid }"
            >
              应用
            </button>
          </div>
          <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
        </div>

        <!-- 日期/时间设置部分 -->
        <div class="section">
          <h3>日期/时间设置</h3>
          <table>
            <tr>
              <td>日期：</td>
              <td class="system-time-date">
                <input type="text" v-model="date" placeholder="YYYY-MM-DD" />
                <button @click="applySystemDate">应用</button>
              </td>
            </tr>
            <tr>
              <td>时间：</td>
              <td class="system-time-date">
                <input type="text" v-model="time" placeholder="HH:MM:SS" />
                <button @click="applySystemTime">应用</button>
              </td>
            </tr>
          </table>
          <div class="button-container">
            <button @click="getSystemTime" class="system-time-btn">
              从浏览器自动设置
            </button>
          </div>
        </div>

        <!-- 成功提示弹窗 -->
        <div v-if="showSuccessModal" class="modal">
          <p>{{ successMessage }}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import WebSocketService from '@/store/websocket';

export default {
  name: 'SystemsettingContent',
  data() {
    return {
      // WebSocket 状态
      wsConnected: false,
      // 密码
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      storedPassword: '',
      // 日期/时间
      date: '',
      time: '',
      // 弹窗 & 错误
      showSuccessModal: false,
      successMessage: '',
      errorMessage: '',
      lastOperation: { type: '', data: null }
    };
  },
  computed: {
    isPasswordFormValid() {
      return this.currentPassword && this.newPassword && this.confirmPassword;
    }
  },
  methods: {
    // —— WebSocket 初始化与状态监测 —— 
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleMessage);
      this.checkConnection();
    },
    checkConnection() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(this.checkConnection, 2000);
    },
    // —— 处理后台消息 —— 
    handleMessage(data) {
      if (data && data.error) {
        console.error('通信错误', data.details);
        return;
      }
      if (typeof data === 'string') {
        try { data = JSON.parse(data); }
        catch (e) { return; }
      }
      if (data.params) {
        data.params.forEach(p => {
          if (p.result === 'success') this.updateValue(p.key, p.value);
        });
      } else {
        Object.keys(data).forEach(k => this.updateValue(k, data[k]));
      }
    },
    updateValue(key, value) {
      switch (key) {
        case 'system.systemDate':
          this.date = value; break;
        case 'system.systemTime':
          this.time = value; break;
      }
    },

    // —— 修改密码 —— 
    changePassword() {
      this.errorMessage = '';
      if (this.currentPassword !== this.storedPassword) {
        this.errorMessage = '当前密码错误';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = '两次输入的新密码不一致';
        return;
      }
      localStorage.setItem('loginPassword', this.newPassword);
      this.storedPassword = this.newPassword;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.showSuccess('密码修改成功！');
    },

    // —— 系统日期/时间 —— 
    applySystemDate() {
      const data = { 'system.systemDate': this.date };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('日期设置成功！');
    },
    applySystemTime() {
      const data = { 'system.systemTime': this.time };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('时间设置成功！');
    },
    getSystemTime() {
      const now = new Date();
      this.date = now.toISOString().slice(0, 10);
      this.time = now.toTimeString().slice(0, 8);
    },

    // —— 通用成功提示 —— 
    showSuccess(msg) {
      this.successMessage = msg;
      this.showSuccessModal = true;
      setTimeout(() => {
        this.showSuccessModal = false;
        this.successMessage = '';
      }, 1000);
    }
  },
  mounted() {
    // 初始化
    this.storedPassword = localStorage.getItem('loginPassword') || '666666';
    this.initWebSocket();
    // 拉取初始日期时间
    setTimeout(() => {
      const keys = [
        'system.systemDate',
        'system.systemTime'
      ];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
    }, 500);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleMessage);
  }
};
</script>

<style scoped>
.content-wrapper {
  flex: 1; padding: 20px; background: #f4f4f4;
  display: flex; justify-content: center;
}
.content {
  width: 100%; max-width: 1000px; background: #fff;
  padding: 20px; border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.content-container { max-width: 800px; margin: 0 auto; }
.connection-status {
  margin-bottom: 15px; padding: 8px;
  background: #fcc; border-radius: 4px;
  text-align: center;
}
.connection-status.connected { background: #cfc; }
.section { margin-bottom: 40px; }
h2 { margin-bottom: 30px; }
h3 { margin-bottom: 20px; }
table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
td { padding: 10px; vertical-align: middle; }
td:first-child { width: 120px; }
input[type="text"],
input[type="password"] {
  width: 100%; padding: 8px;
  border: 1px solid #ddd; border-radius: 3px;
}
.button-container { display: flex; gap: 10px; }
button {
  background: #003366; color: #fff;
  border: none; padding: 10px 20px;
  border-radius: 3px; cursor: pointer;
}
button.disabled { background: #ccc; cursor: not-allowed; }
button:hover:not(.disabled) { background: #004488; }
.system-time-btn {
  background: #4CAF50; margin-top: 10px;
}
.system-time-btn:hover { background: #45a049; }
.error-msg {
  margin-top: 10px; color: red;
  font-size: 0.9em;
}
.modal {
  position: fixed; top:50%; left:50%;
  transform:translate(-50%,-50%);
  background: #003366; color: #fff;
  padding:20px; border-radius:5px;
  text-align:center; box-shadow:0 0 20px rgba(0,0,0,0.2);
  z-index:1000;
}
</style>
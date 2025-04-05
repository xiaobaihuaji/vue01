<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>复用流输入</h2>

        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 表格 -->
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>输入接口设置</td>
            <td>
              <select v-model="inputInterfaceSetting">
                <option value="ETH1">ETH1</option>
                <option value="ETH2">ETH2</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>当前输入端口</td>
            <td>{{ currentInputPort }}</td>
          </tr>
          <tr>
            <td>来源IP</td>
            <td>{{ sourceIP }}</td>
          </tr>
          <tr>
            <td>输入帧计数器</td>
            <td>{{ inputFrameCounter }}</td>
          </tr>
          <tr>
            <td>错误帧计数器</td>
            <td>{{ errorFrameCounter }}</td>
          </tr>
          <tr>
            <td>PFT使能状态</td>
            <td>{{ pftStatus }}</td>
          </tr>
          <tr>
            <td>插入空帧计数器</td>
            <td>{{ nullFrameCounter }}</td>
          </tr>
          <tr>
            <td>已产生的I/Q帧计数器</td>
            <td>{{ iqFrameCounter }}</td>
          </tr>
        </table>

        <!-- 按钮区域 -->
        <div class="buttons-area">
          <button @click="applySettings">应用</button>
          <button @click="refreshStatus">刷新状态</button>
        </div>

        <!-- 弹窗提示 -->
        <div v-if="isModalVisible" class="modal">
          <p>{{ modalMessage }}</p>
          <button @click="hideModal">关闭</button>
        </div>

        <!-- 错误提示弹窗 -->
        <div v-if="errorInfo.visible" class="modal error-modal">
          <h3>错误</h3>
          <p>{{ errorInfo.message }}</p>
          <div v-if="errorInfo.details" class="error-details">{{ errorInfo.details }}</div>
          <div class="modal-buttons">
            <button @click="hideErrorModal">关闭</button>
            <button @click="retryLastOperation">重试</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import WebSocketService from '@/store/websocket';

export default {
  name: 'MultiplexingInput',
  data() {
    return {
      wsConnected: false,
      // 初始设置：默认接口选择ETH1
      inputInterfaceSetting: 'ETH1',
      currentInputPort: '',
      sourceIP: '',
      inputFrameCounter: 0,
      errorFrameCounter: 0,
      pftStatus: 'FALSE',
      nullFrameCounter: 0,
      iqFrameCounter: 0,

      isModalVisible: false,
      modalMessage: '',

      errorInfo: {
        visible: false,
        message: '',
        details: ''
      },

      lastOperation: {
        type: '',
        data: null
      }
    }
  },
  methods: {
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => this.checkConnectionStatus(), 2000);
    },
    handleWebSocketMessage(data) {
      if (data.error) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }
      if (data.params) {
        data.params.forEach(param => {
          if (param.result === 'success') {
            this.updateValue(param.key, param.value);
          } else {
            this.showError(`参数 ${param.key} 获取失败`, param.error);
          }
        });
      }
    },
    // 更新传回的数据时，若带有 "mdiInputSettings." 前缀，则去除再更新对应变量
    updateValue(key, value) {
      if (key.startsWith('mdiInputSettings.')) {
        key = key.slice('mdiInputSettings.'.length);
      }
      switch (key) {
        case 'currentInputPort':
          this.currentInputPort = value;
          break;
        case 'sourceIP':
          this.sourceIP = value;
          break;
        case 'inputFrameCounter':
          this.inputFrameCounter = value;
          break;
        case 'errorFrameCounter':
          this.errorFrameCounter = value;
          break;
        case 'pftStatus':
          this.pftStatus = value;
          break;
        case 'nullFrameCounter':
          this.nullFrameCounter = value;
          break;
        case 'iqFrameCounter':
          this.iqFrameCounter = value;
          break;
        // 其它字段保留原值，如 inputInterfaceSetting 可能通过设置改变
        default:
          console.log(`未处理的字段: ${key}`);
      }
    },
    refreshStatus() {
      // 请求时使用带前缀的key
      const keys = [
        'mdiInputSettings.currentInputPort',
        'mdiInputSettings.sourceIP',
        'mdiInputSettings.inputFrameCounter',
        'mdiInputSettings.errorFrameCounter',
        'mdiInputSettings.pftStatus',
        'mdiInputSettings.nullFrameCounter',
        'mdiInputSettings.iqFrameCounter'
      ];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
      this.showSuccess('刷新成功！');
    },
    applySettings() {
      // 此处仅应用输入接口设置（如有其它设置可扩展）
      const data = { inputInterfaceSetting: this.inputInterfaceSetting };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('应用成功！');
    },
    showSuccess(message) {
      this.modalMessage = message;
      this.isModalVisible = true;
    },
    hideModal() {
      this.isModalVisible = false;
    },
    showError(message, details = '') {
      this.errorInfo = { visible: true, message, details };
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    retryLastOperation() {
      if (this.lastOperation.type === 'get') {
        WebSocketService.sendGetCommand(this.lastOperation.data);
      } else if (this.lastOperation.type === 'set') {
        WebSocketService.sendSetCommand(this.lastOperation.data);
      }
      this.hideErrorModal();
    }
  },
  mounted() {
    this.initWebSocket();
    setTimeout(() => {
      this.refreshStatus();
    }, 1000);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
  }
};
</script>

<style scoped>
.content-wrapper {
  flex: 1;
  padding: 20px;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
}
.content {
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.content-container {
  max-width: 800px;
  margin: 0 auto;
}
.connection-status {
  margin-bottom: 15px;
  padding: 8px;
  background-color: #ffcccc;
  border-radius: 4px;
  text-align: center;
}
.connection-status.connected {
  background-color: #ccffcc;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
table, th, td {
  border: 1px solid #ddd;
}
th, td {
  padding: 10px;
  text-align: left;
}
.buttons-area {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 10px;
}
button:hover {
  background-color: #004488;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #003366;
  color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
.modal button {
  margin-top: 10px;
  background-color: white;
  color: #003366;
}
.modal button:hover {
  background-color: #f0f0f0;
}
.error-modal {
  background-color: #cc3333;
  min-width: 300px;
}
.error-details {
  font-size: 0.9em;
  max-width: 400px;
  word-break: break-all;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
</style>

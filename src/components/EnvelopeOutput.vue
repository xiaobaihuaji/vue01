<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>包络输出</h2>

        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 包络输出设置 -->
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>电平增益</td>
            <td class="input-with-unit">
              <div class="input-with-buttons">
                <input 
                  type="number" 
                  v-model="gainValue" 
                  step="0.1"
                  placeholder="请输入电平增益"
                  @focus="showUpDownButtons = true"
                  @blur="showUpDownButtons = false"
                />
                <span class="unit">dB</span>
                <div v-if="showUpDownButtons" class="up-down-buttons">
                  <!-- 可根据需要开启上下增减功能 -->
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>直流补偿</td>
            <td class="input-with-unit">
              <div class="input-with-buttons">
                <input 
                  type="number" 
                  v-model="dcCompensation" 
                  step="0.1"
                  placeholder="请输入直流补偿"
                  @focus="showUpDownButtons = true"
                  @blur="showUpDownButtons = false"
                />
                <span class="unit">%</span>
                <div v-if="showUpDownButtons" class="up-down-buttons">
                  <!-- 可根据需要开启上下增减功能 -->
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- 应用按钮 -->
        <button @click="applyEnvelope">应用</button>

        <!-- 弹窗提示（操作结果） -->
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
  name: 'EnvelopeOutput',
  data() {
    return {
      // 包络输出相关数据（使用 exciter 前缀）
      gainValue: -6.0,       // 对应 key: exciter.rfEnvelopeLevel
      dcCompensation: 0.0,   // 对应 key: exciter.rfEnvelopeDC

      // 弹窗控制
      isModalVisible: false,
      modalMessage: '',
      showUpDownButtons: false,

      // WebSocket相关数据
      wsConnected: false,
      errorInfo: {
        visible: false,
        message: '',
        details: ''
      },
      // 记录上次操作（用于重试）
      lastOperation: {
        type: '',
        data: null
      }
    };
  },
  methods: {
    // ----------------------- WebSocket 初始化及状态检测 -----------------------
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => {
        this.checkConnectionStatus();
      }, 2000);
    },
    // ----------------------- WebSocket 消息处理 -----------------------
    handleWebSocketMessage(data) {
      console.log('收到WebSocket消息:', data);
      if (data && data.error === true) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('无法解析响应数据:', e);
          this.showError('无法解析服务器响应', data);
          return;
        }
      }
      if (data && data.params) {
        data.params.forEach(param => {
          if (param.result === 'success') {
            this.updateParameterValue(param.key, param.value);
          } else {
            console.error(`参数 ${param.key} 获取失败: ${param.error || '未知错误'}`);
            this.showError(`参数 ${param.key} 获取失败`, param.error || '未知错误');
          }
        });
      } else if (data) {
        Object.keys(data).forEach(key => {
          this.updateParameterValue(key, data[key]);
        });
      }
    },
    // ----------------------- 参数更新 -----------------------
    updateParameterValue(key, value) {
      // 如果 key 带有 "exciter." 前缀，则去除该前缀
      if (key.startsWith('exciter.')) {
        key = key.slice('exciter.'.length);
      }
      switch(key) {
        case 'rfEnvelopeLevel':
          this.gainValue = parseFloat(value);
          break;
        case 'rfEnvelopeDC':
          this.dcCompensation = parseFloat(value);
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
      // 获取或设置成功后显示提示
      this.showModal('获取/设置成功');
    },
    // ----------------------- 应用操作 -----------------------
    applyEnvelope() {
      // 组装 set 命令对象，使用 exciter 前缀
      const data = {
        'exciter.rfEnvelopeLevel': parseFloat(this.gainValue).toFixed(1),
        'exciter.rfEnvelopeDC': parseFloat(this.dcCompensation).toFixed(1)
      };
      this.lastOperation = { type: 'set', data: data };
      WebSocketService.sendSetCommand(data);
      this.showModal('正在应用设置...');
    },
    // ----------------------- 弹窗与错误处理 -----------------------
    showModal(message) {
      this.modalMessage = message;
      this.isModalVisible = true;
      setTimeout(() => {
        this.hideModal();
      }, 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },
    showError(message, details = '') {
      this.errorInfo = {
        visible: true,
        message: message,
        details: details
      };
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    retryLastOperation() {
      if (this.lastOperation.type && this.lastOperation.data) {
        if (this.lastOperation.type === 'get') {
          WebSocketService.sendGetCommand(this.lastOperation.data);
        } else if (this.lastOperation.type === 'set') {
          WebSocketService.sendSetCommand(this.lastOperation.data);
        }
      }
      this.hideErrorModal();
    }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();
    // 延时获取初始值，使用带前缀的 key
    setTimeout(() => {
      const keys = [
        'exciter.rfEnvelopeLevel',
        'exciter.rfEnvelopeDC'
      ];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
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
.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}
.input-with-buttons {
  display: flex;
  align-items: center;
}
.input-with-buttons input {
  width: 100px;
  padding: 5px;
  margin-right: 10px;
}
.unit {
  color: #999;
}
.up-down-buttons button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  margin-left: 5px;
}
.up-down-buttons button:hover {
  background-color: #004488;
}
button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}
button:hover {
  background-color: #004488;
}
.custom-select {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}
.custom-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
}
.blue-btn {
  background-color: #1890ff;
}
.blue-btn:hover {
  background-color: #40a9ff;
}
.orange-btn {
  background-color: #f5a623;
}
.orange-btn:hover {
  background-color: #ffbb33;
}
.green-btn {
  background-color: #90ee90;
  color: #333;
}
.green-btn:hover {
  background-color: #a2fca2;
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
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #1890ff;
}
input:checked + .slider:before {
  transform: translateX(30px);
}
.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}
.input-with-unit input {
  padding-right: 50px;
  width: 200px;
}
.unit {
  color: #999;
  margin-left: 8px;
}
.note {
  margin-left: 10px;
  color: #666;
  font-size: 0.9em;
}
</style>

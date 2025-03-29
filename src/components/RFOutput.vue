<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>射频输出</h2>

        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 射频输出设置 -->
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>输出使能</td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="outputEnabled" />
                <span class="slider"></span>
              </label>
            </td>
          </tr>
          <tr>
            <td>中心频率</td>
            <td class="input-with-unit">
              <div class="input-with-buttons">
                <input 
                  type="number" 
                  v-model="centerFrequency" 
                  step="0.001"
                  placeholder="请输入中心频率"
                  @focus="showUpDownButtons = true"
                  @blur="showUpDownButtons = false"
                />
                <span class="unit">MHz</span>
                <div v-if="showUpDownButtons" class="up-down-buttons">
                  <!-- 可根据需要开启上下增减功能 -->
                  <!-- <button @click="incrementFrequency">↑</button>
                  <button @click="decrementFrequency">↓</button> -->
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>输出功率</td>
            <td class="input-with-unit">
              <div class="input-with-buttons">
                <input 
                  type="number" 
                  v-model="outputPower" 
                  step="0.1"
                  placeholder="请输入输出功率"
                  @focus="showUpDownButtons = true"
                  @blur="showUpDownButtons = false"
                />
                <span class="unit">dB</span>
                <div v-if="showUpDownButtons" class="up-down-buttons">
                  <!-- <button @click="incrementPower">↑</button>
                  <button @click="decrementPower">↓</button> -->
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>调相使能</td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="fmEnabled" />
                <span class="slider"></span>
              </label>
            </td>
          </tr>
          <tr>
            <td>调幅使能</td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="amEnabled" />
                <span class="slider"></span>
              </label>
            </td>
          </tr>
        </table>

        <!-- 应用按钮 -->
        <button @click="applyRFOutput">应用</button>

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
  name: 'RFOutput',
  data() {
    return {
      // 射频输出相关数据
      outputEnabled: false,         // 对应后端 key：exciter.rfOutputEnable
      centerFrequency: 15.120,        // 对应后端 key：exciter.rfOutputFreq (单位MHz)
      outputPower: -8.4,              // 对应后端 key：exciter.rfOutputPower (单位dB)
      fmEnabled: false,             // 对应后端 key：exciter.rfPMEnable
      amEnabled: false,             // 对应后端 key：exciter.rfAMEnable

      // 弹窗控制
      isModalVisible: false,
      modalMessage: '',

      // 输入框上下按钮显示控制
      showUpDownButtons: false,

      // WebSocket相关数据
      wsConnected: false,
      errorInfo: {
        visible: false,
        message: '',
        details: ''
      },
      // 用于记录上次操作（方便重试）
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
      switch(key) {
        case 'exciter.rfOutputEnable':
          this.outputEnabled = value;
          break;
        case 'exciter.rfOutputFreq':
          // 后端返回可能为字符串，转换成数值
          this.centerFrequency = parseFloat(value);
          break;
        case 'exciter.rfOutputPower':
          this.outputPower = parseFloat(value);
          break;
        case 'exciter.rfPMEnable':
          this.fmEnabled = value;
          break;
        case 'exciter.rfAMEnable':
          this.amEnabled = value;
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
      // 隐藏处理弹窗并显示成功提示
      this.hideProcessingModal();
      this.showSuccess();
    },
    // ----------------------- 射频输出设置 -----------------------
    applyRFOutput() {
      // 组装set命令对象（注意：按照要求中心频率保留3位小数）
      const data = {
        'exciter.rfOutputEnable': this.outputEnabled,
        'exciter.rfOutputFreq': this.centerFrequency.toFixed(3),
        'exciter.rfOutputPower': parseFloat(this.outputPower),
        'exciter.rfPMEnable': this.fmEnabled,
        'exciter.rfAMEnable': this.amEnabled
      };
      this.lastOperation = {
        type: 'set',
        data: data
      };
      WebSocketService.sendSetCommand(data);
      // 显示操作成功提示（实际结果以后端响应为准）
      this.showSuccess();
    },
    // ----------------------- 开窗与错误提示 -----------------------
    showSuccess() {
      this.modalMessage = '操作成功！';
      this.isModalVisible = true;
      setTimeout(() => {
        this.hideModal();
      }, 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },
    showProcessingModal(message) {
      // 可根据需要增加独立的处理弹窗，目前直接调用 showModal
      this.modalMessage = message;
      this.isModalVisible = true;
    },
    hideProcessingModal() {
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
    // 如果需要实现中心频率或输出功率的增减，可在此添加对应的方法
    // incrementFrequency() { … }、decrementFrequency() { … }
    // incrementPower() { … }、decrementPower() { … }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();
    // 延时请求初始射频输出参数
    setTimeout(() => {
      const keys = [
        'exciter.rfOutputEnable',
        'exciter.rfOutputFreq',
        'exciter.rfOutputPower',
        'exciter.rfPMEnable',
        'exciter.rfAMEnable'
      ];
      this.lastOperation = {
        type: 'get',
        data: keys
      };
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

h2 {
  text-align: center;
  margin-bottom: 30px;
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
  width: 120px;
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

/* Switch样式 */
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
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
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
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1890ff;
}

input:checked + .slider:before {
  transform: translateX(30px);
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

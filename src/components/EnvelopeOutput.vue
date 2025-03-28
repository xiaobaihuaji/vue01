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
                  <!-- 可根据需要开启上下增减功能
                  <button @click="incrementGain">↑</button>
                  <button @click="decrementGain">↓</button>
                  -->
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
                  <!--
                  <button @click="incrementCompensation">↑</button>
                  <button @click="decrementCompensation">↓</button>
                  -->
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
      // 包络输出相关数据
      gainValue: -6.0,       // 对应后端 key: exciter.RfEnvelopeLevel
      dcCompensation: 0.0,   // 对应后端 key: exciter.RfEnvelopeDC

      // 弹窗控制
      isModalVisible: false,
      modalMessage: '',
      showUpDownButtons: false, // 控制上下按钮显示

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

      // 如果有错误属性，显示错误
      if (data && data.error === true) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }
      // 如果数据是字符串，尝试解析
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('无法解析响应数据:', e);
          this.showError('无法解析服务器响应', data);
          return;
        }
      }
      // 处理返回的数据
      if (data && data.params) {
        // params为数组
        data.params.forEach(param => {
          if (param.result === 'success') {
            this.updateParameterValue(param.key, param.value);
          } else {
            console.error(`参数 ${param.key} 获取失败: ${param.error || '未知错误'}`);
            this.showError(`参数 ${param.key} 获取失败`, param.error || '未知错误');
          }
        });
      } else if (data) {
        // 兼容旧的直接键值对格式
        Object.keys(data).forEach(key => {
          this.updateParameterValue(key, data[key]);
        });
      }
    },
    // ----------------------- 参数更新 -----------------------
    updateParameterValue(key, value) {
      switch(key) {
        case 'exciter.RfEnvelopeLevel':
          // 电平增益
          this.gainValue = parseFloat(value);
          break;
        case 'exciter.RfEnvelopeDC':
          // 直流补偿
          this.dcCompensation = parseFloat(value);
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
      // 显示成功提示
      this.showModal('获取/设置成功');
    },
    // ----------------------- 应用操作 -----------------------
    applyEnvelope() {
      // 组装set命令对象
      const data = {
        'exciter.RfEnvelopeLevel': parseFloat(this.gainValue).toFixed(1),
        'exciter.RfEnvelopeDC': parseFloat(this.dcCompensation).toFixed(1)
      };
      this.lastOperation = {
        type: 'set',
        data: data
      };
      WebSocketService.sendSetCommand(data);
      this.showModal('正在应用设置...');
    },
    // ----------------------- 弹窗方法 -----------------------
    showModal(message) {
      this.modalMessage = message;
      this.isModalVisible = true;
    },
    hideModal() {
      this.isModalVisible = false;
    },
    // ----------------------- 错误处理 -----------------------
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
    },
    // ----------------------- 增减操作（可选） -----------------------
    incrementGain() {
      this.gainValue = (parseFloat(this.gainValue) + 0.1).toFixed(1);
    },
    decrementGain() {
      this.gainValue = (parseFloat(this.gainValue) - 0.1).toFixed(1);
    },
    incrementCompensation() {
      this.dcCompensation = (parseFloat(this.dcCompensation) + 0.1).toFixed(1);
    },
    decrementCompensation() {
      this.dcCompensation = (parseFloat(this.dcCompensation) - 0.1).toFixed(1);
    }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();
    // 延时获取初始值
    setTimeout(() => {
      const keys = [
        'exciter.RfEnvelopeLevel',
        'exciter.RfEnvelopeDC'
      ];
      this.lastOperation = {
        type: 'get',
        data: keys
      };
      WebSocketService.sendGetCommand(keys);
    }, 1000);
  },
  beforeUnmount() {
    // 组件卸载前注销WebSocket消息回调
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

h2 {
  text-align: center;
  margin-bottom: 30px;
}

/* WebSocket连接状态提示 */
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

/* 弹窗 */
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

/* 错误弹窗 */
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

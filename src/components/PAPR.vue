<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>峰均比抑制（CFR）</h2>

        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 峰均比抑制输入框 -->
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>峰均比</td>
            <td class="input-with-unit">
              <div class="input-with-buttons">
                <input 
                  type="number"
                  v-model="peakToAverageSuppressLevel"
                  step="0.1"
                  placeholder="请输入峰均比"
                  @focus="showUpDownButtons = true"
                  @blur="handleInputBlur"
                />
                <span class="unit">dB</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- 应用按钮 -->
        <button @click="applyPAPR">应用</button>

        <!-- 操作/提示弹窗 -->
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
  name: 'PAPR',
  data() {
    return {
      // 峰均比抑制相关数据
      peakToAverageSuppressLevel: "7.0", // 默认值（字符串类型，便于处理输入）
      showUpDownButtons: false,         // 控制上下按钮显示

      // 弹窗控制
      isModalVisible: false,
      modalMessage: '',

      // WebSocket 相关
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
    // ----------------------- 根据返回的参数名更新对应的值 -----------------------
    updateParameterValue(key, value) {
      // 假设后端返回的键名为 "exciter.cfrValue"
      if (key === 'exciter.cfrValue') {
        // 更新界面显示
        this.peakToAverageSuppressLevel = parseFloat(value).toFixed(1);
        this.showModal('操作成功！');
      } else {
        console.log(`未处理的参数: ${key} = ${value}`);
      }
    },
    // ----------------------- 应用峰均比设置 -----------------------
    applyPAPR() {
      // 将输入的字符串转为数字并进行范围校验
      const value = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(value)) {
        this.showError('输入无效', '请输入有效的数字');
        return;
      }
      if (value < 6.0 || value > 12.0) {
        this.showError('调整失败', '峰均比范围为 6.0 ~ 12.0');
        return;
      }

      // 构造 set 命令数据，保留1位小数
      const sendValue = value.toFixed(1);
      const data = { 'exciter.cfrValue': sendValue };
      this.lastOperation = {
        type: 'set',
        data: data
      };

      // 发送 set 命令
      WebSocketService.sendSetCommand(data);
      // 显示“正在应用”提示（等待后端返回结果）
      this.showModal('正在应用...');
    },
    // ----------------------- 输入框失焦时的处理 -----------------------
    handleInputBlur() {
      const value = parseFloat(this.peakToAverageSuppressLevel);
      // 如果用户输入非数字，则保留原值（可自行调整逻辑）
      if (isNaN(value)) {
        // 可以保留也可以重置，这里简单地重置为"7.0"
        this.peakToAverageSuppressLevel = "7.0";
      } else {
        // 只格式化数字，不进行范围验证
        this.peakToAverageSuppressLevel = value.toFixed(1);
      }
    },
    // ----------------------- 弹窗控制 -----------------------
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
    }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();
    // 延迟请求初始值
    setTimeout(() => {
      const keys = ['exciter.cfrValue'];
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

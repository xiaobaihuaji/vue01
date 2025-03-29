<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <!-- 连接状态提示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 以太网1设置 -->
        <h2>以太网1设置</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>IP地址</td>
            <td>
              <input type="text" v-model="ethernetIP1" placeholder="请输入IP地址">
            </td>
          </tr>
          <tr>
            <td>子网掩码</td>
            <td>
              <input type="text" v-model="subnetMask1" placeholder="请输入子网掩码">
            </td>
          </tr>
          <tr>
            <td>网关地址</td>
            <td>
              <input type="text" v-model="gatewayAddress1" placeholder="请输入网关地址">
            </td>
          </tr>
          <tr>
            <td>组播IP组</td>
            <td>
              <input type="text" v-model="multicastIPGroup1" placeholder="请输入组播IP组">
              <span class="note">范围为：224.0.0.0到239.255.255.255</span>
            </td>
          </tr>
          <tr>
            <td>MDI输入端口</td>
            <td>
              <input type="number" v-model.number="mdiInputPort1" placeholder="请输入MDI输入端口">
              <span class="note">范围为：0-65535</span>
            </td>
          </tr>
          <tr>
            <td>MAC地址</td>
            <td>
              <input type="text" v-model="macAddress1" disabled>
            </td>
          </tr>
        </table>

        <!-- 以太网2设置 -->
        <h2>以太网2设置</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>IP地址</td>
            <td>
              <input type="text" v-model="ethernetIP2" placeholder="请输入IP地址">
            </td>
          </tr>
          <tr>
            <td>子网掩码</td>
            <td>
              <input type="text" v-model="subnetMask2" placeholder="请输入子网掩码">
            </td>
          </tr>
          <tr>
            <td>网关地址</td>
            <td>
              <input type="text" v-model="gatewayAddress2" placeholder="请输入网关地址">
            </td>
          </tr>
          <tr>
            <td>组播IP组</td>
            <td>
              <input type="text" v-model="multicastIPGroup2" placeholder="请输入组播IP组">
              <span class="note">范围为：224.0.0.0到239.255.255.255</span>
            </td>
          </tr>
          <tr>
            <td>MDI输入端口</td>
            <td>
              <input type="number" v-model.number="mdiInputPort2" placeholder="请输入MDI输入端口">
              <span class="note">范围为：0-65535</span>
            </td>
          </tr>
          <tr>
            <td>MAC地址</td>
            <td>
              <input type="text" v-model="macAddress2" disabled>
            </td>
          </tr>
        </table>

        <!-- 应用按钮 -->
        <div class="button-container">
          <button @click="applySettings">应用</button>
          <button @click="refreshSettings">刷新</button>
        </div>

        <!-- 应用成功弹窗提示 -->
        <div v-if="isApplyModalVisible" class="modal">
          <p>应用成功！</p>
          <button @click="hideApplyModal">关闭</button>
        </div>

        <!-- 刷新成功弹窗提示 -->
        <div v-if="isRefreshModalVisible" class="modal">
          <p>刷新成功！</p>
          <button @click="hideRefreshModal">关闭</button>
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
  name: 'NetSetting',
  data() {
    return {
      // WebSocket连接状态
      wsConnected: false,

      // 以太网1设置
      ethernetIP1: '',
      subnetMask1: '',
      gatewayAddress1: '',
      multicastIPGroup1: '',
      mdiInputPort1: '',
      macAddress1: '00:00:00:00:00:00', // 示例MAC地址，实际应从设备获取

      // 以太网2设置
      ethernetIP2: '',
      subnetMask2: '',
      gatewayAddress2: '',
      multicastIPGroup2: '',
      mdiInputPort2: '',
      macAddress2: '00:00:00:00:00:00', // 示例MAC地址，实际应从设备获取

      // 弹窗控制
      isApplyModalVisible: false,
      isRefreshModalVisible: false,

      // 错误信息
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
    }
  },
  methods: {
    // 初始化WebSocket连接
    initWebSocket() {
      WebSocketService.connect();
      // 注册消息处理回调
      WebSocketService.onMessage(this.handleWebSocketMessage);
      // 监听WebSocket连接状态
      this.checkConnectionStatus();
    },

    // 检查WebSocket连接状态
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => {
        this.checkConnectionStatus();
      }, 2000);
    },

    // 处理WebSocket消息
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
      
      // 处理格式化的响应
      if (data && data.params) {
        // 处理返回的参数数组
        data.params.forEach(param => {
          if (param.result === 'success') {
            const key = param.key;
            const value = param.value;
            
            // 根据键名更新UI状态
            this.updateParameterValue(key, value);
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
    
    // 根据参数名更新对应的值
    updateParameterValue(key, value) {
      switch(key) {
        // 以太网1
        case 'ethernetIP1':
          this.ethernetIP1 = value;
          break;
        case 'subnetMask1':
          this.subnetMask1 = value;
          break;
        case 'gatewayAddress1':
          this.gatewayAddress1 = value;
          break;
        case 'multicastIPGroup1':
          this.multicastIPGroup1 = value;
          break;
        case 'mdiInputPort1':
          this.mdiInputPort1 = value;
          break;
        case 'macAddress1':
          this.macAddress1 = value;
          break;
          
        // 以太网2
        case 'ethernetIP2':
          this.ethernetIP2 = value;
          break;
        case 'subnetMask2':
          this.subnetMask2 = value;
          break;
        case 'gatewayAddress2':
          this.gatewayAddress2 = value;
          break;
        case 'multicastIPGroup2':
          this.multicastIPGroup2 = value;
          break;
        case 'mdiInputPort2':
          this.mdiInputPort2 = value;
          break;
        case 'macAddress2':
          this.macAddress2 = value;
          break;
          
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
    },

    // 应用设置
    applySettings() {
      // 验证输入
      if (!this.validateInputs()) {
        return;
      }
      
      // 构建以太网1设置对象
      const ethernet1Settings = {
        'ethernetIP1': this.ethernetIP1,
        'subnetMask1': this.subnetMask1,
        'gatewayAddress1': this.gatewayAddress1,
        'multicastIPGroup1': this.multicastIPGroup1,
        'mdiInputPort1': this.mdiInputPort1
      };
      
      // 构建以太网2设置对象
      const ethernet2Settings = {
        'ethernetIP2': this.ethernetIP2,
        'subnetMask2': this.subnetMask2,
        'gatewayAddress2': this.gatewayAddress2,
        'multicastIPGroup2': this.multicastIPGroup2,
        'mdiInputPort2': this.mdiInputPort2
      };
      
      // 合并设置并发送
      const allSettings = { ...ethernet1Settings, ...ethernet2Settings };
      
      // 保存操作以便重试
      this.lastOperation = {
        type: 'set',
        data: allSettings
      };
      
      if (WebSocketService.sendSetCommand(allSettings)) {
        this.showApplySuccess();
      } else {
        this.showError('无法发送设置命令');
      }
    },
    
    // 验证输入
    validateInputs() {
      // IP地址验证
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      if (!ipRegex.test(this.ethernetIP1)) {
        this.showError('以太网1 IP地址格式不正确');
        return false;
      }
      
      if (!ipRegex.test(this.ethernetIP2)) {
        this.showError('以太网2 IP地址格式不正确');
        return false;
      }
      
      if (!ipRegex.test(this.subnetMask1)) {
        this.showError('以太网1 子网掩码格式不正确');
        return false;
      }
      
      if (!ipRegex.test(this.subnetMask2)) {
        this.showError('以太网2 子网掩码格式不正确');
        return false;
      }
      
      if (!ipRegex.test(this.gatewayAddress1)) {
        this.showError('以太网1 网关地址格式不正确');
        return false;
      }
      
      if (!ipRegex.test(this.gatewayAddress2)) {
        this.showError('以太网2 网关地址格式不正确');
        return false;
      }
      
      // 组播IP验证（224.0.0.0 - 239.255.255.255）
      const multicastRegex = /^(22[4-9]|23[0-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      if (!multicastRegex.test(this.multicastIPGroup1)) {
        this.showError('以太网1 组播IP格式不正确或不在有效范围内');
        return false;
      }
      
      if (!multicastRegex.test(this.multicastIPGroup2)) {
        this.showError('以太网2 组播IP格式不正确或不在有效范围内');
        return false;
      }
      
      // MDI端口验证（0-65535）
      if (this.mdiInputPort1 < 0 || this.mdiInputPort1 > 65535) {
        this.showError('以太网1 MDI输入端口必须在0-65535范围内');
        return false;
      }
      
      if (this.mdiInputPort2 < 0 || this.mdiInputPort2 > 65535) {
        this.showError('以太网2 MDI输入端口必须在0-65535范围内');
        return false;
      }
      
      return true;
    },

    // 刷新设置
    refreshSettings() {
      const keys = [
        'ethernetIP1', 'subnetMask1', 'gatewayAddress1', 'multicastIPGroup1', 'mdiInputPort1', 'macAddress1',
        'ethernetIP2', 'subnetMask2', 'gatewayAddress2', 'multicastIPGroup2', 'mdiInputPort2', 'macAddress2'
      ];
      
      // 保存操作以便重试
      this.lastOperation = {
        type: 'get',
        data: keys
      };
      
      if (WebSocketService.sendGetCommand(keys)) {
        this.showRefreshSuccess();
      } else {
        this.showError('无法发送刷新命令');
      }
    },

    // 显示应用成功弹窗
    showApplySuccess() {
      this.isApplyModalVisible = true;
      setTimeout(() => {
        this.hideApplyModal();
      }, 2000);
    },
    
    // 隐藏应用成功弹窗
    hideApplyModal() {
      this.isApplyModalVisible = false;
    },
    
    // 显示刷新成功弹窗
    showRefreshSuccess() {
      this.isRefreshModalVisible = true;
      setTimeout(() => {
        this.hideRefreshModal();
      }, 2000);
    },
    
    // 隐藏刷新成功弹窗
    hideRefreshModal() {
      this.isRefreshModalVisible = false;
    },
    
    // 显示错误信息
    showError(message, details = '') {
      this.errorInfo = {
        visible: true,
        message: message,
        details: details
      };
    },
    
    // 隐藏错误弹窗
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    
    // 重试上次操作
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
    
    // 初始化时加载设置
    setTimeout(() => {
      this.refreshSettings();
    }, 1000);
  },
  beforeUnmount() {
    // 组件卸载前注销WebSocket消息回调
    WebSocketService.offMessage(this.handleWebSocketMessage);
  }
}
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

.button-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
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
  z-index: 100;
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

input {
  padding: 5px;
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

input:disabled {
  background-color: #f4f4f4;
  cursor: not-allowed;
}

.note {
  margin-left: 10px;
  color: #666;
  font-size: 0.9em;
}
</style>
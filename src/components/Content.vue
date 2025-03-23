<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>状态概览</h2>
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>工作状态</td>
            <td>{{ systemStatus }}</td>
          </tr>
          <tr>
            <td>主板温度</td>
            <td>{{ motherboardTemperature }}℃</td>
          </tr>
          <tr>
            <td>软件版本</td>
            <td>{{ softwareVersion }}</td>
          </tr>
          <tr>
            <td>序列号</td>
            <td>{{ serialNumber }}</td>
          </tr>
          <tr>
            <td>产品型号</td>
            <td>{{ productModel }}</td>
          </tr>
          <tr>
            <td>固件升级</td>
            <td>
              <button @click="startFirmwareUpgrade">固件升级</button>
            </td>
          </tr>
          <tr>
            <td>系统日期</td>
            <td class="system-time-date">
              <input type="text" v-model="systemDate" placeholder="YYYY-MM-DD">
              <button @click="applySystemDate">应用系统日期</button>
            </td>
          </tr>
          <tr>
            <td>系统时间</td>
            <td class="system-time-date">
              <input type="text" v-model="systemTime" placeholder="HH:MM:SS">
              <button @click="applySystemTime">应用系统时间</button>
            </td>
          </tr>
        </table>

        <!-- 按钮区域 -->
        <div class="buttons-area">
          <button @click="refreshStatus">刷新状态</button>
        </div>

        <!-- 刷新成功弹窗 -->
        <div v-if="isModalVisible" class="modal">
          <p>操作成功！</p>
          <button @click="hideModal">关闭</button>
        </div>

        <!-- 固件升级弹窗 -->
        <div v-if="isUpgrading" class="modal">
          <p>固件升级中</p>
        </div>

        <!-- 升级成功弹窗 -->
        <div v-if="upgradeSuccess" class="modal">
          <p>升级成功！</p>
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
  name: 'Content',
  data() {
    return {
      // WebSocket连接状态
      wsConnected: false,

      // 系统状态数据
      systemStatus: '未知',
      motherboardTemperature: 0,
      softwareVersion: '未知',
      serialNumber: '未知',
      productModel: '未知',
      systemDate: '',
      systemTime: '',

      // 弹窗控制
      isModalVisible: false,
      isUpgrading: false,
      upgradeSuccess: false,
      
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
        case 'system.systemStatus':
          this.systemStatus = value;
          break;
        case 'system.motherboardTemperature':
          this.motherboardTemperature = value;
          break;
        case 'system.softwareVersion':
          this.softwareVersion = value;
          break;
        case 'system.serialNumber':
          this.serialNumber = value;
          break;
        case 'system.productModel':
          this.productModel = value;
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
    },

    // 刷新状态
    refreshStatus() {
      // 获取系统状态信息，使用正确的属性名
      const keys = [
        'system.systemStatus',
        'system.motherboardTemperature',
        'system.softwareVersion',
        'system.serialNumber',
        'system.productModel'
      ];
      
      // 保存操作以便重试
      this.lastOperation = {
        type: 'get',
        data: keys
      };
      
      WebSocketService.sendGetCommand(keys);
      this.showSuccess();
    },

    // 刷新相关方法
    showSuccess() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.hideModal();
      }, 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },
    
    // 错误处理
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
    },

    // 固件升级相关方法
    startFirmwareUpgrade() {
      this.isUpgrading = true;
      // 5秒后显示升级成功
      setTimeout(() => {
        this.isUpgrading = false;
        this.upgradeSuccess = true;
        // 1秒后关闭升级成功提示
        setTimeout(() => {
          this.upgradeSuccess = false;
        }, 1000);
      }, 5000);
    },

    // 系统日期时间相关方法
    applySystemDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      this.systemDate = `${year}-${month}-${day}`;
      
      // 保存操作以便重试
      const data = { 'system.systemDate': this.systemDate };
      this.lastOperation = {
        type: 'set',
        data: data
      };
      
      // 使用正确的属性名设置系统日期
      WebSocketService.sendSetCommand(data);
      this.showSuccess();
    },

    applySystemTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.systemTime = `${hours}:${minutes}:${seconds}`;
      
      // 保存操作以便重试
      const data = { 'system.systemTime': this.systemTime };
      this.lastOperation = {
        type: 'set',
        data: data
      };
      
      // 使用正确的属性名设置系统时间
      WebSocketService.sendSetCommand(data);
      this.showSuccess();
    }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();
    
    // 延迟执行初始化操作，确保WebSocket连接已建立
    setTimeout(() => {
      // 初始化时获取系统日期时间
      this.applySystemDate();
      this.applySystemTime();
      
      // 初始化时获取状态信息
      this.refreshStatus();
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

.buttons-area {
  display: flex;
  justify-content: center;
  margin: 20px 0;
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

.system-time-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="text"] {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 150px;
}

h3 {
  margin-top: 5px;
  margin-bottom: 10px;
  color: white;
}
</style>
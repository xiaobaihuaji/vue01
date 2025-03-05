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
      upgradeSuccess: false
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
      // 根据返回数据更新界面状态
      if (data) {
        // 更新系统状态信息
        if (data['system.status'] !== undefined) {
          this.systemStatus = data['system.status'];
        }
        if (data['system.temperature'] !== undefined) {
          this.motherboardTemperature = data['system.temperature'];
        }
        if (data['system.version'] !== undefined) {
          this.softwareVersion = data['system.version'];
        }
        if (data['system.serialNumber'] !== undefined) {
          this.serialNumber = data['system.serialNumber'];
        }
        if (data['system.model'] !== undefined) {
          this.productModel = data['system.model'];
        }
      }
    },

    // 刷新状态
    refreshStatus() {
      // 获取系统状态信息
      WebSocketService.sendGetCommand([
        'system.status',
        'system.temperature',
        'system.version',
        'system.serialNumber',
        'system.model'
      ]);
      
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
      
      // 这里可以添加WebSocket通信代码来设置系统日期
      WebSocketService.sendSetCommand({
        'system.date': this.systemDate
      });
      
      this.showSuccess();
    },

    applySystemTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.systemTime = `${hours}:${minutes}:${seconds}`;
      
      // 这里可以添加WebSocket通信代码来设置系统时间
      WebSocketService.sendSetCommand({
        'system.time': this.systemTime
      });
      
      this.showSuccess();
    }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();
    
    // 初始化时获取系统时间日期
    this.applySystemDate();
    this.applySystemTime();
    
    // 初始化时获取状态信息
    this.refreshStatus();
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
  margin-top: 30px;
  margin-bottom: 10px;
  color: #003366;
}
</style>
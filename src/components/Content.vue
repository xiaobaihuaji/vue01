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

        <!-- DRM通道信息 -->
        <h3>DRM通道信息</h3>
        <table>
          <tr>
            <th>项目</th>
            <th>值</th>
          </tr>
          <tr>
            <td>当前DRM模式</td>
            <td>{{ drmInfo.currentDRMMode }}</td>
          </tr>
          <tr>
            <td>频谱带宽</td>
            <td>{{ drmInfo.spectrumBandwidth }}</td>
          </tr>
          <tr>
            <td>MSC模式</td>
            <td>{{ drmInfo.mscMode }}</td>
          </tr>
          <tr>
            <td>SDC模式</td>
            <td>{{ drmInfo.sdcMode }}</td>
          </tr>
          <tr>
            <td>MSC保护级别A</td>
            <td>{{ drmInfo.mscProtectionLevelA }}</td>
          </tr>
          <tr>
            <td>MSC保护级别B</td>
            <td>{{ drmInfo.mscProtectionLevelB }}</td>
          </tr>
        </table>

        <!-- RF输出设置 -->
        <h3>RF输出设置</h3>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>RF输出功率 (dBm)</td>
            <td>
              <input type="text" v-model="rfSettings.outputPower">
            </td>
          </tr>
          <tr>
            <td>RF频率 (MHz)</td>
            <td>
              <input type="text" v-model="rfSettings.outputFreq">
            </td>
          </tr>
          <tr>
            <td>RF输出使能</td>
            <td>
              <input type="checkbox" v-model="rfSettings.outputEnable">
            </td>
          </tr>
          <tr>
            <td>PM调制使能</td>
            <td>
              <input type="checkbox" v-model="rfSettings.pmEnable">
            </td>
          </tr>
          <tr>
            <td>AM调制使能</td>
            <td>
              <input type="checkbox" v-model="rfSettings.amEnable">
            </td>
          </tr>
        </table>

        <!-- 按钮区域 -->
        <div class="buttons-area">
          <button @click="refreshStatus">刷新状态</button>
          <button @click="applyRFSettings">应用RF设置</button>
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

      // DRM通道信息
      drmInfo: {
        currentDRMMode: '未知',
        spectrumBandwidth: '未知',
        mscMode: '未知',
        sdcMode: '未知',
        mscProtectionLevelA: '未知',
        mscProtectionLevelB: '未知'
      },

      // RF输出设置
      rfSettings: {
        outputPower: '-8.4',
        outputFreq: '14.000',
        outputEnable: true,
        pmEnable: true,
        amEnable: false
      },

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
      // 这里需要根据你的实际返回数据格式进行解析
      if (data) {
        // 更新DRM通道信息
        if (data['drmChannelInfo.currentDRMMode'] !== undefined) {
          this.drmInfo.currentDRMMode = data['drmChannelInfo.currentDRMMode'];
        }
        if (data['drmChannelInfo.spectrumBandwidth'] !== undefined) {
          this.drmInfo.spectrumBandwidth = data['drmChannelInfo.spectrumBandwidth'];
        }
        if (data['drmChannelInfo.mscMode'] !== undefined) {
          this.drmInfo.mscMode = data['drmChannelInfo.mscMode'];
        }
        if (data['drmChannelInfo.sdcMode'] !== undefined) {
          this.drmInfo.sdcMode = data['drmChannelInfo.sdcMode'];
        }
        if (data['drmChannelInfo.mscProtectionLevelA'] !== undefined) {
          this.drmInfo.mscProtectionLevelA = data['drmChannelInfo.mscProtectionLevelA'];
        }
        if (data['drmChannelInfo.mscProtectionLevelB'] !== undefined) {
          this.drmInfo.mscProtectionLevelB = data['drmChannelInfo.mscProtectionLevelB'];
        }

        // 更新其他系统状态
        // 这里需要根据实际返回数据添加相应的处理代码
      }
    },

    // 刷新状态
    refreshStatus() {
      // 获取DRM通道信息
      WebSocketService.sendGetCommand([
        'drmChannelInfo.currentDRMMode',
        'drmChannelInfo.spectrumBandwidth',
        'drmChannelInfo.mscMode',
        'drmChannelInfo.sdcMode',
        'drmChannelInfo.mscProtectionLevelA',
        'drmChannelInfo.mscProtectionLevelB'
      ]);

      // 你可以在这里添加更多的get命令来获取其他状态信息
      this.showSuccess();
    },

    // 应用RF设置
    applyRFSettings() {
      // 创建要设置的键值对
      const settings = {
        'exciter.rfOutputPower': this.rfSettings.outputPower,
        'exciter.rfOutputFreq': this.rfSettings.outputFreq,
        'exciter.rfOutputEnable': this.rfSettings.outputEnable,
        'exciter.rfPMEnable': this.rfSettings.pmEnable,
        'exciter.rfAMEnable': this.rfSettings.amEnable
      };

      // 发送set命令
      WebSocketService.sendSetCommand(settings);
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

input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

h3 {
  margin-top: 30px;
  margin-bottom: 10px;
  color: #003366;
}
</style>
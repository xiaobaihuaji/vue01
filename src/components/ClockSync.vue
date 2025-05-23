<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>时钟同步</h2>

        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 参数设置表格 -->
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <!-- 时钟源：下拉选择 -->
          <tr>
            <td>时钟源</td>
            <td>
              <select v-model="clockSource">
                <option value="INT_10MHz">INT_10MHz: 内部10MHz</option>
                <option value="EXT_10MHz">EXT_10MHz: 外部10MHz</option>
                <option value="GNSS">GNSS</option>
              </select>
            </td>
          </tr>
          <!-- SFN偏移 -->
          <tr>
            <td>SFN偏移</td>
            <td>
              <input 
                type="number" 
                v-model="sfnOffset" 
                min="-999" max="999"
                placeholder="请输入SFN偏移"
                :class="{ 'error': sfnOffset < -999 || sfnOffset > 999 }"
              />
              <span>微秒   范围：-999 ~ 999</span>
              <div v-if="sfnOffset < -999 || sfnOffset > 999" class="error-msg">
                范围：-999 到 +999
              </div>
            </td>
          </tr>
          <!-- 输出频率校正（仅 debugEnable 为 true 时显示） -->
          <tr v-if="debugEnable">
            <td>输出频率校正</td>
            <td>
              <input 
                type="number" 
                v-model="freqCorrection" 
                min="-1000" max="1000"
                placeholder="请输入频率校正值"
                :class="{ 'error': freqCorrection < -1000 || freqCorrection > 1000 }"
              />
              <span>PPB   范围：-1000 ~ 1000</span>
              <div v-if="freqCorrection < -1000 || freqCorrection > 1000" class="error-msg">
                范围：-1000 到 +1000
              </div>
            </td>
          </tr>
          <!-- VTCXO电压字（仅 debugEnable 为 true 时显示） -->
          <tr v-if="debugEnable">
            <td>VTCXO电压字</td>
            <td>
              <input 
                type="number" 
                v-model="vtcxoWord" 
                min="0" max="65535"
                placeholder="请输入VTCXO电压字"
                :class="{ 'error': vtcxoWord < 0 || vtcxoWord > 65535 }"
              />
              <span>范围: 0 ~ 65535</span>
              <div v-if="vtcxoWord < 0 || vtcxoWord > 65535" class="error-msg">
                范围：0 到 65535
              </div>
            </td>
          </tr>
          <!-- GNSS锁定状态（只读） -->
          <tr>
            <td>GNSS锁定状态</td>
            <td>{{ gnssLock }}</td>
          </tr>
          <!-- GNSS时间（只读） -->
          <tr>
            <td>GNSS时间</td>
            <td>{{ gnssTime }}</td>
          </tr>
          <!-- 经度（只读） -->
          <tr>
            <td>经度</td>
            <td>{{ longitude }}</td>
          </tr>
          <!-- 纬度（只读） -->
          <tr>
            <td>纬度</td>
            <td>{{ latitude }}</td>
          </tr>
        </table>

        <!-- 应用按钮与刷新按钮 -->
        <div class="button-container">
          <button @click="applyClockSync">应用</button>
          <button @click="refreshClockSync">刷新</button>
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
  name: 'ClockSync',
  data() {
    return {
      // 时钟同步各项
      clockSource: 'INT_10MHz',
      sfnOffset: 0,
      freqCorrection: 0,
      vtcxoWord: 0,
      gnssLock: '',
      gnssTime: '',
      longitude: '',
      latitude: '',

      // debugEnable：控制频率校正与VTCXO电压字显示
      debugEnable: false,

      // 弹窗控制
      isApplyModalVisible: false,
      isRefreshModalVisible: false,

      // WebSocket状态 & 错误信息
      wsConnected: false,
      errorInfo: { visible: false, message: '', details: '' },

      // 记录上次操作，用于重试
      lastOperation: { type: '', data: null }
    };
  },
  methods: {
    // 初始化 WebSocket
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(this.checkConnectionStatus, 2000);
    },

    // 处理服务器消息
    handleWebSocketMessage(data) {
      if (data && data.error) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }
      if (typeof data === 'string') {
        try { data = JSON.parse(data); }
        catch (e) {
          this.showError('无法解析服务器响应', data);
          return;
        }
      }
      if (data.params && Array.isArray(data.params)) {
        data.params.forEach(p => {
          if (p.result === 'success') this.updateParameterValue(p.key, p.value);
          else this.showError(`参数 ${p.key} 获取失败`, p.error);
        });
      } else {
        Object.keys(data).forEach(key => this.updateParameterValue(key, data[key]));
      }
    },

    // 更新各个参数
    updateParameterValue(key, value) {
      // strip prefix if present
      if (key.startsWith('timeSyncSettings.')) {
        key = key.slice('timeSyncSettings.'.length);
      }
      switch (key) {
        case 'clockSource':
          this.clockSource = value || 'INT_10MHz';
          break;
        case 'sfnOffset':
          this.sfnOffset = parseInt(value);
          break;
        case 'freqCorrection':
          this.freqCorrection = parseInt(value);
          break;
        case 'vtcxoWord':
          this.vtcxoWord = parseInt(value);
          break;
        case 'gnssLockStatus':
          this.gnssLock = value;
          break;
        case 'gnssTime':
          this.gnssTime = value;
          break;
        case 'longitude':
          this.longitude = value;
          break;
        case 'latitude':
          this.latitude = value;
          break;
        case 'system.debugEnable':
          // 接收 debugEnable 字符串 "true"/"false"
          this.debugEnable = (value === 'true');
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
    },

    // 应用设置
    applyClockSync() {
      if (this.sfnOffset < -999 || this.sfnOffset > 999) {
        this.showError('SFN偏移超出范围', '范围 -999 ~ 999'); return;
      }
      if (this.debugEnable) {
        if (this.freqCorrection < -1000 || this.freqCorrection > 1000) {
          this.showError('频率校正超出范围', '范围 -1000 ~ 1000'); return;
        }
        if (this.vtcxoWord < 0 || this.vtcxoWord > 65535) {
          this.showError('VTCXO电压字超出范围', '范围 0 ~ 65535'); return;
        }
      }

      const data = {
        'timeSyncSettings.clockSource': this.clockSource,
        'timeSyncSettings.sfnOffset': String(this.sfnOffset),
        // 仅在 debugEnable 时发送这两项
        ...(this.debugEnable && {
          'timeSyncSettings.freqCorrection': String(this.freqCorrection),
          'timeSyncSettings.vtcxoWord': String(this.vtcxoWord)
        })
      };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.isApplyModalVisible = true;
      setTimeout(this.hideApplyModal, 1000);
    },
    hideApplyModal() {
      this.isApplyModalVisible = false;
    },

    // 刷新数据
    refreshClockSync() {
      const keys = [
        'timeSyncSettings.clockSource',
        'timeSyncSettings.sfnOffset',
        // 仅在 debugEnable 时请求这两项
        ...(this.debugEnable
          ? ['timeSyncSettings.freqCorrection', 'timeSyncSettings.vtcxoWord']
          : []
        ),
        'timeSyncSettings.gnssLockStatus',
        'timeSyncSettings.gnssTime',
        'timeSyncSettings.longitude',
        'timeSyncSettings.latitude',
        'system.debugEnable'
      ];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
      this.isRefreshModalVisible = true;
      setTimeout(this.hideRefreshModal, 1000);
    },
    hideRefreshModal() {
      this.isRefreshModalVisible = false;
    },

    // 错误处理
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
    // 首次获取所有参数，包括 debugEnable
    setTimeout(() => {
      const keys = [
        'timeSyncSettings.clockSource',
        'timeSyncSettings.sfnOffset',
        'timeSyncSettings.gnssLockStatus',
        'timeSyncSettings.gnssTime',
        'timeSyncSettings.longitude',
        'timeSyncSettings.latitude',
        'system.debugEnable'
      ];
      // 如果 debugEnable 为 true，还会在刷新时包含 freqCorrection 与 vtcxoWord
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
    }, 500);
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
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.content-container {
  max-width: 800px;
  margin: 0 auto;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
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
.error {
  border: 2px solid red;
}
.error-msg {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}
.button-container {
  margin-bottom: 20px;
}
button {
  background-color: #003366;
  color: #fff;
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
  color: #fff;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  z-index: 1000;
}
.modal button {
  margin-top: 10px;
  background-color: #fff;
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
  margin-top: 10px;
  padding: 8px;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
</style>

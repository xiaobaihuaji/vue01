<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>状态概览</h2>

        <!-- WebSocket连接状态 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 系统状态表 -->
        <table>
          <tr><th>项目</th><th>值/设置</th></tr>
          <tr><td>工作状态</td><td>{{ systemStatus }}</td></tr>
          <tr><td>主板温度</td><td>{{ motherboardTemperature }}℃</td></tr>
          <tr><td>软件版本</td><td>{{ softwareVersion }}</td></tr>
          <tr><td>序列号</td><td>{{ serialNumber }}</td></tr>
          <tr><td>产品型号</td><td>{{ productModel }}</td></tr>
          <tr>
            <td>固件升级</td>
            <td><button @click="startFirmwareUpgrade">固件升级</button></td>
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

        <!-- 隐藏的文件选择输入 -->
        <input
          ref="firmwareInput"
          type="file"
          style="display:none"
          @change="handleFirmwareSelected"
        />

        <!-- 刷新状态按钮 -->
        <div class="buttons-area">
          <button @click="refreshStatus">刷新状态</button>
        </div>

        <!-- 通用操作成功弹窗 -->
        <div v-if="isModalVisible" class="modal">
          <p>操作成功！</p>
          <button @click="hideModal">关闭</button>
        </div>

        <!-- 固件升级中弹窗 -->
        <div v-if="isUpgrading" class="modal">
          <p>固件升级中，请勿关闭页面……</p>
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
      // WebSocket 状态
      wsConnected: false,

      // 系统状态
      systemStatus: '未知',
      motherboardTemperature: 0,
      softwareVersion: '未知',
      serialNumber: '未知',
      productModel: '未知',
      systemDate: '',
      systemTime: '',

      // 升级状态
      isUpgrading: false,
      upgradeSuccess: false,

      // 通用弹窗 & 错误
      isModalVisible: false,
      errorInfo: { visible: false, message: '', details: '' },

      lastOperation: { type: '', data: null }
    };
  },
  methods: {
    // 初始化主 WebSocket
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(this.checkConnectionStatus, 2000);
    },

    // 处理主连接消息
    handleWebSocketMessage(data) {
      if (data && data.error) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }
      if (typeof data === 'string') {
        try { data = JSON.parse(data); }
        catch (e) { this.showError('无法解析响应数据', data); return; }
      }
      if (data.params) {
        data.params.forEach(p => {
          if (p.result === 'success') this.updateParameterValue(p.key, p.value);
          else this.showError(`参数 ${p.key} 获取失败`, p.error);
        });
      } else {
        Object.keys(data).forEach(k => this.updateParameterValue(k, data[k]));
      }
    },
    updateParameterValue(key, value) {
      switch (key) {
        case 'system.systemStatus': this.systemStatus = value; break;
        case 'system.motherboardTemperature': this.motherboardTemperature = value; break;
        case 'system.softwareVersion': this.softwareVersion = value; break;
        case 'system.serialNumber': this.serialNumber = value; break;
        case 'system.productModel': this.productModel = value; break;
      }
    },

    // 刷新系统状态
    refreshStatus() {
      const keys = [
        'system.systemStatus',
        'system.motherboardTemperature',
        'system.softwareVersion',
        'system.serialNumber',
        'system.productModel'
      ];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
      this.showSuccess();
    },

    showSuccess() {
      this.isModalVisible = true;
      setTimeout(this.hideModal, 2000);
    },
    hideModal() { this.isModalVisible = false; },

    showError(msg, det='') {
      this.errorInfo = { visible: true, message: msg, details: det };
    },
    hideErrorModal() { this.errorInfo.visible = false; },

    retryLastOperation() {
      if (this.lastOperation.type === 'get') {
        WebSocketService.sendGetCommand(this.lastOperation.data);
      } else if (this.lastOperation.type === 'set') {
        WebSocketService.sendSetCommand(this.lastOperation.data);
      }
      this.hideErrorModal();
    },

    // —— 固件升级逻辑 —— 
    startFirmwareUpgrade() {
      this.$refs.firmwareInput.value = null;
      this.$refs.firmwareInput.click();
    },
    async handleFirmwareSelected(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.isUpgrading = true;
      try {
        // 1. 计算 SHA-256 哈希
        const arrayBuf = await file.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', arrayBuf);
        const hashHex = Array.from(new Uint8Array(digest))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // 2. 连接升级专用 WebSocket (8881)
        const ws = new WebSocket(`ws://${location.hostname}:8881`);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          // 3. 发送 HASH
          ws.send('HASH:' + hashHex);
          // 4. 分块发送文件
          const CHUNK = 4096;
          let offset = 0;
          const sendChunk = () => {
            if (offset < file.size) {
              const slice = file.slice(offset, offset + CHUNK);
              slice.arrayBuffer().then(buf => {
                ws.send(buf);
                offset += CHUNK;
                sendChunk();
              });
            } else {
              // 5. 发送结束标志
              ws.send('END_OF_FILE');
            }
          };
          sendChunk();
        };

        ws.onerror = err => {
          console.error('升级 WS 错误', err);
          this.showError('传输失败', err.message);
          this.isUpgrading = false;
        };

        ws.onclose = () => {
          this.isUpgrading = false;
          this.upgradeSuccess = true;
          setTimeout(() => this.upgradeSuccess = false, 2000);
        };
      } catch (err) {
        this.showError('传输出错', err.message);
        this.isUpgrading = false;
      }
    },

    // —— 系统日期/时间设置 —— 
    applySystemDate() {
      this.systemDate = new Date().toISOString().slice(0,10);
      const data = { 'system.systemDate': this.systemDate };
      this.lastOperation = { type:'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess();
    },
    applySystemTime() {
      this.systemTime = new Date().toTimeString().slice(0,8);
      const data = { 'system.systemTime': this.systemTime };
      this.lastOperation = { type:'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess();
    }
  },
  mounted() {
    this.initWebSocket();
    setTimeout(() => {
      this.applySystemDate();
      this.applySystemTime();
      this.refreshStatus();
    }, 1000);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
  }
};
</script>

<style scoped>
.content-wrapper { flex:1; padding:20px; background:#f4f4f4; display:flex; justify-content:center }
.content { width:100%; max-width:1000px; background:#fff; padding:20px; border-radius:5px; box-shadow:0 0 10px rgba(0,0,0,0.1) }
.content-container { max-width:800px; margin:0 auto }
.connection-status { margin-bottom:15px; padding:8px; background:#fcc; border-radius:4px; text-align:center }
.connection-status.connected { background:#cfc }
table { width:100%; border-collapse:collapse; margin-bottom:20px }
table,th,td { border:1px solid #ddd }
th,td { padding:10px; text-align:left }
.system-time-date { display:flex; align-items:center; gap:10px }
input[type="text"] { padding:5px; border:1px solid #ddd; border-radius:3px; width:150px }
.buttons-area { display:flex; justify-content:center; margin:20px 0 }
button { background:#003366; color:#fff; border:none; padding:10px 20px; border-radius:3px; cursor:pointer; margin-right:10px }
button:hover { background:#004488 }
.modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#003366; color:#fff; padding:20px; border-radius:5px; text-align:center; z-index:1000 }
.modal button { margin-top:10px; background:#fff; color:#003366 }
.modal button:hover { background:#eee }
.error-modal { background:#c33; min-width:300px }
.error-details { font-size:.9em; margin-top:10px; padding:8px; background:rgba(0,0,0,.1); border-radius:3px }
.modal-buttons { display:flex; justify-content:center; gap:10px; margin-top:15px }
</style>
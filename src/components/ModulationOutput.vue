<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- ==================== 调制输出 ==================== -->
        <h2>调制输出</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>DRM模式</td>
            <td>
              <select v-model="currentDRMMode" class="custom-select">
                <option v-for="mode in drmModes" :key="mode" :value="mode">
                  {{ mode }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>频谱带宽</td>
            <td>
              <select v-model="spectrumBandwidth" class="custom-select">
                <option v-for="bandwidth in bandwidths" :key="bandwidth" :value="bandwidth">
                  {{ bandwidth }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC模式</td>
            <td>
              <select v-model="mscMode" class="custom-select">
                <option v-for="mode in mscModes" :key="mode" :value="mode">
                  {{ mode }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>SDC模式</td>
            <td>
              <select v-model="sdcMode" class="custom-select">
                <option v-for="mode in sdcModes" :key="mode" :value="mode">
                  {{ mode }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC保护等级A</td>
            <td>
              <select v-model="mscProtectionLevelA" class="custom-select">
                <option v-for="level in protectionLevels" :key="level" :value="level">
                  {{ level }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC保护等级B</td>
            <td>
              <select v-model="mscProtectionLevelB" class="custom-select">
                <option v-for="level in protectionLevels" :key="level" :value="level">
                  {{ level }}
                </option>
              </select>
            </td>
          </tr>
        </table>
        <button @click="applyModulationSettings">应用调制输出设置</button>

        <!-- ==================== DPD 校正表格 ==================== -->
        <h3>数字预失真校正（DPD）</h3>
        <table>
          <tr>
            <td>输入频率与输出频率一致</td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="isFrequencyConsistent" @change="toggleFrequency">
                <span class="slider"></span>
              </label>
            </td>
          </tr>
          <tr v-if="!isFrequencyConsistent">
            <td>输入频率</td>
            <td class="input-with-unit">
              <input 
                v-model="inputFrequency" 
                type="number" 
                min="0" 
                step="0.001" 
                placeholder="输入频率"
              />
              <span class="unit">MHz</span>
            </td>
          </tr>
          <tr>
            <td>DPD参数估计</td>
            <td>
              <button @click="estimateDPD" class="blue-btn">DPD参数估计</button>
            </td>
          </tr>
          <tr>
            <td>估计结果</td>
            <td class="input-with-unit">
              <input type="text" v-model="dpdResult" readonly />
              <span class="unit">MHz</span>
            </td>
          </tr>
          <tr>
            <td>DPD参数复位</td>
            <td>
              <button @click="resetDPD" class="orange-btn">DPD参数复位</button>
            </td>
          </tr>
        </table>

        <!-- ==================== 幅相延时 ==================== -->
        <h3>幅相延时</h3>
        <table>
          <tr>
            <td>延时参数估计</td>
            <td>
              <button class="blue-btn" @click="estimateDelay">延时参数估计</button>
              <button class="green-btn">延时参数设置</button>
              <button class="orange-btn" @click="tryResetDelay">延时参数复位</button>
            </td>
          </tr>
          <tr>
            <td>延时量</td>
            <td class="input-with-unit">
              <input type="text" v-model="delayValue" readonly />
              <span class="unit">us</span>
            </td>
          </tr>
        </table>

        <!-- 处理中弹窗（增加取消按钮） -->
        <div v-if="processingModal.show" class="modal">
          <p>{{ processingModal.message }}</p>
          <button @click="cancelProcessing" class="cancel-btn">取消</button>
        </div>

        <!-- 确认弹窗（复位确认） -->
        <div v-if="confirmModal.show" class="modal">
          <p>{{ confirmModal.message }}</p>
          <button @click="confirmModalConfirm" class="blue-btn">确认</button>
          <button @click="confirmModalCancel">取消</button>
        </div>

        <!-- 应用/操作成功弹窗 -->
        <div v-if="isModalVisible" class="modal">
          <p>操作成功！</p>
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
  name: 'ModulationOutput',
  data() {
    return {
      // 调制输出相关数据
      currentDRMMode: 'A',
      drmModes: ['A', 'B', 'C', 'D'],

      spectrumBandwidth: '4.5kHz',
      bandwidths: ['4.5kHz', '5kHz', '9kHz', '10kHz', '18kHz', '20kHz'],

      sdcMode: '4QAM',
      sdcModes: ['4QAM', '16QAM'],

      mscMode: '16QAM',
      mscModes: ['16QAM', '64QAM'],

      mscProtectionLevelA: '0',
      mscProtectionLevelB: '0',
      protectionLevels: ['0', '1', '2', '3'],

      // DPD相关数据
      isFrequencyConsistent: false,
      inputFrequency: 0,
      dpdResult: '',

      // 延时相关数据
      delayValue: '0.0',

      // 其他操作控制
      isModalVisible: false,
      processingModal: {
        show: false,
        message: ''
      },
      confirmModal: {
        show: false,
        message: '',
        onConfirm: null
      },

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
            this.updateModulationParameter(param.key, param.value);
          } else {
            console.error(`参数 ${param.key} 获取失败: ${param.error || '未知错误'}`);
            this.showError(`参数 ${param.key} 获取失败`, param.error || '未知错误');
          }
        });
      } else if (data) {
        Object.keys(data).forEach(key => {
          this.updateModulationParameter(key, data[key]);
        });
      }
    },
    // ----------------------- 参数更新 -----------------------
    updateModulationParameter(key, value) {
      // 调制输出参数
      switch(key) {
        case 'modulation.currentDRMMode':
          this.currentDRMMode = value;
          break;
        case 'modulation.spectrumBandwidth':
          this.spectrumBandwidth = value;
          break;
        case 'modulation.sdcMode':
          this.sdcMode = value;
          break;
        case 'modulation.mscMode':
          this.mscMode = value;
          break;
        case 'modulation.mscProtectionLevelA':
          this.mscProtectionLevelA = value;
          break;
        case 'modulation.mscProtectionLevelB':
          this.mscProtectionLevelB = value;
          break;
        // DPD及延时相关参数（根据实际后端返回的key进行匹配）
        case 'exciter.dpdInputFreq':
          this.dpdResult = value;
          this.hideProcessingModal();
          this.showSuccess();
          break;
        case 'exciter.dpdFreqSametoRf':
          // 复位DPD时可能返回该参数
          this.hideProcessingModal();
          this.showSuccess();
          break;
        case 'exciter.delayValue':
          this.delayValue = value;
          this.hideProcessingModal();
          this.showSuccess();
          break;
        case 'exciter.delayReset':
          // 复位延时可能返回该参数或同时更新延时量
          this.hideProcessingModal();
          this.showSuccess();
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
    },
    // ----------------------- 调制输出设置 -----------------------
    applyModulationSettings() {
      const data = {
        'modulation.currentDRMMode': this.currentDRMMode,
        'modulation.spectrumBandwidth': this.spectrumBandwidth,
        'modulation.sdcMode': this.sdcMode,
        'modulation.mscMode': this.mscMode,
        'modulation.mscProtectionLevelA': this.mscProtectionLevelA,
        'modulation.mscProtectionLevelB': this.mscProtectionLevelB
      };
      this.lastOperation = {
        type: 'set',
        data: data
      };
      WebSocketService.sendSetCommand(data);
      this.showSuccess();
    },
    // ----------------------- DPD 操作 -----------------------
    estimateDPD() {
      this.showProcessingModal('DPD参数估计中...');
      // 保存操作以便重试
      this.lastOperation = {
        type: 'get',
        data: ['exciter.dpdInputFreq']
      };
      WebSocketService.sendGetCommand(['exciter.dpdInputFreq']);
    },
    resetDPD() {
      this.showProcessingModal('DPD参数复位中...');
      this.lastOperation = {
        type: 'set',
        data: { 'exciter.dpdFreqSametoRf': false }
      };
      WebSocketService.sendSetCommand({ 'exciter.dpdFreqSametoRf': false });
    },
    // ----------------------- 延时操作 -----------------------
    estimateDelay() {
      this.showProcessingModal('延时参数估计中...');
      this.lastOperation = {
        type: 'get',
        data: ['exciter.delayValue']
      };
      WebSocketService.sendGetCommand(['exciter.delayValue']);
    },
    resetDelay() {
      this.showProcessingModal('延时参数复位中...');
      this.lastOperation = {
        type: 'set',
        data: { 'exciter.delayReset': true }
      };
      WebSocketService.sendSetCommand({ 'exciter.delayReset': true });
    },
    tryResetDelay() {
      this.confirmModal = {
        show: true,
        message: '确定要复位延时参数吗？',
        onConfirm: this.resetDelay
      };
    },
    confirmModalConfirm() {
      if (this.confirmModal.onConfirm) {
        this.confirmModal.onConfirm();
      }
      this.confirmModal.show = false;
    },
    confirmModalCancel() {
      this.confirmModal.show = false;
    },
    // ----------------------- 开窗与错误提示 -----------------------
    showSuccess() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.hideModal();
      }, 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },
    showProcessingModal(message) {
      this.processingModal = {
        show: true,
        message: message
      };
    },
    hideProcessingModal() {
      this.processingModal.show = false;
    },
    // 新增：取消当前处理过程
    cancelProcessing() {
      // 隐藏处理弹窗并清空上次操作
      this.hideProcessingModal();
      this.lastOperation = { type: '', data: null };
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
    // 延时刷新调制输出状态，确保连接已建立
    setTimeout(() => {
      const keys = [
        'modulation.currentDRMMode',
        'modulation.spectrumBandwidth',
        'modulation.sdcMode',
        'modulation.mscMode',
        'modulation.mscProtectionLevelA',
        'modulation.mscProtectionLevelB'
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

.cancel-btn {
  background-color: #ff6666;
  margin-left: 10px;
}

.cancel-btn:hover {
  background-color: #ff4d4d;
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
</style>

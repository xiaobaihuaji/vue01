<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">

        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- ============== 调制输出页面标题 ============== -->
        <h2>调制输出</h2>

        <!-- ============== 射频输出区域 ============== -->
        <section v-if="showRFSection">
          <h3>射频输出</h3>
          <table>
            <tr>
              <th>项目</th>
              <th>值/设置</th>
            </tr>
            <tr v-if="!isPSM">
              <td>输出使能</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="rfOutputEnabled">
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
                    v-model.number="rfOutputFreq"
                    step="0.001"
                    placeholder="请输入中心频率"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  >
                  <span class="unit">MHz</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>输出功率</td>
              <td class="input-with-unit">
                <div class="input-with-buttons">
                  <input
                    type="number"
                    v-model.number="rfOutputPower"
                    step="0.1"
                    placeholder="请输入输出功率"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  >
                  <span class="unit">dB</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>调相使能</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="rfPMEnable">
                  <span class="slider"></span>
                </label>
              </td>
            </tr>
            <tr v-if="!isPSM">
              <td>调幅使能</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="rfAMEnable">
                  <span class="slider"></span>
                </label>
              </td>
            </tr>
          </table>
          <button @click="applyRFOutput">应用射频输出设置</button>
        </section>

        <!-- ============== 包络输出区域 ============== -->
        <section v-if="showEnvelopeSection">
          <h3>包络输出</h3>
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
                    v-model.number="rfEnvelopeLevel"
                    step="0.1"
                    placeholder="请输入电平增益"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  >
                  <span class="unit">dB</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>直流补偿</td>
              <td class="input-with-unit">
                <div class="input-with-buttons">
                  <input
                    type="number"
                    v-model.number="rfEnvelopeDC"
                    step="0.1"
                    placeholder="请输入直流补偿"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  >
                  <span class="unit">%</span>
                </div>
              </td>
            </tr>
          </table>
          <button @click="applyEnvelope">应用包络输出设置</button>
        </section>

        <!-- ============== 峰均比抑制区域 ============== -->
        <section v-if="showPAPRSection">
          <h3>峰均比抑制（CFR）</h3>
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
                    @blur="handlePAPRBlur"
                  >
                  <span class="unit">dB</span>
                </div>
              </td>
            </tr>
          </table>
          <button @click="applyPAPR">应用峰均比抑制设置</button>
        </section>

        <!-- ============== 调制输出参数 ============== -->
        <h3>调制输出参数</h3>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>DRM模式</td>
            <td>
              <select v-model="currentDRMMode" class="custom-select no-arrow" disabled>
                <option v-for="mode in drmModes" :key="mode" :value="mode">{{ mode }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>频谱带宽</td>
            <td>
              <select v-model="spectrumBandwidth" class="custom-select no-arrow" disabled>
                <option v-for="bw in bandwidths" :key="bw" :value="bw">{{ bw }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>SDC模式</td>
            <td>
              <select v-model="sdcMode" class="custom-select no-arrow" disabled>
                <option v-for="m in sdcModes" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC模式</td>
            <td>
              <select v-model="mscMode" class="custom-select no-arrow" disabled>
                <option v-for="m in mscModes" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC保护等级A</td>
            <td>
              <select v-model="mscProtectionLevelA" class="custom-select no-arrow" disabled>
                <option v-for="lvl in protectionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC保护等级B</td>
            <td>
              <select v-model="mscProtectionLevelB" class="custom-select no-arrow" disabled>
                <option v-for="lvl in protectionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </td>
          </tr>
        </table>
        <button disabled class="disabled">应用调制输出设置</button>

        <!-- ============== DPD及延时操作区域 ============== -->
        <section v-if="showDPDSection">
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
                <input type="number" v-model.number="inputFrequency" min="0" step="0.001" placeholder="输入频率">
                <span class="unit">MHz</span>
              </td>
            </tr>
            <tr>
              <td>DPD参数估计</td>
              <td><button @click="estimateDPD" class="blue-btn">DPD参数估计</button></td>
            </tr>
            <tr>
              <td>估计结果</td>
              <td class="input-with-unit">
                <input type="text" v-model="dpdResult" readonly>
                <span class="unit">MHz</span>
              </td>
            </tr>
            <tr>
              <td>DPD参数复位</td>
              <td><button @click="resetDPD" class="orange-btn">DPD参数复位</button></td>
            </tr>
          </table>
        </section>

        <section v-if="showDelaySection">
          <h3>幅相延时</h3>
          <table>
            <tr>
              <td>延时参数估计</td>
              <td>
                <button class="blue-btn" @click="estimateDelay">延时参数估计</button>
                <button class="green-btn" @click="applyDelay">延时参数设置</button>
                <button class="orange-btn" @click="tryResetDelay">延时参数复位</button>
              </td>
            </tr>
            <tr>
              <td>延时量</td>
              <td class="input-with-unit">
                <input type="text" v-model="delayValue" readonly>
                <span class="unit">us</span>
              </td>
            </tr>
          </table>
        </section>

        <!-- 处理中弹窗与确认弹窗 -->
        <div v-if="processingModal.show" class="modal">
          <p>{{ processingModal.message }}</p>
          <button @click="cancelProcessing" class="cancel-btn">取消</button>
        </div>
        <div v-if="confirmModal.show" class="modal">
          <p>{{ confirmModal.message }}</p>
          <button @click="confirmModalConfirm" class="blue-btn">确认</button>
          <button @click="confirmModalCancel">取消</button>
        </div>

        <!-- 应用/操作成功弹窗 -->
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
  name: "ModulationOutput",
  data() {
    return {
      exciterType: "",
      rfOutputEnabled: false,
      rfOutputFreq: 15.120,
      rfOutputPower: -8.4,
      rfPMEnable: false,
      rfAMEnable: false,
      rfEnvelopeLevel: -6.0,
      rfEnvelopeDC: 0.0,
      peakToAverageSuppressLevel: "7.0",
      currentDRMMode: "A",
      drmModes: ["A", "B", "C", "D"],
      spectrumBandwidth: "4.5kHz",
      bandwidths: ["4.5kHz", "5kHz", "9kHz", "10kHz", "18kHz", "20kHz"],
      sdcMode: "4QAM",
      sdcModes: ["4QAM", "16QAM"],
      mscMode: "16QAM",
      mscModes: ["16QAM", "64QAM"],
      mscProtectionLevelA: "0",
      mscProtectionLevelB: "0",
      protectionLevels: ["0", "1", "2", "3"],
      isFrequencyConsistent: false,
      inputFrequency: 0,
      dpdResult: "",
      delayValue: "0.0",
      wsConnected: false,
      processingModal: { show: false, message: "" },
      confirmModal: { show: false, message: "", onConfirm: null },
      isModalVisible: false,
      modalMessage: "",
      errorInfo: { visible: false, message: "", details: "" },
      lastOperation: { type: "", data: null },
      showUpDownButtons: false
    };
  },
  computed: {
    isNONE()  { return this.exciterType === "NONE"; },
    isDDS()   { return this.exciterType === "DDS"; },
    isDX100() { return this.exciterType === "DX100"; },
    isDX200() { return this.exciterType === "DX200"; },
    isPSM()   { return this.exciterType === "PSM"; },
    isDEBUG(){ return this.exciterType === "DEBUG"; },
    showRFSection()       { return this.isDDS || this.isPSM || this.isDEBUG; },
    showEnvelopeSection() { return this.isDDS || this.isPSM || this.isDEBUG; },
    showPAPRSection()     { return this.isNONE || this.isDX200 || this.isDDS || this.isDEBUG; },
    showDPDSection()      { return this.isDX200 || this.isPSM || this.isDDS || this.isDEBUG; },
    showDelaySection()    { return this.isPSM || this.isDDS || this.isDEBUG; }
  },
  methods: {
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => this.checkConnectionStatus(), 2000);
    },
    handleWebSocketMessage(data) {
      if (data && data.error === true) {
        this.showError(data.message || "通信错误", data.details);
        return;
      }
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          this.showError("无法解析服务器响应", data);
          return;
        }
      }
      if (data && data.params && Array.isArray(data.params)) {
        data.params.forEach(param => {
          if (param.result === "success") {
            this.updateParameterValue(param.key, param.value);
          } else {
            this.showError(`参数 ${param.key} 获取失败`, param.error || "未知错误");
          }
        });
      } else if (data) {
        Object.keys(data).forEach(key => {
          this.updateParameterValue(key, data[key]);
        });
      }
    },
    updateParameterValue(key, value) {
      if (key === "exciter.exciterType") {
        this.exciterType = value;
        return;
      }
      if (key.startsWith("exciter.")) {
        let sub = key.slice(8);
        if (sub === "rfOutputEnable") this.rfOutputEnabled = value;
        else if (sub === "rfOutputFreq") this.rfOutputFreq = parseFloat(value);
        else if (sub === "rfOutputPower") this.rfOutputPower = parseFloat(value);
        else if (sub === "rfPMEnable") this.rfPMEnable = value;
        else if (sub === "rfAMEnable") this.rfAMEnable = value;
        else if (sub === "rfEnvelopeLevel") this.rfEnvelopeLevel = parseFloat(value);
        else if (sub === "rfEnvelopeDC") this.rfEnvelopeDC = parseFloat(value);
        else if (sub === "dpdInputFreq") this.dpdResult = value;
        else if (sub === "delayValue") this.delayValue = value;
      } else if (key.startsWith("digitalIqOutput.peakToAverageSuppressLevel")) {
        this.peakToAverageSuppressLevel = parseFloat(value).toFixed(1);
      } else if (key.startsWith("modulation.")) {
        let sub = key.slice(11);
        if (sub === "currentDRMMode") this.currentDRMMode = value;
        else if (sub === "spectrumBandwidth") this.spectrumBandwidth = value;
        else if (sub === "sdcMode") this.sdcMode = value;
        else if (sub === "mscMode") this.mscMode = value;
        else if (sub === "mscProtectionLevelA") this.mscProtectionLevelA = value;
        else if (sub === "mscProtectionLevelB") this.mscProtectionLevelB = value;
      }
    },
    applyRFOutput() {
      const data = {
        "exciter.rfOutputEnable": this.rfOutputEnabled.toString(),
        "exciter.rfOutputFreq": this.rfOutputFreq.toFixed(3),
        "exciter.rfOutputPower": this.rfOutputPower.toString(),
        "exciter.rfPMEnable": this.rfPMEnable.toString(),
        "exciter.rfAMEnable": this.rfAMEnable.toString()
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("射频输出设置成功！");
    },
    applyEnvelope() {
      const data = {
        "exciter.rfEnvelopeLevel": this.rfEnvelopeLevel.toFixed(1),
        "exciter.rfEnvelopeDC": this.rfEnvelopeDC.toFixed(1)
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("包络输出设置成功！");
    },
    applyPAPR() {
      const v = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(v) || v < 6 || v > 12) {
        this.showError("峰均比范围：6.0~12.0");
        return;
      }
      const data = { "digitalIqOutput.peakToAverageSuppressLevel": v.toFixed(1) };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("峰均比抑制设置成功！");
    },
    estimateDPD() {
      this.lastOperation = { type: "get", data: ["exciter.dpdInputFreq"] };
      WebSocketService.sendGetCommand(["exciter.dpdInputFreq"]);
    },
    resetDPD() {
      const data = { "exciter.dpdFreqSametoRf": false };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
    },
    estimateDelay() {
      this.lastOperation = { type: "get", data: ["exciter.delayValue"] };
      WebSocketService.sendGetCommand(["exciter.delayValue"]);
    },
    applyDelay() {
      // 如果有设置延时接口，可在此实现
    },
    tryResetDelay() {
      this.lastOperation = { type: "set", data: { "exciter.delayReset": true } };
      WebSocketService.sendSetCommand({ "exciter.delayReset": true });
    },
    toggleFrequency() {
      // 如果需要处理频率一致逻辑，在此实现
    },
    cancelProcessing() {
      this.processingModal.show = false;
    },
    confirmModalConfirm() {
      this.confirmModal.onConfirm();
      this.confirmModal.show = false;
    },
    confirmModalCancel() {
      this.confirmModal.show = false;
    },
    showSuccess(msg) {
      this.modalMessage = msg;
      this.isModalVisible = true;
      setTimeout(() => (this.isModalVisible = false), 2000);
    },
    showError(msg, det = "") {
      this.errorInfo = { visible: true, message: msg, details: det };
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    retryLastOperation() {
      if (this.lastOperation.type === "get") {
        WebSocketService.sendGetCommand(this.lastOperation.data);
      } else {
        WebSocketService.sendSetCommand(this.lastOperation.data);
      }
      this.hideErrorModal();
    }
  },
  mounted() {
    this.initWebSocket();
    setTimeout(() => {
      const keys = [
        "exciter.exciterType",
        "exciter.rfOutputEnable",
        "exciter.rfOutputFreq",
        "exciter.rfOutputPower",
        "exciter.rfPMEnable",
        "exciter.rfAMEnable",
        "exciter.rfEnvelopeLevel",
        "exciter.rfEnvelopeDC",
        "digitalIqOutput.peakToAverageSuppressLevel",
        "modulation.currentDRMMode",
        "modulation.spectrumBandwidth",
        "modulation.sdcMode",
        "modulation.mscMode",
        "modulation.mscProtectionLevelA",
        "modulation.mscProtectionLevelB",
        "exciter.dpdInputFreq",
        "exciter.delayValue"
      ];
      this.lastOperation = { type: "get", data: keys };
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
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
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

h3 {
  margin-top: 30px;
  margin-bottom: 15px;
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
  margin-left: 8px;
}

button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
}
button.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.custom-select {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.blue-btn {
  background-color: #1890ff;
  margin-right: 5px;
  padding: 8px 12px !important;
}
.blue-btn:hover {
  background-color: #40a9ff;
}
.orange-btn {
  background-color: #f5a623;
  margin-right: 5px;
  padding: 8px 12px !important;
}
.orange-btn:hover {
  background-color: #ffbb33;
}
.green-btn {
  background-color: #90ee90;
  margin-right: 5px;
  padding: 8px 12px !important;
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
}
.error-details {
  font-size: 0.9em;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(0,0,0,0.1);
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
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 22px; width: 22px;
  left: 4px; bottom: 4px;
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
.custom-select.no-arrow {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  background-image: none;
  padding-right: 0;
}
</style>

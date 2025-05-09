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
            <!-- PSM 模式隐藏 “输出使能” -->
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
            <!-- PSM 模式隐藏 “调幅使能” -->
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
              <select v-model="currentDRMMode" class="custom-select">
                <option v-for="mode in drmModes" :key="mode" :value="mode">{{ mode }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>频谱带宽</td>
            <td>
              <select v-model="spectrumBandwidth" class="custom-select">
                <option v-for="bandwidth in bandwidths" :key="bandwidth" :value="bandwidth">{{ bandwidth }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>SDC模式</td>
            <td>
              <select v-model="sdcMode" class="custom-select">
                <option v-for="mode in sdcModes" :key="mode" :value="mode">{{ mode }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC模式</td>
            <td>
              <select v-model="mscMode" class="custom-select">
                <option v-for="mode in mscModes" :key="mode" :value="mode">{{ mode }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC保护等级A</td>
            <td>
              <select v-model="mscProtectionLevelA" class="custom-select">
                <option v-for="level in protectionLevels" :key="level" :value="level">{{ level }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>MSC保护等级B</td>
            <td>
              <select v-model="mscProtectionLevelB" class="custom-select">
                <option v-for="level in protectionLevels" :key="level" :value="level">{{ level }}</option>
              </select>
            </td>
          </tr>
        </table>
        <button @click="applyModulationSettings">应用调制输出设置</button>

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
                <button class="green-btn">延时参数设置</button>
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

        <!--
        基带数据录制部分原先代码现已合并到其他功能中，因此不在此重复。
        -->

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
      // ====== exciterType 用于模式判定 ======
      exciterType: "",

      // ====== 射频输出 ======
      rfOutputEnabled: false,
      rfOutputFreq: 15.120,
      rfOutputPower: -8.4,
      rfPMEnable: false,
      rfAMEnable: false,

      // ====== 包络输出 ======
      rfEnvelopeLevel: -6.0,
      rfEnvelopeDC: 0.0,

      // ====== 峰均比抑制 ======
      peakToAverageSuppressLevel: "7.0",

      // ====== 调制输出 ======
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

      // ====== DPD及延时 ======
      isFrequencyConsistent: false,
      inputFrequency: 0,
      dpdResult: "",
      delayValue: "0.0",

      // ====== 基带数据录制（保留状态） ======
      recordingTime: 0,
      recordedTimeRecord: 0,
      isRecordingRecord: false,
      isModalRecordVisible: false,
      recordData: "",
      recordStatus: "",
      recordFileName: "",
      recordFilePath: "",

      // ====== 全局WebSocket连接及弹窗 ======
      wsConnected: false,
      errorInfo: { visible: false, message: "", details: "" },
      processingModal: { show: false, message: "" },
      confirmModal: { show: false, message: "", onConfirm: null },
      lastOperation: { type: "", data: null },
      showUpDownButtons: false,
      isModalVisible: false,
      modalMessage: ""
    };
  },
  computed: {
    // 模式判断
    isNONE()  { return this.exciterType === "NONE"; },
    isDDS()   { return this.exciterType === "DDS"; },
    isDX100() { return this.exciterType === "DX100"; },
    isDX200() { return this.exciterType === "DX200"; },
    isPSM()   { return this.exciterType === "PSM"; },
    isDEBUG(){ return this.exciterType === "DEBUG"; },

    // 各区域是否显示
    showRFSection()       { return this.isDDS || this.isPSM || this.isDEBUG; },
    showEnvelopeSection() { return this.isDDS || this.isPSM || this.isDEBUG; },
    showPAPRSection()     { return this.isNONE || this.isDX200 || this.isDDS || this.isDEBUG; },
    showDPDSection()      { return this.isDX200 || this.isPSM || this.isDDS || this.isDEBUG; },
    showDelaySection()    { return this.isPSM || this.isDDS || this.isDEBUG; }
  },
  methods: {
    // ---------- WebSocket 连接与状态监控 ----------
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => this.checkConnectionStatus(), 2000);
    },

    // ---------- WebSocket 消息处理 ----------
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
      this.handleRecordData(data);
    },
    handleRecordData(data) {
      if (this.isRecordingRecord) {
        let text;
        if (typeof data === "object") {
          try { text = JSON.stringify(data); }
          catch (e) { text = String(data); }
        } else { text = data; }
        this.recordData += text + "\n";
      }
    },

    // ---------- 参数更新 ----------
    updateParameterValue(key, value) {
      // 新增 exciterType
      if (key === "exciter.exciterType") {
        this.exciterType = value;
        return;
      }
      if (key.startsWith("exciter.")) {
        let subKey = key.slice("exciter.".length);
        if (subKey.startsWith("rfOutput")) {
          if (subKey === "rfOutputEnable") this.rfOutputEnabled = value;
          else if (subKey === "rfOutputFreq") this.rfOutputFreq = parseFloat(value);
          else if (subKey === "rfOutputPower") this.rfOutputPower = parseFloat(value);
          else if (subKey === "rfPMEnable") this.rfPMEnable = value;
          else if (subKey === "rfAMEnable") this.rfAMEnable = value;
        } else if (subKey === "rfEnvelopeLevel") {
          this.rfEnvelopeLevel = parseFloat(value);
        } else if (subKey === "rfEnvelopeDC") {
          this.rfEnvelopeDC = parseFloat(value);
        } else if (subKey === "dpdInputFreq") {
          this.dpdResult = value;
        } else if (subKey === "dpdFreqSametoRf") {
          // no-op
        } else if (subKey === "delayValue") {
          this.delayValue = value;
          this.hideProcessingModal();
          this.showSuccess("延时参数估计成功！");
        } else if (subKey === "delayReset") {
          this.hideProcessingModal();
          this.showSuccess("延时参数复位成功！");
        }
      } else if (key.startsWith("digitalIqOutput.peakToAverageSuppressLevel")) {
        this.peakToAverageSuppressLevel = parseFloat(value).toFixed(1);
        this.showSuccess("峰均比抑制设置成功！");
      } else if (key.startsWith("modulation.")) {
        let subKey = key.slice("modulation.".length);
        if (subKey === "currentDRMMode") this.currentDRMMode = value;
        else if (subKey === "spectrumBandwidth") this.spectrumBandwidth = value;
        else if (subKey === "sdcMode") this.sdcMode = value;
        else if (subKey === "mscMode") this.mscMode = value;
        else if (subKey === "mscProtectionLevelA") this.mscProtectionLevelA = value;
        else if (subKey === "mscProtectionLevelB") this.mscProtectionLevelB = value;
      } else if (key.startsWith("iqRecordStatus.")) {
        let subKey = key.slice("iqRecordStatus.".length);
        if (subKey === "recordStatus") this.recordStatus = value;
        else if (subKey === "recordedTime") {
          if (!this.isRecordingRecord) this.recordedTimeRecord = parseInt(value);
        } else if (subKey === "recordFileName") {
          if (!this.fileName) this.fileName = value;
          this.recordFileName = value;
        } else if (subKey === "recordFilePath") {
          this.recordFilePath = value;
        }
      }
    },

    // ---------- 各类设置与操作 ----------
    applyRFOutput() {
      const data = {
        "exciter.rfOutputEnable": this.rfOutputEnabled,
        "exciter.rfOutputFreq": this.rfOutputFreq.toFixed(3),
        "exciter.rfOutputPower": parseFloat(this.rfOutputPower),
        "exciter.rfPMEnable": this.rfPMEnable,
        "exciter.rfAMEnable": this.rfAMEnable
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("射频输出设置成功！");
    },
    applyEnvelope() {
      const data = {
        "exciter.rfEnvelopeLevel": parseFloat(this.rfEnvelopeLevel).toFixed(1),
        "exciter.rfEnvelopeDC": parseFloat(this.rfEnvelopeDC).toFixed(1)
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("包络输出设置成功！");
    },
    applyPAPR() {
      const v = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(v)) { this.showError("输入无效", "请输入有效数字"); return; }
      if (v < 6.0 || v > 12.0) { this.showError("调整失败", "峰均比范围为 6.0 ~ 12.0"); return; }
      const val = v.toFixed(1);
      const data = { "digitalIqOutput.peakToAverageSuppressLevel": val };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("峰均比抑制设置成功！");
    },
    applyModulationSettings() {
      const data = {
        "modulation.currentDRMMode": this.currentDRMMode,
        "modulation.spectrumBandwidth": this.spectrumBandwidth,
        "modulation.sdcMode": this.sdcMode,
        "modulation.mscMode": this.mscMode,
        "modulation.mscProtectionLevelA": this.mscProtectionLevelA,
        "modulation.mscProtectionLevelB": this.mscProtectionLevelB
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("调制输出设置成功！");
    },
    toggleFrequency() {
      // “输入频率与输出频率一致”切换逻辑
    },
    estimateDPD() {
      this.showProcessingModal("DPD参数估计中...");
      this.lastOperation = { type: "get", data: ["exciter.dpdInputFreq"] };
      WebSocketService.sendGetCommand(["exciter.dpdInputFreq"]);
    },
    resetDPD() {
      this.showProcessingModal("DPD参数复位中...");
      this.lastOperation = { type: "set", data: { "exciter.dpdFreqSametoRf": false } };
      WebSocketService.sendSetCommand({ "exciter.dpdFreqSametoRf": false });
    },
    estimateDelay() {
      this.showProcessingModal("延时参数估计中...");
      this.lastOperation = { type: "get", data: ["exciter.delayValue"] };
      WebSocketService.sendGetCommand(["exciter.delayValue"]);
    },
    resetDelay() {
      this.showProcessingModal("延时参数复位中...");
      this.lastOperation = { type: "set", data: { "exciter.delayReset": true } };
      WebSocketService.sendSetCommand({ "exciter.delayReset": true });
    },
    tryResetDelay() {
      this.confirmModal = {
        show: true,
        message: "确定要复位延时参数吗？",
        onConfirm: this.resetDelay
      };
    },
    confirmModalConfirm() {
      this.confirmModal.onConfirm();
      this.confirmModal.show = false;
    },
    confirmModalCancel() {
      this.confirmModal.show = false;
    },

    // ---------- 基带录制（状态&下载） ----------
    startRecordingRecord() {
      if (this.isRecordingRecord) return;
      if (!this.recordingTime || this.recordingTime <= 0) return;
      this.isRecordingRecord = true;
      this.recordedTimeRecord = 0;
      this.recordData = "";
      WebSocketService.sendSetCommand({
        "iqRecordCommand.recordCommand": "START",
        "iqRecordCommand.recordTime": this.recordingTime.toString()
      });
      this.timer = setInterval(() => {
        if (this.recordedTimeRecord < this.recordingTime) this.recordedTimeRecord++;
        else this.stopRecordingRecord();
      }, 1000);
      this.pollTimer = setInterval(() => {
        WebSocketService.sendGetCommand([
          "iqRecordStatus.recordStatus",
          "iqRecordStatus.recordedTime",
          "iqRecordStatus.recordFileName",
          "iqRecordStatus.recordFilePath"
        ]);
      }, 1000);
    },
    stopRecordingRecord() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
      WebSocketService.sendSetCommand({ "iqRecordCommand.recordCommand": "STOP" });
      this.isRecordingRecord = false;
      this.showRecordingComplete();
    },
    showRecordingComplete() {
      this.isModalRecordVisible = true;
      setTimeout(() => this.isModalRecordVisible = false, 1000);
    },
    downloadFile() {
      if (this.recordFilePath && this.recordFileName) {
        const linuxBase = "/home/ecdav/DRM_Modu_bin/record";
        let relative = this.recordFilePath.startsWith(linuxBase)
          ? this.recordFilePath.replace(linuxBase, "/record")
          : this.recordFilePath;
        if (!relative.endsWith("/")) relative += "/";
        relative += this.recordFileName;
        const a = document.createElement("a");
        a.href = relative;
        a.download = this.fileName || this.recordFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("错误：未能获取录制文件信息！");
      }
    },

    // ---------- 弹窗 & 错误 ----------
    showSuccess(message) {
      this.modalMessage = message;
      this.isModalVisible = true;
      setTimeout(() => this.hideModal(), 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },
    showProcessingModal(message) {
      this.processingModal = { show: true, message };
      this.isModalVisible = true;
    },
    hideProcessingModal() {
      this.processingModal.show = false;
      this.isModalVisible = false;
    },
    cancelProcessing() {
      this.hideProcessingModal();
      this.lastOperation = { type: "", data: null };
    },
    showError(message, details = "") {
      this.errorInfo = { visible: true, message, details };
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    retryLastOperation() {
      if (this.lastOperation.type === "get") {
        WebSocketService.sendGetCommand(this.lastOperation.data);
      } else if (this.lastOperation.type === "set") {
        WebSocketService.sendSetCommand(this.lastOperation.data);
      }
      this.hideErrorModal();
    }
  },
  mounted() {
    // 初始化 WebSocket 连接及状态监控
    this.initWebSocket();
    // 延时获取所有初始参数（包括 exciterType）
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
        "exciter.dpdFreqSametoRf",
        "exciter.delayValue",
        "exciter.delayReset",
        "iqRecordStatus.recordStatus",
        "iqRecordStatus.recordedTime",
        "iqRecordStatus.recordFileName",
        "iqRecordStatus.recordFilePath"
      ];
      this.lastOperation = { type: "get", data: keys };
      WebSocketService.sendGetCommand(keys);
    }, 1000);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
    if (this.timer) clearInterval(this.timer);
    if (this.pollTimer) clearInterval(this.pollTimer);
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

/* 修改按钮样式：取消全宽，调整内边距及间距 */
button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
  width: auto;
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
  color: #333;
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
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  z-index: 1000;
}
.modal button {
  margin-top: 10px;
  background-color: white;
  color: #003366;
  padding: 6px 12px;
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

.input-with-unit input {
  padding-right: 50px;
  width: 200px;
}
.note {
  margin-left: 10px;
  color: #666;
  font-size: 0.9em;
}
</style>


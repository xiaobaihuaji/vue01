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
        <!-- 两列布局容器 -->
        <div class="columns">
          <!-- 左侧列：根据不同模式显示不同内容 -->
          <div class="column left-column" v-if="showLeftColumn">
            <!-- ============== 峰均比抑制区域：仅在NONE、DDS、DEBUG模式下显示 ============== -->
            <section v-if="showPAPRSection">
              <h3>峰均比抑制（CFR）</h3>
              <table>
                <tr>
                  <th>项目</th>
                  <th>值/设置</th>
                </tr>
                <tr>
                  <td>峰均比抑制</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="paprSuppressionEnabled">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>峰均比抑制值</td>
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
            <!-- ============== 射频输出区域：仅在DDS、PSM模式下显示 ============== -->
            <section v-if="showRFSection">
              <h3>射频输出</h3>
              <table>
                <tr>
                  <th>项目</th>
                  <th>值/设置</th>
                </tr>
                <!-- "输出使能"仅在DDS模式下显示 -->
                <tr v-if="showRFOutputEnable">
                  <td>输出使能</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="rfOutputEnabled">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
                <!-- "输出频率"仅在PSM模式下显示 -->
                <tr v-if="showRFOutputFreq">
                  <td>输出频率</td>
                  <td class="input-with-unit">
                    <div class="input-with-buttons">
                      <input
                        type="number"
                        v-model.number="rfOutputFreq"
                        step="0.001"
                        placeholder="请输入输出频率"
                        @focus="showUpDownButtons = true"
                        @blur="showUpDownButtons = false"
                      >
                      <span class="unit">MHz</span>
                    </div>
                  </td>
                </tr>
                <!-- "输出功率"仅在PSM模式下显示 -->
                <tr v-if="showRFOutputPower">
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
                <!-- "调幅使能"在所有射频输出模式下都不显示（根据表格都是X） -->
                <!-- "调相使能"仅在PSM模式下显示 -->
                <tr v-if="showRFPMEnable">
                  <td>调相使能</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="rfPMEnable">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
              </table>
              <button @click="applyRFOutput">应用射频输出设置</button>
            </section>
            <!-- ============== 包络输出区域：仅在DDS、PSM、DEBUG模式下显示 ============== -->
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
          </div>
          <!-- 右侧列：调制输出参数、DPD、幅相延时 -->
          <div class="column right-column" :class="{ 'full-width': !showLeftColumn }">
            <!-- ============== 调制输出参数 ============== -->
            <section>
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
            </section>
            <!-- ============== DPD及延时操作区域：仅在DDS、DX200、PSM模式下显示 ============== -->
            <section v-if="showDPDSection">
              <h3>数字预失真校正（DPD）</h3>
              <table>
                <tr v-if="showDPDCorrection">
                  <td>校正使能</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="dpdCorrectionEnabled">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
                <tr v-if="showDPDParamEstimation">
                  <td>参数估计</td>
                  <td><button @click="startDPDEstimation" class="blue-btn">DPD参数估计</button></td>
                </tr>
                <tr v-if="showDPDInputFreq">
                  <td>输入频率与输出频率一致</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="isFrequencyConsistent" @change="toggleFrequency">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
                <tr v-if="!isFrequencyConsistent && showDPDInputFreq">
                  <td>输入频率</td>
                  <td class="input-with-unit">
                    <input type="number" v-model.number="inputFrequency" min="0" step="0.001" placeholder="输入频率">
                    <span class="unit">MHz</span>
                  </td>
                </tr>
                <tr v-if="showDPDParamEstimation">
                  <td>估计结果</td>
                  <td class="input-with-unit">
                    <input type="text" v-model="dpdResult" readonly>
                    <span class="unit">MHz</span> <!-- 根据上下文这里单位可能是状态或空，MHz可能是笔误 -->
                  </td>
                </tr>
                <tr v-if="showDPDParamReset">
                  <td>参数复位</td>
                  <td><button @click="resetDPD" class="orange-btn">DPD参数复位</button></td>
                </tr>
              </table>
            </section>
            <!-- ============== 幅相延时调整区域：仅在DDS、PSM、DEBUG模式下显示 ============== -->
            <section v-if="showDelaySection">
              <h3>幅相延时调整</h3>
              <table>
                <tr>
                  <td>自动计算延时</td>
                  <td>
                    <button class="blue-btn" @click="estimateDelay">延时参数估计</button>
                  </td>
                </tr>
                <tr>
                  <td>手动设置延时</td>
                  <td>
                    <button class="green-btn" @click="applyDelay">延时参数设置</button>
                  </td>
                </tr>
                <tr>
                  <td>延时时间</td>
                  <td class="input-with-unit">
                    <input type="text" v-model="delayValue" readonly>
                    <span class="unit">us</span>
                  </td>
                </tr>
                <tr>
                  <td>延时参数复位</td>
                  <td>
                    <button class="orange-btn" @click="tryResetDelay">延时参数复位</button>
                  </td>
                </tr>
              </table>
            </section>
          </div>
        </div> <!-- end of columns -->
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
import WebSocketService from '@/store/websocket'; // 假设WebSocketService路径正确
export default {
  name: "ModulationOutput",
  data() {
    return {
      exciterType: "", // 将由WebSocket更新
      rfOutputEnabled: false,
      rfOutputFreq: 15.120,
      rfOutputPower: -8.4,
      rfPMEnable: false,
      rfAMEnable: false, // 根据表格，此项始终不显示
      rfEnvelopeLevel: -6.0,
      rfEnvelopeDC: 0.0,
      peakToAverageSuppressLevel: "7.0",
      paprSuppressionEnabled: false,
      dpdCorrectionEnabled: false,
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
      isFrequencyConsistent: false, // DPD 输入频率与输出频率一致
      inputFrequency: 0,          // DPD 输入频率
      dpdResult: "",              // DPD 估计结果
      dpdAlignStatus: "",         // DPD 对齐状态
      dpdEstimating: false,       // DPD 是否正在估计
      delayValue: "0.0",          // 幅相延时值
      wsConnected: false,
      processingModal: { show: false, message: "" },
      confirmModal: { show: false, message: "", onConfirm: null },
      isModalVisible: false,
      modalMessage: "",
      errorInfo: { visible: false, message: "", details: "" },
      lastOperation: { type: "", data: null }, // 用于重试
      showUpDownButtons: false, // 用于控制输入框上下箭头（如果需要，此逻辑似乎未完全实现）
      dpdPollingTimer: null
    };
  },
  computed: {
    isNONE()  { return this.exciterType === "NONE"; },
    isDDS()   { return this.exciterType === "DDS"; },
    isDX100() { return this.exciterType === "DX100"; },
    isDX200() { return this.exciterType === "DX200"; },
    isPSM()   { return this.exciterType === "PSM"; },
    isDEBUG() { return this.exciterType === "DEBUG"; },

    // 是否显示左侧列（当有任何左侧内容需要显示时）
    showLeftColumn() {
      return this.showPAPRSection || this.showRFSection || this.showEnvelopeSection;
    },

    // 峰均比抑制：仅在 NONE、DDS、DEBUG 模式下显示
    showPAPRSection() {
      return this.isNONE || this.isDDS || this.isDEBUG;
    },

    // 射频输出：仅在 DDS、PSM 模式下显示
    showRFSection() {
      return this.isDDS || this.isPSM;
    },
    // 射频输出子项显示控制
    showRFOutputEnable() { // 输出使能
      return this.isDDS;
    },
    showRFOutputFreq() { // 输出频率
      return this.isPSM;
    },
    showRFOutputPower() { // 输出功率
      return this.isPSM;
    },
    showRFPMEnable() { // 调相使能
      return this.isPSM;
    },
    // 调幅使能根据表格所有模式均为 X，所以没有对应的 computed property

    // 包络输出：仅在 DDS、PSM、DEBUG 模式下显示 (根据表格更新)
    showEnvelopeSection() {
      return this.isDDS || this.isPSM || this.isDEBUG;
    },

    // DPD：仅在 DDS、DX200、PSM 模式下显示
    showDPDSection() {
      return this.isDDS || this.isDX200 || this.isPSM;
    },
    // DPD子项显示控制 (与showDPDSection逻辑一致，因为表格中DPD下的子项在这些模式下都可选)
    showDPDCorrection() { // 校正使能
      return this.isDDS || this.isDX200 || this.isPSM;
    },
    showDPDParamEstimation() { // 参数估计 (包含按钮和结果显示)
      return this.isDDS || this.isDX200 || this.isPSM;
    },
    showDPDInputFreq() { // 输入频率相关 (包含一致性开关和独立输入框)
      return this.isDDS || this.isDX200 || this.isPSM;
    },
    showDPDParamReset() { // 参数复位
      return this.isDDS || this.isDX200 || this.isPSM;
    },

    // 幅相延时调整：仅在 DDS、PSM、DEBUG 模式下显示 (根据表格更新)
    showDelaySection() {
      return this.isDDS || this.isPSM || this.isDEBUG;
    }
  },
  methods: {
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus(); // Start checking connection status
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      // Periodically check connection status
      setTimeout(() => this.checkConnectionStatus(), 2000); // Check every 2 seconds
    },
    handleWebSocketMessage(data) {
      console.log("Received WebSocket message:", data);
      // Handle errors first
      if (data && data.error === true) {
        this.showError(data.message || "通信错误", data.details);
        if (this.dpdEstimating) { // If DPD estimation was in progress, stop it
          this.cancelProcessing();
        }
        return;
      }

      // Try to parse if it's a string
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
          this.showError("无法解析服务器响应", data);
          return;
        }
      }

      // Handle specific message structures (e.g., GET responses)
      if (data && data.params && Array.isArray(data.params)) {
        data.params.forEach(param => {
          if (param.result === "success") {
            this.updateParameterValue(param.key, param.value);
          } else {
            this.showError(`参数 ${param.key} 获取失败`, param.error || "未知错误");
          }
        });
      } else if (data) { // Handle direct object updates
        Object.keys(data).forEach(key => {
          this.updateParameterValue(key, data[key]);
        });
      }
    },
    updateParameterValue(key, value) {
      // console.log(`Updating ${key} to ${value}`);
      if (key === "exciter.exciterType") {
        this.exciterType = value;
        // Potentially re-evaluate visibilities or fetch mode-specific params here
        return;
      }

      // Exciter related parameters
      if (key.startsWith("exciter.")) {
        const subKey = key.slice(8); // remove "exciter."
        switch (subKey) {
          case "rfOutputEnable":
            this.rfOutputEnabled = (value === "true" || value === true);
            break;
          case "rfOutputFreq":
            this.rfOutputFreq = parseFloat(value);
            break;
          case "rfOutputPower":
            this.rfOutputPower = parseFloat(value);
            break;
          case "rfPMEnable":
            this.rfPMEnable = (value === "true" || value === true);
            break;
          case "rfAMEnable": // Though not displayed, keep for completeness if backend sends it
            this.rfAMEnable = (value === "true" || value === true);
            break;
          case "rfEnvelopeLevel":
            this.rfEnvelopeLevel = parseFloat(value);
            break;
          case "rfEnvelopeDC":
            this.rfEnvelopeDC = parseFloat(value);
            break;
          case "dpdAlignStatus": // DPD status update
            this.handleDPDStatus(value);
            break;
          case "dpdAlignResult": // DPD result
            this.dpdResult = value; // Assuming result is a string, adjust if needed
            break;
          case "delayValue":
            this.delayValue = parseFloat(value).toFixed(1); // Assuming value is numeric string
            break;
          // Add other exciter params if necessary
        }
      }
      // PAPR related parameters
      else if (key === "digitalIqOutput.peakToAverageSuppressLevel") {
        this.peakToAverageSuppressLevel = parseFloat(value).toFixed(1);
      } else if (key === "digitalIqOutput.paprSuppressionEnabled") {
        this.paprSuppressionEnabled = (value === "true" || value === true);
      }
      // Modulation parameters
      else if (key.startsWith("modulation.")) {
        const subKey = key.slice(11); // remove "modulation."
        if (value !== null && value !== "") { // Ensure value is meaningful
          switch (subKey) {
            case "currentDRMMode":
              this.currentDRMMode = value;
              break;
            case "spectrumBandwidth":
              this.spectrumBandwidth = value;
              break;
            case "sdcMode":
              this.sdcMode = value;
              break;
            case "mscMode":
              this.mscMode = value;
              break;
            case "mscProtectionLevelA":
              this.mscProtectionLevelA = value;
              break;
            case "mscProtectionLevelB":
              this.mscProtectionLevelB = value;
              break;
          }
        }
      }
      // DPD Correction Enable
      else if (key === "exciter.dpdCorrectionEnabled") { // Assuming this is the key for DPD correction enable
          this.dpdCorrectionEnabled = (value === "true" || value === true);
      }
    },

    applyPAPR() {
      const peakLevel = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(peakLevel) || peakLevel < 6.0 || peakLevel > 12.0) {
        this.showError("峰均比抑制值必须在 6.0 到 12.0 dB之间。");
        return;
      }
      const data = {
        "digitalIqOutput.peakToAverageSuppressLevel": peakLevel.toFixed(1),
        "digitalIqOutput.paprSuppressionEnabled": this.paprSuppressionEnabled.toString()
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("峰均比抑制设置已发送！");
    },
    applyRFOutput() {
      const data = {};
      if (this.showRFOutputEnable) { // Only include if visible for current mode
        data["exciter.rfOutputEnable"] = this.rfOutputEnabled.toString();
      }
      if (this.showRFOutputFreq) {
        data["exciter.rfOutputFreq"] = this.rfOutputFreq.toFixed(3);
      }
      if (this.showRFOutputPower) {
        data["exciter.rfOutputPower"] = this.rfOutputPower.toFixed(1);
      }
      if (this.showRFPMEnable) {
        data["exciter.rfPMEnable"] = this.rfPMEnable.toString();
      }
      // rfAMEnable is not included as it's not configurable via UI per table

      if (Object.keys(data).length > 0) {
        this.lastOperation = { type: "set", data };
        WebSocketService.sendSetCommand(data);
        this.showSuccess("射频输出设置已发送！");
      } else {
        this.showError("当前模式下无可应用的射频输出设置。");
      }
    },
    applyEnvelope() {
      const data = {
        "exciter.rfEnvelopeLevel": this.rfEnvelopeLevel.toFixed(1),
        "exciter.rfEnvelopeDC": this.rfEnvelopeDC.toFixed(1)
      };
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("包络输出设置已发送！");
    },

    startDPDEstimation() {
      // Ensure DPD section is visible for the current mode
      if (!this.showDPDSection) {
        this.showError("当前模式不支持DPD参数估计。");
        return;
      }
      this.dpdEstimating = true;
      this.dpdResult = ""; // Clear previous result
      this.dpdAlignStatus = ""; // Clear previous status
      const data = { "exciter.dpdAlignStart": "start" }; // Command to start DPD
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.processingModal.show = true;
      this.processingModal.message = "DPD参数估计中...";
      this.pollDPDStatus(); // Start polling for status
    },

    pollDPDStatus() {
      clearTimeout(this.dpdPollingTimer); // Clear existing timer
      if (!this.dpdEstimating) return; // Stop polling if estimation cancelled or finished

      // Request status and result
      const keysToGet = ["exciter.dpdAlignStatus", "exciter.dpdAlignResult"];
      WebSocketService.sendGetCommand(keysToGet);

      // Set up next poll if still estimating and not yet aligned
      // The actual check for ALIGNED is in handleDPDStatus
      this.dpdPollingTimer = setTimeout(() => {
        if (this.dpdEstimating) { // Check again in case it was cancelled
            this.pollDPDStatus();
        }
      }, 2000); // Poll every 2 seconds
    },

    handleDPDStatus(status) {
      this.dpdAlignStatus = status;
      if (!this.dpdEstimating) return; // If not estimating, do nothing

      if (status === "ALIGNED") {
        this.processingModal.message = "DPD参数估计完成！";
        clearTimeout(this.dpdPollingTimer); // Stop polling
        // Fetch final result one last time explicitly if needed, or rely on pollDPDStatus having fetched it
        // WebSocketService.sendGetCommand(["exciter.dpdAlignResult"]);
        setTimeout(() => {
          this.processingModal.show = false;
          this.dpdEstimating = false;
          this.showSuccess("DPD参数估计成功！");
        }, 1500); // Show success message briefly
      } else if (status === "FAILED" || status === "ERROR") { // Assuming FAILED or ERROR states
        this.processingModal.show = false;
        clearTimeout(this.dpdPollingTimer);
        this.dpdEstimating = false;
        this.showError("DPD参数估计失败", `状态: ${status}`);
        // Fetch result which might contain error details
        WebSocketService.sendGetCommand(["exciter.dpdAlignResult"]);
      } else {
        // Still in progress, message already set, polling continues
        this.processingModal.message = `DPD参数估计中... (${status || '未知状态'})`;
      }
    },
    resetDPD() {
      if (!this.showDPDSection) {
        this.showError("当前模式不支持DPD参数复位。");
        return;
      }
      const data = { "exciter.dpdParamsReset": "reset" }; // Command to reset DPD
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("DPD参数复位命令已发送！");
      this.dpdResult = ""; // Clear result display
      this.dpdAlignStatus = ""; // Clear status display
    },
    // DPD Correction Enable toggle
    toggleDPDCorrection() {
        if (!this.showDPDSection) return;
        const data = { "exciter.dpdCorrectionEnabled": this.dpdCorrectionEnabled.toString() };
        this.lastOperation = { type: "set", data };
        WebSocketService.sendSetCommand(data);
        this.showSuccess(`DPD校正已${this.dpdCorrectionEnabled ? '启用' : '禁用'}`);
    },
    // Watch dpdCorrectionEnabled to send command
    // This can be done via a watcher or by calling toggleDPDCorrection from the @change event of the checkbox.
    // The template v-model="dpdCorrectionEnabled" handles UI update.
    // If you need to send a command when it changes, add @change="sendDPDCorrectionState" to the input.
    sendDPDCorrectionState() { // Call this on @change of DPD correction checkbox
        this.toggleDPDCorrection();
    },

    estimateDelay() {
      if (!this.showDelaySection) {
        this.showError("当前模式不支持延时参数估计。");
        return;
      }
      // This typically involves sending a command to start estimation and then polling or waiting for a result.
      // For now, let's assume it's a direct GET for 'delayValue', or a command to trigger calculation.
      // If it's a trigger, it should be like DPD: start -> poll -> result.
      // Based on current code, it seems like a GET.
      this.lastOperation = { type: "get", data: ["exciter.delayValue"] };
      WebSocketService.sendGetCommand(["exciter.delayValue"]);
      this.showSuccess("延时参数估计请求已发送 (获取当前值)。"); // Or "延时参数估计已启动" if it's a process
    },
    applyDelay() {
      if (!this.showDelaySection) {
        this.showError("当前模式不支持延时参数设置。");
        return;
      }
      // This method implies setting a manually entered delay.
      // However, the 'delayValue' input is readonly.
      // If manual setting is intended, the input should not be readonly, and a WebSocket command should be sent.
      // For now, as it's readonly, this button might be for applying an estimated/calculated value if it's not auto-applied.
      this.showError("手动设置延时功能未完全实现 (输入框为只读)。");
      // Example if it were settable:
      // const delay = parseFloat(this.delayValue);
      // if (isNaN(delay)) {
      //   this.showError("无效的延时值。");
      //   return;
      // }
      // const data = { "exciter.setDelayValue": delay.toFixed(1) }; // Example key
      // this.lastOperation = { type: "set", data };
      // WebSocketService.sendSetCommand(data);
      // this.showSuccess("延时参数设置已发送！");
    },
    tryResetDelay() {
      if (!this.showDelaySection) {
        this.showError("当前模式不支持延时参数复位。");
        return;
      }
      const data = { "exciter.delayReset": "true" }; // Assuming this is the command
      this.lastOperation = { type: "set", data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess("延时参数复位命令已发送！");
      this.delayValue = "0.0"; // Reset local display
    },

    toggleFrequency() {
      // Logic for when 'isFrequencyConsistent' changes.
      // If consistent, inputFrequency might be disabled or synced.
      // If not consistent, inputFrequency becomes editable.
      // No WebSocket command seems needed here directly, only UI behavior.
      if (this.isFrequencyConsistent) {
        // Potentially sync inputFrequency with rfOutputFreq if applicable, or clear/disable it.
        // This depends on system design. For now, just a UI toggle.
      }
    },

    cancelProcessing() {
      this.processingModal.show = false;
      if (this.dpdEstimating) {
        clearTimeout(this.dpdPollingTimer);
        this.dpdEstimating = false;
        // Optionally send a cancel command to the backend if supported
        // WebSocketService.sendSetCommand({ "exciter.dpdAlignCancel": "cancel" });
        this.showSuccess("DPD操作已取消。");
      }
    },
    confirmModalConfirm() {
      if (this.confirmModal.onConfirm && typeof this.confirmModal.onConfirm === 'function') {
        this.confirmModal.onConfirm();
      }
      this.confirmModal.show = false;
    },
    confirmModalCancel() {
      this.confirmModal.show = false;
    },
    showSuccess(msg) {
      this.modalMessage = msg;
      this.isModalVisible = true;
      setTimeout(() => {
        this.isModalVisible = false;
      }, 2000);
    },
    showError(msg, details = "") {
      this.errorInfo.visible = true;
      this.errorInfo.message = msg;
      this.errorInfo.details = details;
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    hideModal() {
      this.isModalVisible = false;
    },
    handlePAPRBlur() {
      this.showUpDownButtons = false;
      // Validate PAPR value on blur as well, or rely on applyPAPR for validation
      const peakLevel = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(peakLevel) || peakLevel < 6.0 || peakLevel > 12.0) {
        // Optionally show a less intrusive warning or highlight the field
        // this.showError("峰均比抑制值必须在 6.0 到 12.0 dB之间。");
      }
    },
    retryLastOperation() {
      this.hideErrorModal();
      if (this.lastOperation && this.lastOperation.type) {
        this.showSuccess("正在重试上一操作...");
        if (this.lastOperation.type === "get") {
          WebSocketService.sendGetCommand(this.lastOperation.data);
        } else if (this.lastOperation.type === "set") {
          WebSocketService.sendSetCommand(this.lastOperation.data);
        }
      } else {
        this.showError("没有可重试的操作。");
      }
    },
    fetchAllParameters() {
      const keysToGet = [
        "exciter.exciterType",
        // PAPR
        "digitalIqOutput.peakToAverageSuppressLevel",
        "digitalIqOutput.paprSuppressionEnabled",
        // RF Output (fetch all, UI will show/hide based on mode)
        "exciter.rfOutputEnable",
        "exciter.rfOutputFreq",
        "exciter.rfOutputPower",
        "exciter.rfPMEnable",
        // "exciter.rfAMEnable", // Not displayed, but fetch if backend supports/needs it
        // Envelope Output
        "exciter.rfEnvelopeLevel",
        "exciter.rfEnvelopeDC",
        // DPD (fetch all DPD related status/values)
        "exciter.dpdCorrectionEnabled", // Assuming this is the key
        "exciter.dpdAlignStatus",
        "exciter.dpdAlignResult",
        // Delay
        "exciter.delayValue",
        // Modulation Params (already disabled in UI, but good to have current state)
        "modulation.currentDRMMode",
        "modulation.spectrumBandwidth",
        "modulation.sdcMode",
        "modulation.mscMode",
        "modulation.mscProtectionLevelA",
        "modulation.mscProtectionLevelB",
      ];
      this.lastOperation = { type: "get", data: keysToGet };
      WebSocketService.sendGetCommand(keysToGet);
    }
  },
  watch: {
    // Watcher for dpdCorrectionEnabled to send command when toggled by user
    // Ensure this doesn't conflict with initial data load setting the value
    // dpdCorrectionEnabled(newValue, oldValue) {
    //   // Send command only if it's a user interaction, not initial load
    //   // This can be tricky. Often better to use @change on the input itself.
    //   // If this watcher is kept, add a flag to prevent sending on initial load.
    //   if (this.isMounted) { // Add an isMounted data property
    //      this.sendDPDCorrectionState();
    //   }
    // }
  },
  mounted() {
    // this.isMounted = true; // For watcher logic if used
    this.initWebSocket();
    // Fetch all parameters after a short delay to allow WebSocket to connect
    // and to get the initial exciterType first if it's fetched separately or faster.
    // Or, fetch exciterType first, then in its update callback, fetch mode-specific params.
    // For simplicity here, fetching all.
    setTimeout(() => {
      if (this.wsConnected) {
        this.fetchAllParameters();
      } else {
        // Handle case where WebSocket is not connected after timeout
        // Perhaps set up a retry or show a persistent error.
        console.warn("WebSocket not connected after initial timeout. Parameter fetch skipped.");
        // Attempt to fetch again once connection is established
        const unwatch = this.$watch('wsConnected', (newVal) => {
          if (newVal) {
            this.fetchAllParameters();
            unwatch(); // Stop watching once connected and fetched
          }
        });
      }
    }, 1000); // Delay fetching to allow WebSocket connection
  },
  beforeUnmount() {
    // this.isMounted = false; // For watcher logic if used
    WebSocketService.offMessage(this.handleWebSocketMessage);
    clearTimeout(this.dpdPollingTimer); // Important to clear timers
    // Consider WebSocketService.disconnect() if this component manages the lifecycle exclusively
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
  overflow-y: auto; /* Allow scrolling for the whole page if content is too long */
}
.content {
  width: 100%;
  max-width: 1000px; /* Adjust as needed */
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.content-container {
  /* If content within .content needs its own scroll, manage here */
}

.connection-status {
  text-align: center;
  padding: 5px;
  margin-bottom: 15px;
  border-radius: 3px;
  background-color: #f8d7da; /* Default: Not Connected (Reddish) */
  color: #721c24;
}
.connection-status.connected {
  background-color: #d4edda; /* Connected (Greenish) */
  color: #155724;
}

.columns {
  display: flex;
  flex-wrap: wrap; /* Allow columns to wrap on smaller screens if needed */
  gap: 20px;
}
.column {
  flex: 1;
  min-width: 300px; /* Minimum width before wrapping or shrinking too much */
}
.left-column {
  /* Specific styles for left column if any */
}
.right-column {
  /* Specific styles for right column if any */
}
.right-column.full-width {
  flex-basis: 100%; /* Make right column take full width if left is hidden */
}

section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #003366;
}
h3 {
  margin-bottom: 15px;
  color: #004080;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}
th {
  background-color: #f2f2f2;
  font-weight: bold;
}
td:first-child {
    width: 40%; /* Adjust width of the label column */
}

.input-with-unit {
  display: flex;
  align-items: center;
}
.input-with-unit input[type="number"],
.input-with-unit input[type="text"] {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 5px; /* Space before unit */
  box-sizing: border-box;
}
.input-with-buttons { /* This class seems unused in current input structure, review if needed */
  display: flex;
  align-items: center;
}
.unit {
  color: #555;
  margin-left: 8px;
  white-space: nowrap;
}

button {
  background-color: #0056b3; /* Standard blue */
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}
button:hover {
  background-color: #004080;
}
button.disabled, button:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}
section > button { /* Button directly under section, e.g., "应用设置" */
    display: block;
    width: 100%;
    margin-top: 10px;
}

.blue-btn { background-color: #1890ff; }
.blue-btn:hover { background-color: #40a9ff; }
.orange-btn { background-color: #fa8c16; }
.orange-btn:hover { background-color: #ffa940; }
.green-btn { background-color: #52c41a; }
.green-btn:hover { background-color: #73d13d; }
.cancel-btn { background-color: #8c8c8c; } /* For modal cancel */
.cancel-btn:hover { background-color: #666666; }


.custom-select {
  width: 100%; /* Make select take full width of td */
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  box-sizing: border-box;
}
.custom-select.no-arrow {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none; /* Remove system default arrow if 'no-arrow' is for styling only */
   /* If it's for disabled, use :disabled pseudo-class */
}
.custom-select:disabled {
    background-color: #e9ecef;
    color: #495057;
    cursor: not-allowed;
}


.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  color: #333;
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  min-width: 300px;
}
.modal p {
  margin-bottom: 20px;
  font-size: 16px;
}
.modal button { /* General modal button styling */
  margin: 0 5px; /* Spacing between buttons if multiple */
  padding: 8px 15px;
  /* background-color: #0056b3;
  color: white; */
}
/* Specific modal button colors already defined by .blue-btn etc. */
.modal .blue-btn { /* Ensure modal blue button uses its style */
    /* Already defined */
}


.error-modal {
  border-left: 5px solid #dc3545; /* Red accent for error */
}
.error-modal h3 {
    color: #dc3545;
    margin-top: 0;
    border-bottom: none;
}
.error-details {
  font-size: 0.9em;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: left;
  max-height: 100px;
  overflow-y: auto;
  word-break: break-all;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px; /* Smaller switch */
  height: 26px; /* Smaller switch */
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
  border-radius: 26px; /* Keep it rounded */
}
.slider:before {
  position: absolute;
  content: "";
  height: 20px; /* Smaller knob */
  width: 20px;  /* Smaller knob */
  left: 3px;    /* Adjust position */
  bottom: 3px;  /* Adjust position */
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #1890ff; /* Blue when checked */
}
input:focus + .slider { /* Optional: add focus style */
  box-shadow: 0 0 1px #1890ff;
}
input:checked + .slider:before {
  transform: translateX(24px); /* Adjust slide distance */
}
</style>

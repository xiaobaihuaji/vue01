<!--  ModulationOutput.vue  -->
<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <!-- WebSocket 连接状态 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket 状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <!-- 标题 -->
        <h2>调制输出</h2>

        <!-- ===== 两列布局 ================================================= -->
        <div class="columns">
          <!-- ================= 左侧列 ================= -->
          <div class="column left-column" v-if="showLeftColumn">
            <!-- 峰均比抑制：NONE、DDS、DEBUG -->
            <section v-if="showPAPRSection">
              <h3>峰均比抑制（CFR）</h3>
              <table>
                <tr><th>项目</th><th>值/设置</th></tr>
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
                    <input
                      type="number"
                      v-model="peakToAverageSuppressLevel"
                      step="0.1"
                      placeholder="6.0~12.0"
                      @focus="showUpDownButtons = true"
                      @blur="handlePAPRBlur"
                    >
                    <span class="unit">dB</span>
                  </td>
                </tr>
              </table>
              <button @click="applyPAPR">应用峰均比抑制</button>
            </section>

            <!-- 射频输出：DDS、PSM、DEBUG -->
            <section v-if="showRFSection">
              <h3>射频输出</h3>
              <table>
                <tr><th>项目</th><th>值/设置</th></tr>
                <tr v-if="showRFOutputEnable">
                  <td>输出使能</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="rfOutputEnabled">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
                <tr v-if="showRFOutputFreq">
                  <td>输出频率</td>
                  <td class="input-with-unit">
                    <input
                      type="number"
                      v-model.number="rfOutputFreq"
                      step="0.001"
                      placeholder="MHz"
                      @focus="showUpDownButtons = true"
                      @blur="showUpDownButtons = false"
                    >
                    <span class="unit">MHz</span>
                  </td>
                </tr>
                <tr v-if="showRFOutputPower">
                  <td>输出功率</td>
                  <td class="input-with-unit">
                    <input
                      type="number"
                      v-model.number="rfOutputPower"
                      step="0.1"
                      placeholder="dB"
                      @focus="showUpDownButtons = true"
                      @blur="showUpDownButtons = false"
                    >
                    <span class="unit">dB</span>
                  </td>
                </tr>
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
              <button @click="applyRFOutput">应用射频输出</button>
            </section>

            <!-- 包络输出：DDS、PSM、DEBUG -->
            <section v-if="showEnvelopeSection">
              <h3>包络输出</h3>
              <table>
                <tr><th>项目</th><th>值/设置</th></tr>
                <tr>
                  <td>电平增益</td>
                  <td class="input-with-unit">
                    <input
                      type="number"
                      v-model.number="rfEnvelopeLevel"
                      step="0.1"
                      placeholder="dB"
                      @focus="showUpDownButtons = true"
                      @blur="showUpDownButtons = false"
                    >
                    <span class="unit">dB</span>
                  </td>
                </tr>
                <tr>
                  <td>直流补偿</td>
                  <td class="input-with-unit">
                    <input
                      type="number"
                      v-model.number="rfEnvelopeDC"
                      step="0.1"
                      placeholder="%"
                      @focus="showUpDownButtons = true"
                      @blur="showUpDownButtons = false"
                    >
                    <span class="unit">%</span>
                  </td>
                </tr>
              </table>
              <button @click="applyEnvelope">应用包络输出</button>
            </section>
          </div>
          <!-- ================= 右侧列 ================= -->
          <div class="column right-column" :class="{ 'full-width': !showLeftColumn }">

            <!-- 调制输出参数：始终显示 -->
            <section>
              <h3>调制输出参数</h3>
              <table>
                <tr><th>项目</th><th>值/设置</th></tr>
                <tr>
                  <td>DRM 模式</td>
                  <td>
                    <select v-model="currentDRMMode" disabled class="custom-select">
                      <option v-for="m in drmModes" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>频谱带宽</td>
                  <td>
                    <select v-model="spectrumBandwidth" disabled class="custom-select">
                      <option v-for="bw in bandwidths" :key="bw" :value="bw">{{ bw }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>SDC 模式</td>
                  <td>
                    <select v-model="sdcMode" disabled class="custom-select">
                      <option v-for="m in sdcModes" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>MSC 模式</td>
                  <td>
                    <select v-model="mscMode" disabled class="custom-select">
                      <option v-for="m in mscModes" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>MSC 保护等级 A</td>
                  <td>
                    <select v-model="mscProtectionLevelA" disabled class="custom-select">
                      <option v-for="lvl in protectionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>MSC 保护等级 B</td>
                  <td>
                    <select v-model="mscProtectionLevelB" disabled class="custom-select">
                      <option v-for="lvl in protectionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
                    </select>
                  </td>
                </tr>
              </table>
            </section>

            <!-- DPD：DDS、DX200、PSM、DEBUG -->
            <section v-if="showDPDSection">
              <h3>数字预失真校正（DPD）</h3>
              <table>
                <tr v-if="showDPDCorrection">
                  <td>校正使能</td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" v-model="dpdCorrectionEnabled" @change="sendDPDCorrectionState">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
                <tr v-if="showDPDParamEstimation">
                  <td>参数估计</td>
                  <td><button class="blue-btn" @click="startDPDEstimation">DPD 参数估计</button></td>
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
                <tr v-if="showDPDInputFreq && !isFrequencyConsistent">
                  <td>输入频率</td>
                  <td class="input-with-unit">
                    <input type="number" v-model.number="inputFrequency" step="0.001" placeholder="MHz">
                    <span class="unit">MHz</span>
                  </td>
                </tr>
                <tr v-if="showDPDParamEstimation">
                  <td>估计结果</td>
                  <td class="input-with-unit">
                    <input type="text" v-model="dpdResult" readonly>
                  </td>
                </tr>
                <tr v-if="showDPDParamReset">
                  <td>参数复位</td>
                  <td>
                    <!-- **** 改成先确认 **** -->
                    <button class="orange-btn" @click="askResetDPD">DPD 参数复位</button>
                  </td>
                </tr>
              </table>
            </section>

            <!-- 幅相延时：DDS、PSM、DEBUG -->
            <section v-if="showDelaySection">
              <h3>幅相延时调整</h3>
              <table>
                <tr v-if="showDelayAuto">
                  <td>自动计算延时</td>
                  <td><button class="blue-btn" @click="estimateDelay">延时参数估计</button></td>
                </tr>
                <tr v-if="showDelayManual">
                  <td>手动设置延时</td>
                  <td><button class="green-btn" @click="applyDelay">延时参数设置</button></td>
                </tr>
                <tr v-if="showDelayTime">
                  <td>延时时间</td>
                  <td class="input-with-unit">
                    <input type="text" v-model="delayValue" readonly>
                    <span class="unit">us</span>
                  </td>
                </tr>
                <tr v-if="showDelayReset">
                  <td>延时参数复位</td>
                  <td><button class="orange-btn" @click="tryResetDelay">延时参数复位</button></td>
                </tr>
              </table>
            </section>

          </div>
        </div>

        <!-- =============== 全局弹窗 =============== -->
        <div v-if="processingModal.show" class="modal">
          <p>{{ processingModal.message }}</p>
          <button class="cancel-btn" @click="cancelProcessing">取消</button>
        </div>

        <div v-if="confirmModal.show" class="modal">
          <p>{{ confirmModal.message }}</p>
          <button class="blue-btn" @click="confirmModalConfirm">确认</button>
          <button class="cancel-btn" @click="confirmModalCancel">取消</button>
        </div>

        <div v-if="isModalVisible" class="modal">
          <p>{{ modalMessage }}</p>
          <button class="blue-btn" @click="hideModal">关闭</button>
        </div>

        <div v-if="errorInfo.visible" class="modal error-modal">
          <h3>错误</h3>
          <p>{{ errorInfo.message }}</p>
          <div v-if="errorInfo.details" class="error-details">{{ errorInfo.details }}</div>
          <div class="modal-buttons">
            <button class="cancel-btn" @click="hideErrorModal">关闭</button>
            <button class="blue-btn" @click="retryLastOperation">重试</button>
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
      /* ======================== 原有 data 全部保留 ======================== */
      exciterType: '',
      rfOutputEnabled: false,
      rfOutputFreq: 15.120,
      rfOutputPower: -8.4,
      rfPMEnable: false,
      rfEnvelopeLevel: -6.0,
      rfEnvelopeDC: 0.0,
      paprSuppressionEnabled: false,
      peakToAverageSuppressLevel: '7.0',
      dpdCorrectionEnabled: false,
      isFrequencyConsistent: false,
      inputFrequency: 0,
      dpdResult: '',
      dpdAlignStatus: '',
      dpdEstimating: false,
      delayValue: '0.0',
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

      wsConnected: false,
      processingModal: { show: false, message: '' },
      confirmModal:    { show: false, message: '', onConfirm: null },
      isModalVisible:  false,
      modalMessage:    '',
      errorInfo:       { visible: false, message: '', details: '' },
      lastOperation:   { type: '', data: null },
      showUpDownButtons: false,
      dpdPollingTimer: null
    };
  },

  /* ======================== computed 保持原样 ======================== */
  computed: {
    isNONE()  { return this.exciterType === 'NONE'; },
    isDDS()   { return this.exciterType === 'DDS'; },
    isDX100() { return this.exciterType === 'DX100'; },
    isDX200() { return this.exciterType === 'DX200'; },
    isPSM()   { return this.exciterType === 'PSM'; },
    isDEBUG() { return this.exciterType === 'DEBUG'; },

    showLeftColumn()      { return this.showPAPRSection || this.showRFSection || this.showEnvelopeSection; },
    showPAPRSection()     { return this.isNONE || this.isDDS || this.isDEBUG; },
    showRFSection()       { return this.isDDS || this.isPSM || this.isDEBUG; },
    showRFOutputEnable()  { return this.isDDS || this.isDEBUG; },
    showRFOutputFreq()    { return this.isPSM || this.isDEBUG; },
    showRFOutputPower()   { return this.isPSM || this.isDEBUG; },
    showRFPMEnable()      { return this.isPSM || this.isDEBUG; },
    showEnvelopeSection() { return this.isDDS || this.isPSM || this.isDEBUG; },

    showDPDSection()      { return this.isDDS || this.isDX200 || this.isPSM || this.isDEBUG; },
    showDPDCorrection()   { return this.showDPDSection; },
    showDPDParamEstimation() { return this.showDPDSection; },
    showDPDInputFreq()    { return this.showDPDSection; },
    showDPDParamReset()   { return this.showDPDSection; },

    showDelaySection() { return this.isDDS || this.isPSM || this.isDEBUG; },
    showDelayAuto()    { return this.showDelaySection; },
    showDelayManual()  { return this.isDDS || this.isDEBUG; },
    showDelayTime()    { return this.isDDS || this.isDEBUG; },
    showDelayReset()   { return this.isDDS || this.isDEBUG; }
  },

  /* ======================== methods ======================== */
  methods: {
    /* ----------------- 新增：复位确认弹窗 ----------------- */
    askResetDPD() {
      if (!this.showDPDSection) return;

      this.confirmModal.message = '确定要进行 DPD 参数复位吗？';
      this.confirmModal.onConfirm = () => {
        this.resetDPD();            // 真正复位
      };
      this.confirmModal.show = true;
    },

    /* ----------------- 原有方法，下方均未改动 ----------------- */
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
      if (data && data.error) {
        this.showError(data.message || '通信错误', data.details);
        if (this.dpdEstimating) this.cancelProcessing();
        return;
      }
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {
          this.showError('无法解析服务器响应', data);
          return;
        }
      }
      if (data.params && Array.isArray(data.params)) {
        data.params.forEach(p => {
          p.result === 'success'
            ? this.updateParameterValue(p.key, p.value)
            : this.showError(`参数 ${p.key} 获取失败`, p.error || '未知错误');
        });
      } else if (data) {
        Object.keys(data).forEach(k => this.updateParameterValue(k, data[k]));
      }
    },
    updateParameterValue(key, value) {
      if (key === 'exciter.exciterType') { this.exciterType = value; return; }
      if (key.startsWith('exciter.')) {
        const sub = key.slice(8);
        switch (sub) {
          case 'rfOutputEnable':  this.rfOutputEnabled  = !!value; break;
          case 'rfOutputFreq':    this.rfOutputFreq     = parseFloat(value); break;
          case 'rfOutputPower':   this.rfOutputPower    = parseFloat(value); break;
          case 'rfPMEnable':      this.rfPMEnable       = !!value; break;
          case 'rfEnvelopeLevel': this.rfEnvelopeLevel  = parseFloat(value); break;
          case 'rfEnvelopeDC':    this.rfEnvelopeDC     = parseFloat(value); break;
          case 'dpdAlignStatus':  this.handleDPDStatus(value); break;
          case 'dpdAlignResult':  this.dpdResult = value; break;
          case 'delayValue':      this.delayValue = parseFloat(value).toFixed(1); break;
        }
      } else if (key === 'digitalIqOutput.peakToAverageSuppressLevel') {
        this.peakToAverageSuppressLevel = parseFloat(value).toFixed(1);
      } else if (key === 'digitalIqOutput.paprSuppressionEnabled') {
        this.paprSuppressionEnabled = !!value;
      } else if (key.startsWith('modulation.')) {
        const sub = key.slice(11);
        switch (sub) {
          case 'currentDRMMode':      this.currentDRMMode = value; break;
          case 'spectrumBandwidth':   this.spectrumBandwidth = value; break;
          case 'sdcMode':             this.sdcMode = value; break;
          case 'mscMode':             this.mscMode = value; break;
          case 'mscProtectionLevelA': this.mscProtectionLevelA = value; break;
          case 'mscProtectionLevelB': this.mscProtectionLevelB = value; break;
        }
      } else if (key === 'exciter.dpdCorrectionEnabled') {
        this.dpdCorrectionEnabled = !!value;
      }
    },

    /* ---------- PAPR / 射频 / 包络：与之前相同 ---------- */
    applyPAPR() {
      const v = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(v) || v < 6 || v > 12) return this.showError('峰均比必须在6~12 dB');
      const data = {
        'digitalIqOutput.peakToAverageSuppressLevel': v.toFixed(1),
        'digitalIqOutput.paprSuppressionEnabled': this.paprSuppressionEnabled.toString()
      };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('峰均比抑制设置已发送');
    },
    applyRFOutput() {
      const data = {};
      if (this.showRFOutputEnable) data['exciter.rfOutputEnable'] = this.rfOutputEnabled.toString();
      if (this.showRFOutputFreq)   data['exciter.rfOutputFreq']   = this.rfOutputFreq.toFixed(3);
      if (this.showRFOutputPower)  data['exciter.rfOutputPower']  = this.rfOutputPower.toFixed(1);
      if (this.showRFPMEnable)     data['exciter.rfPMEnable']     = this.rfPMEnable.toString();
      if (!Object.keys(data).length) return this.showError('当前模式无射频输出设置');
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('射频输出设置已发送');
    },
    applyEnvelope() {
      const data = {
        'exciter.rfEnvelopeLevel': this.rfEnvelopeLevel.toFixed(1),
        'exciter.rfEnvelopeDC':    this.rfEnvelopeDC.toFixed(1)
      };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('包络输出设置已发送');
    },

    /* ---------- DPD: 估计 / 复位 ---------- */
    startDPDEstimation() {
      if (!this.showDPDSection) return this.showError('当前模式不支持DPD估计');
      this.dpdEstimating = true;
      this.dpdResult = ''; this.dpdAlignStatus = '';
      const data = { 'exciter.dpdAlignStart': 'start' };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.processingModal = { show: true, message: 'DPD 参数估计中...' };
      this.pollDPDStatus();
    },
    pollDPDStatus() {
      clearTimeout(this.dpdPollingTimer);
      if (!this.dpdEstimating) return;
      WebSocketService.sendGetCommand(['exciter.dpdAlignStatus', 'exciter.dpdAlignResult']);
      this.dpdPollingTimer = setTimeout(() => { if (this.dpdEstimating) this.pollDPDStatus(); }, 2000);
    },
    handleDPDStatus(status) {
      this.dpdAlignStatus = status;
      if (status === 'ALIGNEND') {
        clearTimeout(this.dpdPollingTimer);
        this.processingModal.message = 'DPD 参数估计完成！';
        setTimeout(() => {
          this.processingModal.show = false;
          this.dpdEstimating = false;
          this.showSuccess('DPD 参数估计成功');
        }, 1000);
      } else if (status === 'FAILED' || status === 'ERROR') {
        clearTimeout(this.dpdPollingTimer);
        this.processingModal.show = false;
        this.dpdEstimating = false;
        this.showError('DPD 参数估计失败', `状态: ${status}`);
      } else {
        this.processingModal.message = `DPD 参数估计中... (${status})`;
      }
    },

    /* 真正执行复位 — 仅被确认按钮调用 */
    resetDPD() {
      const data = { 'exciter.dpdParamsReset': 'reset' };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess('DPD 参数复位已发送');
      this.dpdResult = '';
      this.dpdAlignStatus = '';
    },

    sendDPDCorrectionState() {
      const data = { 'exciter.dpdCorrectionEnabled': this.dpdCorrectionEnabled.toString() };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.showSuccess(`DPD 校正已${this.dpdCorrectionEnabled ? '启用' : '禁用'}`);
    },

    /* ---------- 幅相延时 ---------- */
    estimateDelay() {
      const keys = ['exciter.delayValue'];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
      this.showSuccess('延时参数估计已请求');
    },
    applyDelay() { this.showError('手动设置延时功能未实现'); },
    tryResetDelay() {
      if (!this.showDelayReset) return this.showError('当前模式不支持延时复位');
      const data = { 'exciter.delayReset': 'true' };
      this.lastOperation = { type: 'set', data };
      WebSocketService.sendSetCommand(data);
      this.delayValue = '0.0';
      this.showSuccess('延时参数复位已发送');
    },

    /* ---------- 通用 UI ---------- */
    toggleFrequency() {},
    handlePAPRBlur() { this.showUpDownButtons = false; },
    cancelProcessing() {
      this.processingModal.show = false;
      if (this.dpdEstimating) {
        clearTimeout(this.dpdPollingTimer);
        this.dpdEstimating = false;
        this.showSuccess('已取消 DPD 操作');
      }
    },
    confirmModalConfirm() { this.confirmModal.onConfirm?.(); this.confirmModal.show = false; },
    confirmModalCancel()  { this.confirmModal.show = false; },
    showSuccess(msg) {
      this.modalMessage = msg;
      this.isModalVisible = true;
      setTimeout(() => { this.isModalVisible = false; }, 2000);
    },
    showError(msg, details = '') { this.errorInfo = { visible: true, message: msg, details }; },
    hideErrorModal() { this.errorInfo.visible = false; },
    hideModal()      { this.isModalVisible = false; },
    retryLastOperation() {
      this.hideErrorModal();
      if (!this.lastOperation.type) return this.showError('没有可重试的操作');
      this.showSuccess('重试中...');
      this.lastOperation.type === 'get'
        ? WebSocketService.sendGetCommand(this.lastOperation.data)
        : WebSocketService.sendSetCommand(this.lastOperation.data);
    },

    /* ---------- 参数拉取 ---------- */
    fetchAllParameters() {
      const keys = [
        'exciter.exciterType',
        'digitalIqOutput.peakToAverageSuppressLevel',
        'digitalIqOutput.paprSuppressionEnabled',
        'exciter.rfOutputEnable', 'exciter.rfOutputFreq', 'exciter.rfOutputPower', 'exciter.rfPMEnable',
        'exciter.rfEnvelopeLevel', 'exciter.rfEnvelopeDC',
        'exciter.dpdCorrectionEnabled', 'exciter.dpdAlignStatus', 'exciter.dpdAlignResult',
        'exciter.delayValue',
        'modulation.currentDRMMode', 'modulation.spectrumBandwidth', 'modulation.sdcMode',
        'modulation.mscMode', 'modulation.mscProtectionLevelA', 'modulation.mscProtectionLevelB'
      ];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);
    }
  },

  /* ======================== 生命周期 ======================== */
  mounted() {
    this.initWebSocket();
    setTimeout(() => {
      if (this.wsConnected) {
        this.fetchAllParameters();
      } else {
        const unwatch = this.$watch('wsConnected', v => {
          if (v) { this.fetchAllParameters(); unwatch(); }
        });
      }
    }, 1000);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
    clearTimeout(this.dpdPollingTimer);
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
  overflow-y: auto;
}
.content {
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.connection-status {
  text-align: center;
  padding: 5px;
  margin-bottom: 15px;
  border-radius: 3px;
  background-color: #f8d7da;
  color: #721c24;
}
.connection-status.connected {
  background-color: #d4edda;
  color: #155724;
}
.columns {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.column {
  flex: 1;
  min-width: 300px;
}
.right-column.full-width {
  flex-basis: 100%;
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
  width: 40%;
}
.input-with-unit {
  display: flex;
  align-items: center;
}
.input-with-unit input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 5px;
  box-sizing: border-box;
}
.unit {
  color: #555;
  margin-left: 8px;
  white-space: nowrap;
}
button {
  background-color: #0056b3;
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
.blue-btn { background-color: #1890ff; }
.blue-btn:hover { background-color: #40a9ff; }
.orange-btn { background-color: #fa8c16; }
.orange-btn:hover { background-color: #ffa940; }
.green-btn { background-color: #52c41a; }
.green-btn:hover { background-color: #73d13d; }
.cancel-btn { background-color: #8c8c8c; }
.cancel-btn:hover { background-color: #666666; }
.custom-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  box-sizing: border-box;
}
.custom-select:no-arrow {
  appearance: none;
  background-image: none;
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
.error-modal {
  border-left: 5px solid #dc3545;
}
.error-modal h3 {
  color: #dc3545;
  margin-top: 0;
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
  width: 50px;
  height: 26px;
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
  border-radius: 26px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #1890ff;
}
input:checked + .slider:before {
  transform: translateX(24px);
}
</style>
<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">

        <!-- ==================== 调制输出 ==================== -->
        <h2>调制输出</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>DRM模式</td>
            <td>No Data</td>
          </tr>
          <tr>
            <td>频谱带宽</td>
            <td>No Data</td>
          </tr>
          <tr>
            <td>MSC模式</td>
            <td>No Data</td>
          </tr>
          <tr>
            <td>SDC模式</td>
            <td>No Data</td>
          </tr>
          <tr>
            <td>MSC保护等级A</td>
            <td>No Data</td>
          </tr>
          <tr>
            <td>MSC保护等级B</td>
            <td>No Data</td>
          </tr>
        </table>
        <button @click="showSuccess">刷新</button>
        <div v-if="isModalVisible" class="modal">
          <p>刷新成功！</p>
          <button @click="hideModal">关闭</button>
        </div>

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
            <td><button @click="estimateDPD" class="blue-btn">DPD参数估计</button></td>
          </tr>
          <tr>
            <td>估计结果</td>
            <td class="input-with-unit">
              <input type="text" v-model="dpdResult" readonly />
              <span class="unit">MHz</span>
            </td>
          </tr>
          <tr>
            <td>校正使能</td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="isCalibrationEnabled">
                <span class="slider"></span>
              </label>
            </td>
          </tr>
          <tr>
            <td>DPD参数复位</td>
            <td><button @click="resetDPD" class="orange-btn">DPD参数复位</button></td>
          </tr>
        </table>

        <!-- ==================== 幅相延时 ==================== -->
        <h3>幅相延时</h3>
        <!-- 将“延时参数估计”、“延时参数设置”、“延时参数复位”和“延时量”改为 2×2 表格布局 -->
        <table>
          <tr>
            <td>延时参数估计</td>
            <td>
              <!-- 同一行放三个按钮 -->
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

        <!-- 处理中弹窗 -->
        <div v-if="processingModal.show" class="modal">
          <p>{{ processingModal.message }}</p>
        </div>

        <!-- 确认弹窗（复位确认） -->
        <div v-if="confirmModal.show" class="modal">
          <p>{{ confirmModal.message }}</p>
          <button @click="confirmModalConfirm" class="blue-btn">确认</button>
          <button @click="confirmModalCancel">取消</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModulationOutput',
  data() {
    return {
      // 原有数据
      isModalVisible: false,
      isFrequencyConsistent: false,
      inputFrequency: 0,
      dpdResult: '',
      isCalibrationEnabled: false,
      processingModal: {
        show: false,
        message: ''
      },

      // 新增数据：幅相延时
      delayValue: '0.0',

      // 确认弹窗
      confirmModal: {
        show: false,
        message: '',
        onConfirm: null
      }
    };
  },
  methods: {
    // ==================== 原有方法 ====================
    showSuccess() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.isModalVisible = false;
      }, 1000);
    },
    hideModal() {
      this.isModalVisible = false;
    },
    toggleFrequency() {
      if (this.isFrequencyConsistent) {
        this.inputFrequency = 0;
      }
    },
    showProcessingModal(message) {
      this.processingModal = {
        show: true,
        message
      };
    },
    hideProcessingModal() {
      this.processingModal.show = false;
    },
    async estimateDPD() {
      this.showProcessingModal('参数估计中');
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.hideProcessingModal();

      this.showProcessingModal('估计成功');
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.hideProcessingModal();

      this.dpdResult = '5';
    },
    async resetDPD() {
      this.showProcessingModal('参数复位中');
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.hideProcessingModal();

      this.showProcessingModal('复位成功');
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.hideProcessingModal();

      this.dpdResult = '3';
    },

    // ==================== 新增：幅相延时 ====================
    async estimateDelay() {
      // 弹窗提示“延时参数估计中”，持续5秒
      this.showProcessingModal('延时参数估计中');
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.hideProcessingModal();

      // 提示“估计成功”，持续1秒
      this.showProcessingModal('估计成功');
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.hideProcessingModal();

      // 更新延时量到10.3
      this.delayValue = '10.3';
    },
    // “延时参数设置”按钮暂时无功能，所以未实现

    // 点击“延时参数复位”先弹出确认对话框
    tryResetDelay() {
      this.confirmModal = {
        show: true,
        message: '确定要复位延时参数吗？',
        onConfirm: this.resetDelay
      };
    },
    // 用户点击“确认”
    confirmModalConfirm() {
      if (this.confirmModal.onConfirm) {
        this.confirmModal.onConfirm();
      }
      this.confirmModal.show = false;
    },
    // 用户点击“取消”
    confirmModalCancel() {
      this.confirmModal.show = false;
    },
    // 真正执行“延时参数复位”
    async resetDelay() {
      this.showProcessingModal('延时参数复位中');
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.hideProcessingModal();

      this.showProcessingModal('复位成功');
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.hideProcessingModal();

      // 将延时量归零
      this.delayValue = '0.0';
    }
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

/* 原有按钮样式 */
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

/* 新增按钮样式 */
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

/* 弹窗 */
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

/* Switch样式 */
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
  transition: .4s;
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
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1890ff;
}

input:checked + .slider:before {
  transform: translateX(30px);
}

/* 输入框带单位样式 */
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

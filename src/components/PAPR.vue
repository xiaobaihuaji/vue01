<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>峰均比抑制（CFR）</h2>

        <!-- 峰均比抑制输入框 -->
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
                  @blur="handleInputBlur"
                />
                <span class="unit">dB</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- 应用按钮 -->
        <button @click="applyPAPR">应用</button>

        <!-- 弹窗提示 -->
        <div v-if="isModalVisible" class="modal">
          <p>{{ modalMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PAPR',
  data() {
    return {
      peakToAverageSuppressLevel: "7.0", // 默认值，字符串类型
      isModalVisible: false,  // 控制弹窗显示
      modalMessage: '',  // 弹窗信息
      isProcessing: false, // 防止重复点击
      originalValue: "7.0", // 保存原始值
    };
  },
  methods: {
    applyPAPR() {
      // 如果正在处理中，直接返回
      if (this.isProcessing) {
        return;
      }

      let value = parseFloat(this.peakToAverageSuppressLevel);
      
      // 检查值是否在范围内
      if (value < 7.0 || value > 15.0) {
        this.showModal("调整失败，范围为 7.0 - 15.0");
        setTimeout(() => {
          this.isModalVisible = false;
        }, 1000);
        return;
      }

      // 设置处理标志
      this.isProcessing = true;
      
      // 保存当前值作为原始值
      this.originalValue = this.peakToAverageSuppressLevel;
      
      // 显示应用中的弹窗
      this.showModal('应用中');
      
      // 模拟应用过程
      setTimeout(() => {
        this.showModal('应用成功');
        setTimeout(() => {
          this.isModalVisible = false;
          this.isProcessing = false;
        }, 1000);
      }, 3000);
    },
    
    showModal(message) {
      this.modalMessage = message;
      this.isModalVisible = true;
    },
    
    handleInputBlur() {
      let value = parseFloat(this.peakToAverageSuppressLevel);
      if (isNaN(value)) {
        this.peakToAverageSuppressLevel = this.originalValue; // 使用原始值
      } else {
        // 只格式化数字，不进行范围验证
        this.peakToAverageSuppressLevel = value.toFixed(1);
      }
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

h2 {
  text-align: center;
  margin-bottom: 30px;
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
  display: flex;
  align-items: center;
}

.input-with-buttons input {
  width: 100px;
  padding: 5px;
  margin-right: 10px;
}

.unit {
  color: #999;
}

button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
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
  color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}
</style>
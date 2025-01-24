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
                    v-model="paprValue" 
                    step="0.1"
                    placeholder="请输入峰均比"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  />
                  <span class="unit">dB</span>
                  <div v-if="showUpDownButtons" class="up-down-buttons">
                    <!-- <button @click="incrementPAPR">↑</button>
                    <button @click="decrementPAPR">↓</button> -->
                  </div>
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
        paprValue: 7.0,  // 默认峰均比值
        isModalVisible: false,  // 控制弹窗显示
        modalMessage: '',  // 弹窗信息
        showUpDownButtons: false, // 控制上下按钮的显示
      };
    },
    methods: {
      applyPAPR() {
        // 显示应用中的弹窗
        this.showModal('应用中');
        setTimeout(() => {
          // 显示应用成功的弹窗
          this.showModal('应用成功');
          // 三秒后自动关闭弹窗
          setTimeout(() => {
            this.isModalVisible = false;
          }, 1000);
        }, 3000);
      },
      showModal(message) {
        this.modalMessage = message;
        this.isModalVisible = true;
      },
      incrementPAPR() {
        this.paprValue = (parseFloat(this.paprValue) + 0.1).toFixed(1);  // 增加0.1
      },
      decrementPAPR() {
        if (this.paprValue > 0) {
          this.paprValue = (parseFloat(this.paprValue) - 0.1).toFixed(1);  // 减少0.1
        }
      },
    },
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
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .input-with-buttons {
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
  
  .modal button {
    margin-top: 10px;
    background-color: white;
    color: #003366;
  }
  
  .modal button:hover {
    background-color: #f0f0f0;
  }
  </style>
  
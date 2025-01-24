<template>
    <div class="content-wrapper">
      <div class="content">
        <div class="content-container">
          <h2>射频输出</h2>
  
          <!-- 射频输出设置 -->
          <table>
            <tr>
              <th>项目</th>
              <th>值/设置</th>
            </tr>
            <tr>
              <td>输出使能</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="outputEnabled" />
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
                    v-model="centerFrequency" 
                    step="0.001"
                    placeholder="请输入中心频率"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  />
                  <span class="unit">MHz</span>
                  <div v-if="showUpDownButtons" class="up-down-buttons">
                    <!-- <button @click="incrementFrequency">↑</button>
                    <button @click="decrementFrequency">↓</button> -->
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>输出功率</td>
              <td class="input-with-unit">
                <div class="input-with-buttons">
                  <input 
                    type="number" 
                    v-model="outputPower" 
                    step="0.1"
                    placeholder="请输入输出功率"
                    @focus="showUpDownButtons = true"
                    @blur="showUpDownButtons = false"
                  />
                  <span class="unit">dB</span>
                  <div v-if="showUpDownButtons" class="up-down-buttons">
                    <!-- <button @click="incrementPower">↑</button>
                    <button @click="decrementPower">↓</button> -->
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>调频使能</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="fmEnabled" />
                  <span class="slider"></span>
                </label>
              </td>
            </tr>
            <tr>
              <td>调幅使能</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="amEnabled" />
                  <span class="slider"></span>
                </label>
              </td>
            </tr>
          </table>
  
          <!-- 应用按钮 -->
          <button @click="applyRFOutput">应用</button>
  
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
    name: 'RFOutput',
    data() {
      return {
        outputEnabled: false, // 输出使能
        centerFrequency: 15.120, // 默认中心频率
        outputPower: -8.4, // 默认输出功率
        fmEnabled: false, // 调频使能
        amEnabled: false, // 调幅使能
        isModalVisible: false, // 控制弹窗显示
        modalMessage: '', // 弹窗信息
        showUpDownButtons: false, // 控制上下按钮显示
      };
    },
    methods: {
      // 应用按钮点击后弹窗提示
      applyRFOutput() {
        this.showModal('应用中');
        setTimeout(() => {
          this.showModal('应用成功');
          setTimeout(() => {
            this.isModalVisible = false;
          }, 1000);
        }, 3000);
      },
      // 弹窗显示函数
      showModal(message) {
        this.modalMessage = message;
        this.isModalVisible = true;
      },
      // 中心频率增减方法
      incrementFrequency() {
        this.centerFrequency = (parseFloat(this.centerFrequency) + 0.001).toFixed(3);  // 增加0.001
      },
      decrementFrequency() {
        this.centerFrequency = (parseFloat(this.centerFrequency) - 0.001).toFixed(3);  // 减少0.001
      },
      // 输出功率增减方法
      incrementPower() {
        this.outputPower = (parseFloat(this.outputPower) + 0.1).toFixed(1);  // 增加0.1
      },
      decrementPower() {
        this.outputPower = (parseFloat(this.outputPower) - 0.1).toFixed(1);  // 减少0.1
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
    width: 120px;
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
  </style>
  
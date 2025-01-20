<template>
    <div class="content-wrapper">
      <div class="content">
        <div class="content-container">
          <h2>复用流输入</h2>
          
          <!-- 表格 -->
          <table>
            <tr>
              <th>项目</th>
              <th>值/设置</th>
            </tr>
            <tr>
              <td>状态</td>
              <td>No Data</td>
            </tr>
          </table>
          
          <!-- 应用按钮 -->
          <div class="button-container">
            <button @click="showApplySuccess">应用</button>
            <button @click="showRefreshSuccess">刷新</button>
          </div>
  
          <!-- 应用成功弹窗提示 -->
          <div v-if="isApplyModalVisible" class="modal">
            <p>应用成功！</p>
            <button @click="hideApplyModal">关闭</button>
          </div>
  
          <!-- 刷新成功弹窗提示 -->
          <div v-if="isRefreshModalVisible" class="modal">
            <p>刷新成功！</p>
            <button @click="hideRefreshModal">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MultiplexingInput',
    data() {
      return {
        isApplyModalVisible: false,
        isRefreshModalVisible: false
      }
    },
    methods: {
      // 显示应用成功弹窗
      showApplySuccess() {
        this.isApplyModalVisible = true;
      },
      // 隐藏应用成功弹窗
      hideApplyModal() {
        this.isApplyModalVisible = false;
      },
      // 显示刷新成功弹窗
      showRefreshSuccess() {
        this.isRefreshModalVisible = true;
      },
      // 隐藏刷新成功弹窗
      hideRefreshModal() {
        this.isRefreshModalVisible = false;
      }
    }
  }
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
  
  .button-container {
    margin-bottom: 20px;
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
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
            <td>输入接口设置</td>
            <td>
              <select v-model="inputInterfaceSetting">
                <option value="ETH1">ETH1</option>
                <option value="ETH2">ETH2</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>当前输入端口</td>
            <td>
              <select v-model="currentInputPort">
                <option value="ETH1">ETH1</option>
                <option value="ETH2">ETH2</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>来源IP</td>
            <td>{{ sourceIP }}</td>
          </tr>
          <tr>
            <td>输入帧计数器</td>
            <td>{{ inputFrameCounter }}</td>
          </tr>
          <tr>
            <td>错误帧计数器</td>
            <td>{{ errorFrameCounter }}</td>
          </tr>
          <tr>
            <td>PFT使能状态</td>
            <td>
              {{ pftStatus }}
            </td>
          </tr>
          <tr>
            <td>插入空帧计数器</td>
            <td>{{ nullFrameCounter }}</td>
          </tr>
          <tr>
            <td>已产生的I/Q帧计数器</td>
            <td>{{ iqFrameCounter }}</td>
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
      // 复用流输入的各项数据
      inputInterfaceSetting: 'ETH1', // 输入接口设置
      currentInputPort: 'ETH1', // 当前输入端口
      sourceIP: '192.168.1.1', // 来源IP
      inputFrameCounter: 1024, // 输入帧计数器
      errorFrameCounter: 3, // 错误帧计数器
      pftStatus: 'FALSE', // PFT使能状态
      nullFrameCounter: 10, // 插入空帧计数器
      iqFrameCounter: 512, // 已产生的I/Q帧计数器
      pftStatus: 'FALSE', // PFT使能状态

      // 控制弹窗显示
      isApplyModalVisible: false,
      isRefreshModalVisible: false,
    };
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

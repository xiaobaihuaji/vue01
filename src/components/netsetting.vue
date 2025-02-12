<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <!-- 以太网1设置 -->
        <h2>以太网1设置</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>IP地址</td>
            <td>
              <input type="text" v-model="ethernetIP1" placeholder="请输入IP地址">
            </td>
          </tr>
          <tr>
            <td>子网掩码</td>
            <td>
              <input type="text" v-model="subnetMask1" placeholder="请输入子网掩码">
            </td>
          </tr>
          <tr>
            <td>网关地址</td>
            <td>
              <input type="text" v-model="gatewayAddress1" placeholder="请输入网关地址">
            </td>
          </tr>
          <tr>
            <td>组播IP组</td>
            <td>
              <input type="text" v-model="multicastIPGroup1" placeholder="请输入组播IP组">
              <span class="note">范围为：224.0.0.0到239.255.255.255</span>
            </td>
          </tr>
          <tr>
            <td>MDI输入端口</td>
            <td>
              <input type="number" v-model.number="mdiInputPort1" placeholder="请输入MDI输入端口">
              <span class="note">范围为：0-65535</span>
            </td>
          </tr>
          <tr>
            <td>MAC地址</td>
            <td>
              <input type="text" v-model="macAddress1" disabled>
            </td>
          </tr>
        </table>

        <!-- 以太网2设置 -->
        <h2>以太网2设置</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>IP地址</td>
            <td>
              <input type="text" v-model="ethernetIP2" placeholder="请输入IP地址">
            </td>
          </tr>
          <tr>
            <td>子网掩码</td>
            <td>
              <input type="text" v-model="subnetMask2" placeholder="请输入子网掩码">
            </td>
          </tr>
          <tr>
            <td>网关地址</td>
            <td>
              <input type="text" v-model="gatewayAddress2" placeholder="请输入网关地址">
            </td>
          </tr>
          <tr>
            <td>组播IP组</td>
            <td>
              <input type="text" v-model="multicastIPGroup2" placeholder="请输入组播IP组">
              <span class="note">范围为：224.0.0.0到239.255.255.255</span>
            </td>
          </tr>
          <tr>
            <td>MDI输入端口</td>
            <td>
              <input type="number" v-model.number="mdiInputPort2" placeholder="请输入MDI输入端口">
              <span class="note">范围为：0-65535</span>
            </td>
          </tr>
          <tr>
            <td>MAC地址</td>
            <td>
              <input type="text" v-model="macAddress2" disabled>
            </td>
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
  name: 'NetSetting',
  data() {
    return {
      // 以太网1设置
      ethernetIP1: '',
      subnetMask1: '',
      gatewayAddress1: '',
      multicastIPGroup1: '',
      mdiInputPort1: '',
      macAddress1: '00:00:00:00:00:00', // 示例MAC地址，实际应从设备获取

      // 以太网2设置
      ethernetIP2: '',
      subnetMask2: '',
      gatewayAddress2: '',
      multicastIPGroup2: '',
      mdiInputPort2: '',
      macAddress2: '00:00:00:00:00:00', // 示例MAC地址，实际应从设备获取

      // 弹窗控制
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
  },
  mounted() {
    // 这里可以添加获取MAC地址的逻辑
    // 例如通过API调用获取设备MAC地址
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

input {
  padding: 5px;
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

input:disabled {
  background-color: #f4f4f4;
  cursor: not-allowed;
}

.note {
  margin-left: 10px;
  color: #666;
  font-size: 0.9em;
}
</style>
<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>状态概览</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>工作状态</td>
            <td>{{ systemStatus }}</td>
          </tr>
          <tr>
            <td>主板温度</td>
            <td>{{ motherboardTemperature }}℃</td>
          </tr>
          <tr>
            <td>软件版本</td>
            <td>{{ softwareVersion }}</td>
          </tr>
          <tr>
            <td>序列号</td>
            <td>{{ serialNumber }}</td>
          </tr>
          <tr>
            <td>产品型号</td>
            <td>{{ productModel }}</td>
          </tr>
          <tr>
            <td>固件升级</td>
            <td>
              <button @click="startFirmwareUpgrade">固件升级</button>
            </td>
          </tr>
          <tr>
            <td>系统日期</td>
            <td class="system-time-date">
              <input type="text" v-model="systemDate" placeholder="YYYY-MM-DD">
              <button @click="applySystemDate">应用系统日期</button>
            </td>
          </tr>
          <tr>
            <td>系统时间</td>
            <td class="system-time-date">
              <input type="text" v-model="systemTime" placeholder="HH:MM:SS">
              <button @click="applySystemTime">应用系统时间</button>
            </td>
          </tr>
        </table>

        <!-- 刷新按钮 -->
        <button @click="showSuccess">应用</button>

        <!-- 刷新成功弹窗 -->
        <div v-if="isModalVisible" class="modal">
          <p>应用成功！</p>
          <button @click="hideModal">关闭</button>
        </div>

        <!-- 固件升级弹窗 -->
        <div v-if="isUpgrading" class="modal">
          <p>固件升级中</p>
        </div>

        <!-- 升级成功弹窗 -->
        <div v-if="upgradeSuccess" class="modal">
          <p>升级成功！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Content',
  data() {
    return {
      // 系统状态数据
      systemStatus: 'OK',
      motherboardTemperature: 37.6,
      softwareVersion: 'V5',
      serialNumber: 'ECDAVNB666',
      productModel: 'DRM OF ECDAV',
      systemDate: '',
      systemTime: '',

      // 弹窗控制
      isModalVisible: false,
      isUpgrading: false,
      upgradeSuccess: false
    }
  },
  methods: {
    // 刷新相关方法
    showSuccess() {
      this.isModalVisible = true
    },
    hideModal() {
      this.isModalVisible = false
    },

    // 固件升级相关方法
    startFirmwareUpgrade() {
      this.isUpgrading = true
      // 5秒后显示升级成功
      setTimeout(() => {
        this.isUpgrading = false
        this.upgradeSuccess = true
        // 1秒后关闭升级成功提示
        setTimeout(() => {
          this.upgradeSuccess = false
        }, 1000)
      }, 5000)
    },

    // 系统日期时间相关方法
    applySystemDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      this.systemDate = `${year}-${month}-${day}`
    },

    applySystemTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.systemTime = `${hours}:${minutes}:${seconds}`
    }
  },
  mounted() {
    // 初始化时获取系统时间日期
    this.applySystemDate()
    this.applySystemTime()
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

.system-time-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

input {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 150px;
}
</style>
<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>系统设置</h2>
        
        <!-- 修改密码部分 -->
        <div class="section">
          <h3>修改登录密码</h3>
          <table>
            <tr>
              <td>当前密码：</td>
              <td>
                <input
                  type="password"
                  v-model="currentPassword"
                  placeholder="请输入当前密码"
                >
              </td>
            </tr>
            <tr>
              <td>新密码：</td>
              <td>
                <input
                  type="password"
                  v-model="newPassword"
                  placeholder="请输入新密码"
                >
              </td>
            </tr>
            <tr>
              <td>重复新密码：</td>
              <td>
                <input
                  type="password"
                  v-model="confirmPassword"
                  placeholder="请再次输入新密码"
                >
              </td>
            </tr>
          </table>
          <div class="button-container">
            <button
              @click="changePassword"
              :disabled="!isPasswordFormValid"
              :class="{ disabled: !isPasswordFormValid }"
            >
              应用
            </button>
          </div>
          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
        </div>

        <!-- 日期时间设置部分 -->
        <div class="section">
          <h3>日期/时间设置</h3>
          <table>
            <tr>
              <td>日期：</td>
              <td>
                <input type="text" v-model="date" placeholder="YYYY-MM-DD">
              </td>
            </tr>
            <tr>
              <td>时间：</td>
              <td>
                <input type="text" v-model="time" placeholder="HH:MM:SS">
              </td>
            </tr>
          </table>
          <div class="button-container">
            <button @click="getSystemTime" class="system-time-btn">
              从浏览器自动设置
            </button>
            <button
              @click="saveDateTime"
              :disabled="!isDateTimeFormValid"
              :class="{ disabled: !isDateTimeFormValid }"
            >
              保存
            </button>
          </div>
        </div>

        <!-- 成功提示弹窗 -->
        <div v-if="showSuccessModal" class="modal">
          <p>{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemsettingContent',
  data() {
    return {
      // 密码相关数据
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      storedPassword: '',        // 从 localStorage 读取的当前密码

      // 日期时间相关数据
      date: '',
      time: '',

      // 弹窗 & 错误
      showSuccessModal: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  computed: {
    isPasswordFormValid() {
      return this.currentPassword && this.newPassword && this.confirmPassword
    },
    isDateTimeFormValid() {
      return this.date && this.time
    }
  },
  methods: {
    // 修改密码
    changePassword() {
      this.errorMessage = ''
      // 验证当前密码
      if (this.currentPassword !== this.storedPassword) {
        this.errorMessage = '当前密码错误'
        return
      }
      // 验证新密码一致性
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = '两次输入的新密码不一致'
        return
      }
      // 更新本地存储
      localStorage.setItem('loginPassword', this.newPassword)
      this.storedPassword = this.newPassword

      // 清空表单并提示
      this.currentPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
      this.showSuccessMessage('密码修改成功！')
    },

    // 获取系统时间
    getSystemTime() {
      const now = new Date()
      this.date = now.toISOString().slice(0, 10)
      this.time = now.toTimeString().slice(0, 8)
    },

    // 保存日期时间
    saveDateTime() {
      this.showSuccessMessage('时间设置成功！')
    },

    // 显示成功提示
    showSuccessMessage(message) {
      this.successMessage = message
      this.showSuccessModal = true
      setTimeout(() => {
        this.showSuccessModal = false
        this.successMessage = ''
      }, 1000)
    }
  },
  mounted() {
    // 初始化 storedPassword：优先取 localStorage，否则默认 '666666'
    this.storedPassword = localStorage.getItem('loginPassword') || '666666'
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
.section {
  margin-bottom: 40px;
}
h2 {
  margin-bottom: 30px;
}
h3 {
  margin-bottom: 20px;
}
table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}
td {
  padding: 10px;
  vertical-align: middle;
}
td:first-child {
  width: 120px;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
}
.button-container {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}
button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
}
button.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
button:hover:not(.disabled) {
  background-color: #004488;
}
.system-time-btn {
  background-color: #4CAF50;
}
.system-time-btn:hover {
  background-color: #45a049;
}
/* 错误提示 */
.error-msg {
  margin-top: 10px;
  color: red;
  font-size: 0.9em;
}
/* 成功弹窗 */
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
</style>

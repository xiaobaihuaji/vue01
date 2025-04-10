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
                <input type="password" v-model="currentPassword" placeholder="请输入当前密码">
              </td>
            </tr>
            <tr>
              <td>新密码：</td>
              <td>
                <input type="password" v-model="newPassword" placeholder="请输入新密码">
              </td>
            </tr>
            <tr>
              <td>重复新密码：</td>
              <td>
                <input type="password" v-model="confirmPassword" placeholder="请再次输入新密码">
              </td>
            </tr>
          </table>
          <div class="button-container">
            <button 
              @click="changePassword"
              :disabled="!isPasswordFormValid"
              :class="{ 'disabled': !isPasswordFormValid }"
            >
              应用
            </button>
          </div>
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
            <button 
              @click="getSystemTime"
              class="system-time-btn"
            >
              从浏览器自动设置
            </button>
            <button 
              @click="saveDateTime"
              :disabled="!isDateTimeFormValid"
              :class="{ 'disabled': !isDateTimeFormValid }"
            >
              保存
            </button>
          </div>
        </div>

        <!-- 成功提示弹窗 -->
        <div v-if="showSuccessModal" class="modal">
          <p>{{ successMessage }}</p>
        </div>

        <!-- 添加点击事件跳转回到状态界面
        <div class="back-link">
          <p @click="$emit('changePage', 'status')">返回状态概览</p>
        </div> -->
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
      
      // 日期时间相关数据
      date: '',
      time: '',
      
      // 弹窗相关数据
      showSuccessModal: false,
      successMessage: ''
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
      if (!this.isPasswordFormValid) return
      
      this.showSuccessMessage('密码修改成功！')
      this.currentPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
    },
    
    // 获取系统时间
    getSystemTime() {
      const now = new Date()
      
      // 设置日期 YYYY-MM-DD
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      this.date = `${year}-${month}-${day}`
      
      // 设置时间 HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.time = `${hours}:${minutes}:${seconds}`
    },
    
    // 保存日期时间
    saveDateTime() {
      if (!this.isDateTimeFormValid) return
      
      this.showSuccessMessage('时间设置成功！')
    },
    
    // 显示成功提示
    showSuccessMessage(message) {
      this.successMessage = message
      this.showSuccessModal = true
      
      // 1秒后自动关闭
      setTimeout(() => {
        this.showSuccessModal = false
        this.successMessage = ''
      }, 1000)
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

button:hover:not(.disabled) {
  background-color: #004488;
}

.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.system-time-btn {
  background-color: #4CAF50;
}

.system-time-btn:hover {
  background-color: #45a049;
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
  z-index: 1000;
}

.back-link {
  margin-top: 20px;
  color: #003366;
  cursor: pointer;
  text-decoration: underline;
}
</style>

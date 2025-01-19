<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>系统设置</h2>

        <!-- 修改登录密码 -->
        <div class="form-section">
          <h3>修改登录密码</h3>
          <table>
            <tr>
              <td>当前密码</td>
              <td><input v-model="currentPassword" type="password" /></td>
            </tr>
            <tr>
              <td>新密码</td>
              <td><input v-model="newPassword" type="password" /></td>
            </tr>
            <tr>
              <td>重复新密码</td>
              <td><input v-model="confirmNewPassword" type="password" /></td>
            </tr>
          </table>
          <button 
            :disabled="!isPasswordFormValid"
            @click="showPasswordSuccess"
            class="apply-btn"
          >
            应用
          </button>
        </div>

        <!-- 日期/时间设置 -->
        <div class="form-section">
          <h3>日期/时间设置</h3>
          <table>
            <tr>
              <td>日期</td>
              <td><input v-model="date" type="text" readonly /></td>
            </tr>
            <tr>
              <td>时间</td>
              <td><input v-model="time" type="text" readonly /></td>
            </tr>
          </table>
          <button @click="setDateTime" class="auto-apply-btn">
            从浏览器自动设置
          </button>
          <button 
            :disabled="!isDateTimeFormValid"
            @click="showDateTimeSuccess"
            class="apply-btn"
          >
            应用
          </button>
        </div>

        <!-- 弹窗提示 -->
        <div v-if="isModalVisible" class="modal">
          <p>{{ modalMessage }}</p>
          <button @click="hideModal">关闭</button>
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
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      date: '',
      time: '',
      isModalVisible: false,
      modalMessage: '',
    };
  },
  computed: {
    // 判断密码表单是否填写完整
    isPasswordFormValid() {
      return (
        this.currentPassword !== '' &&
        this.newPassword !== '' &&
        this.confirmNewPassword !== '' &&
        this.newPassword === this.confirmNewPassword
      );
    },
    // 判断日期和时间表单是否填写完整
    isDateTimeFormValid() {
      return this.date !== '' && this.time !== '';
    }
  },
  methods: {
    showPasswordSuccess() {
      if (this.isPasswordFormValid) {
        this.modalMessage = '修改成功！';
        this.showModal();
        this.resetPasswordForm();
      }
    },
    showDateTimeSuccess() {
      if (this.isDateTimeFormValid) {
        this.modalMessage = '修改成功！';
        this.showModal();
      }
    },
    showModal() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.hideModal();
      }, 1000); // 1秒后关闭
    },
    hideModal() {
      this.isModalVisible = false;
    },
    setDateTime() {
      const now = new Date();
      this.date = now.toLocaleDateString(); // 设置日期为当前系统日期
      this.time = now.toLocaleTimeString(); // 设置时间为当前系统时间
    },
    resetPasswordForm() {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
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

.form-section {
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
}

form input {
  padding: 8px;
  margin: 5px 0;
  width: 100%;
}

button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #004488;
}

.apply-btn:disabled,
.auto-apply-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.auto-apply-btn {
  margin-top: 10px;
  background-color: #42b983;
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

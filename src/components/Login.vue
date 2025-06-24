<template>
  <div class="login-overlay">
    <div class="login-box">
      <h2>请登录</h2>
      <!-- 使用 form 捕获回车事件 -->
      <form @submit.prevent="login">
        <div class="field">
          <label>用户名</label>
          <input
            v-model="username"
            placeholder="请输入账号"
            autocomplete="username"
          />
        </div>
        <div class="field">
          <label>密码</label>
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <button type="submit" :disabled="!canLogin">
          登录
        </button>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      error: ''
    }
  },
  computed: {
    canLogin() {
      return this.username && this.password
    }
  },
  methods: {
    login() {
      this.error = ''
      const stored = localStorage.getItem('loginPassword') || '666666'
      if (this.username === 'admin' && this.password === stored) {
        this.$emit('login-success')
      } else {
        this.error = '用户名或密码错误'
      }
    }
  }
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.login-box {
  background: white;
  padding: 30px;
  border-radius: 6px;
  width: 300px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.field {
  margin-bottom: 15px;
}
.field label {
  display: block;
  margin-bottom: 5px;
}
.field input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  background: #003366;
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.error {
  margin-top: 10px;
  color: red;
  font-size: 0.9em;
}
</style>

<template>
    <div class="login-wrapper">
      <div class="login-container">
        <h2>登录</h2>
        <label>用户名：</label>
        <input v-model="username" placeholder="用户名" />
        <label>密码：</label>
        <input v-model="password" placeholder="密码" type="password" />
        <button @click="handleLogin">登录</button>
        <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>
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
        errorMsg: ''
      }
    },
    mounted() {
      // 若本地没有存过默认账号/密码，则初始化一下
      const user = localStorage.getItem('user') || 'ECDAV'
      const pass = localStorage.getItem('password') || '666666'
      localStorage.setItem('user', user)
      localStorage.setItem('password', pass)
    },
    methods: {
      handleLogin() {
        this.errorMsg = ''
        // 取出本地存储的账号/密码
        const storedUser = localStorage.getItem('user')
        const storedPass = localStorage.getItem('password')
  
        // 比对
        if (this.username === storedUser && this.password === storedPass) {
          // 登录成功，跳转到系统设置
          this.$router.push('/systemSetting')
        } else {
          this.errorMsg = '用户名或密码错误'
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .login-wrapper {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #f4f4f4;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .login-container {
    width: 300px;
    background-color: #ffffff;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    text-align: left;
  }
  
  .login-container h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .login-container label {
    display: block;
    margin-top: 10px;
  }
  
  .login-container input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
  
  button {
    width: 100%;
    margin-top: 20px;
    background-color: #003366;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 3px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #004488;
  }
  
  .error-message {
    color: red;
    margin-top: 10px;
    text-align: center;
  }
  </style>
  
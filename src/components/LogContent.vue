<template>
    <div class="content-wrapper">
      <div class="content">
        <div class="content-container">
          <h2>日志</h2>
          <p>当前日志条数: {{ logs.length }}</p>
          
          <!-- 输入框 -->
          <div class="log-form">
            <input v-model="newEvent" type="text" placeholder="事件" />
            <input v-model="newCategory" type="text" placeholder="分类" />
            <input v-model="newTime" type="text" placeholder="时间" readonly />
            <button @click="setCurrentTime">获取当前时间</button>
            <input v-model="newDescription" type="text" placeholder="描述" />
            <button @click="addLog">确定</button>
          </div>
  
          <!-- 日志列表 -->
          <table>
            <thead>
              <tr>
                <th>事件</th>
                <th>分类</th>
                <th>时间</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in pagedLogs" :key="index">
                <td>{{ log.event }}</td>
                <td>{{ log.category }}</td>
                <td>{{ log.time }}</td>
                <td>{{ log.description }}</td>
                <td><button @click="deleteLog(index)">删除</button></td>
              </tr>
            </tbody>
          </table>
  
          <!-- 分页 -->
          <div class="pagination">
            <button @click="changePage('prev')" :disabled="currentPage === 1">←</button>
            <span>{{ currentPage }}</span>
            <button @click="changePage('next')" :disabled="currentPage === totalPages">→</button>
          </div>
  
          <button @click="showSuccess">刷新</button>
          <div v-if="isModalVisible" class="modal">
            <p>刷新成功！</p>
            <button @click="hideModal">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LogContent',
    data() {
      return {
        newEvent: '',
        newCategory: '',
        newTime: '',
        newDescription: '',
        logs: [], // 日志数组
        currentPage: 1, // 当前页码
        logsPerPage: 5, // 每页日志条数
        isModalVisible: false,
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(this.logs.length / this.logsPerPage);
      },
      pagedLogs() {
        const start = (this.currentPage - 1) * this.logsPerPage;
        const end = start + this.logsPerPage;
        return this.logs.slice(start, end);
      }
    },
    methods: {
      showSuccess() {
        this.isModalVisible = true;
      },
      hideModal() {
        this.isModalVisible = false;
      },
      setCurrentTime() {
        const now = new Date();
        this.newTime = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      },
      addLog() {
        if (!this.newEvent || !this.newCategory || !this.newDescription || !this.newTime) {
          alert('请填写完整信息');
          return;
        }
        const newLog = {
          event: this.newEvent,
          category: this.newCategory,
          time: this.newTime,
          description: this.newDescription,
        };
        this.logs.push(newLog);
        this.newEvent = '';
        this.newCategory = '';
        this.newTime = '';
        this.newDescription = '';
      },
      deleteLog(index) {
        this.logs.splice(index, 1);
      },
      changePage(direction) {
        if (direction === 'prev' && this.currentPage > 1) {
          this.currentPage--;
        } else if (direction === 'next' && this.currentPage < this.totalPages) {
          this.currentPage++;
        }
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
  
  .log-form {
    margin-bottom: 20px;
  }
  
  .log-form input {
    margin: 5px 0;
    padding: 8px;
    width: 45%;
  }
  
  .log-form button {
    padding: 8px 16px;
    background-color: #003366;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .log-form button:hover {
    background-color: #004488;
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
  
  .pagination {
    margin: 10px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .pagination button {
    padding: 5px 10px;
    background-color: #003366;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .pagination span {
    margin: 0 10px;
    font-size: 16px;
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
  
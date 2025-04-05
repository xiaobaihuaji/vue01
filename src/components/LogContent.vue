<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <!-- WebSocket连接状态 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <h2>日志</h2>
        <p>当前日志条数: {{ logs.length }}</p>
        
        <!-- 输入框
        <div class="log-form">
          <input v-model="newEvent" type="text" placeholder="事件" />
          <input v-model="newCategory" type="text" placeholder="分类" />
          <input v-model="newTime" type="text" placeholder="时间" readonly />
          <button @click="setCurrentTime">获取当前时间</button>
          <input v-model="newDescription" type="text" placeholder="描述" />
          <button @click="addLog">确定</button>
        </div> -->

        <!-- 日志列表 -->
        <table>
          <thead>
            <tr>
              <th>事件</th>
              <th>分类</th>
              <th>时间</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in pagedLogs" :key="index">
              <td>{{ log.event }}</td>
              <td>{{ log.category }}</td>
              <td>{{ log.time }}</td>
              <td>{{ log.description }}</td>
              <td>
                <button @click="deleteLog(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="pagination">
          <button @click="changePage('prev')" :disabled="currentPage === 1">←</button>
          <span>{{ currentPage }}</span>
          <button @click="changePage('next')" :disabled="currentPage === totalPages">→</button>
        </div>

        <!-- 刷新按钮 -->
        <button @click="refreshLogs">刷新</button>

        <!-- 刷新成功弹窗 -->
        <div v-if="isModalVisible" class="modal">
          <p>刷新成功！</p>
          <button @click="hideModal">关闭</button>
        </div>

        <!-- 错误提示弹窗 -->
        <div v-if="errorInfo.visible" class="modal error-modal">
          <h3>错误</h3>
          <p>{{ errorInfo.message }}</p>
          <div v-if="errorInfo.details" class="error-details">{{ errorInfo.details }}</div>
          <div class="modal-buttons">
            <button @click="hideErrorModal">关闭</button>
            <button @click="retryLastOperation">重试</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WebSocketService from '@/store/websocket';

export default {
  name: 'LogContent',
  data() {
    return {
      // WebSocket连接状态
      wsConnected: false,

      // 日志相关
      logs: [],           // 日志数组（从后端获取）
      newEvent: '',
      newCategory: '',
      newTime: '',
      newDescription: '',

      // 分页
      currentPage: 1,     // 当前页码
      logsPerPage: 5,     // 每页日志条数

      // 刷新成功弹窗
      isModalVisible: false,

      // 错误信息（参考 content.vue 逻辑）
      errorInfo: {
        visible: false,
        message: '',
        details: ''
      },

      // 记录上次操作（用于重试）
      lastOperation: {
        type: '',
        data: null
      }
    };
  },
  computed: {
    // 计算总页数
    totalPages() {
      return Math.ceil(this.logs.length / this.logsPerPage);
    },
    // 计算当前页应显示的日志
    pagedLogs() {
      const start = (this.currentPage - 1) * this.logsPerPage;
      const end = start + this.logsPerPage;
      return this.logs.slice(start, end);
    }
  },
  methods: {
    //--------------------------------------
    //         WebSocket相关方法
    //--------------------------------------

    // 初始化WebSocket连接
    initWebSocket() {
      WebSocketService.connect();
      // 注册消息处理回调
      WebSocketService.onMessage(this.handleWebSocketMessage);
      // 监听WebSocket连接状态
      this.checkConnectionStatus();
    },

    // 周期性检测WebSocket连接状态
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => {
        this.checkConnectionStatus();
      }, 2000);
    },

    // 处理WebSocket消息
    handleWebSocketMessage(data) {
      console.log('收到WebSocket消息:', data);

      // 如果有错误属性，显示错误
      if (data && data.error === true) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }

      // 如果数据是字符串，尝试解析
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('无法解析服务器响应:', e);
          this.showError('无法解析服务器响应', data);
          return;
        }
      }

      // 如果有params字段，则逐项处理
      if (data && data.params) {
        data.params.forEach(param => {
          if (param.result === 'success') {
            // 根据key更新UI状态
            this.updateParameterValue(param.key, param.value);
          } else {
            console.error(`参数 ${param.key} 获取失败: ${param.error || '未知错误'}`);
            this.showError(`参数 ${param.key} 获取失败`, param.error || '未知错误');
          }
        });
      } else if (data) {
        // 兼容旧的键值对格式
        Object.keys(data).forEach(key => {
          this.updateParameterValue(key, data[key]);
        });
      }
    },

    // 根据参数名更新对应的值
    updateParameterValue(key, value) {
      // 当key === 'log' 时，将后端传回的日志数据更新到 logs
      if (key === 'log') {
        // 假设后端返回的 value 是一个数组 [{ event, category, time, description }, ...]
        this.logs = Array.isArray(value) ? value : [];
      } else {
        console.log(`未处理的参数: ${key} = ${value}`);
      }
    },

    //--------------------------------------
    //         日志相关方法
    //--------------------------------------

    // 获取当前时间
    setCurrentTime() {
      const now = new Date();
      this.newTime = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    },

    // 添加本地日志（示例功能）
    addLog() {
      if (!this.newEvent || !this.newCategory || !this.newDescription || !this.newTime) {
        alert('请填写完整信息');
        return;
      }
      const newLog = {
        event: this.newEvent,
        category: this.newCategory,
        time: this.newTime,
        description: this.newDescription
      };
      this.logs.push(newLog);

      // 清空输入框
      this.newEvent = '';
      this.newCategory = '';
      this.newTime = '';
      this.newDescription = '';
    },

    // 删除本地日志（示例功能）
    deleteLog(index) {
      this.logs.splice(index, 1);
    },

    // 分页切换
    changePage(direction) {
      if (direction === 'prev' && this.currentPage > 1) {
        this.currentPage--;
      } else if (direction === 'next' && this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    //--------------------------------------
    //         刷新日志
    //--------------------------------------

    // 发送get命令，请求后端返回日志
    refreshLogs() {
      // 日志key是 "log"
      const keys = ['log'];

      // 保存操作以便重试
      this.lastOperation = {
        type: 'get',
        data: keys
      };

      // 发送get命令
      WebSocketService.sendGetCommand(keys);
      this.showSuccess();
    },

    // 显示刷新成功弹窗
    showSuccess() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.hideModal();
      }, 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },

    //--------------------------------------
    //         错误处理相关
    //--------------------------------------

    // 显示错误信息
    showError(message, details = '') {
      this.errorInfo = {
        visible: true,
        message: message,
        details: details
      };
    },

    // 隐藏错误提示
    hideErrorModal() {
      this.errorInfo.visible = false;
    },

    // 重试上次操作
    retryLastOperation() {
      if (this.lastOperation.type && this.lastOperation.data) {
        if (this.lastOperation.type === 'get') {
          WebSocketService.sendGetCommand(this.lastOperation.data);
        } else if (this.lastOperation.type === 'set') {
          WebSocketService.sendSetCommand(this.lastOperation.data);
        }
      }
      this.hideErrorModal();
    }
  },
  mounted() {
    // 初始化WebSocket连接
    this.initWebSocket();

    // 等待WebSocket连接建立后，自动刷新日志
    setTimeout(() => {
      this.refreshLogs();
    }, 1000);
  },
  beforeUnmount() {
    // 组件卸载前注销WebSocket消息回调
    WebSocketService.offMessage(this.handleWebSocketMessage);
  }
};
</script>

<style scoped>
/* 与 content.vue 中相同的样式结构，保留连接状态与错误提示弹窗的风格 */

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

/* WebSocket连接状态 */
.connection-status {
  margin-bottom: 15px;
  padding: 8px;
  background-color: #ffcccc;
  border-radius: 4px;
  text-align: center;
}
.connection-status.connected {
  background-color: #ccffcc;
}

/* 日志表单 */
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

/* 日志列表 */
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

/* 分页 */
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

/* 刷新按钮 */
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

/* 刷新成功弹窗 */
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

/* 错误提示弹窗 */
.error-modal {
  background-color: #cc3333;
  min-width: 300px;
}
.error-details {
  font-size: 0.9em;
  max-width: 400px;
  word-break: break-all;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
</style>

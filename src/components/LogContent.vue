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

      // 日志数组
      logs: [],

      // 分页
      currentPage: 1,
      logsPerPage: 5,

      // 刷新成功弹窗
      isModalVisible: false,

      // 错误信息
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
    // 总页数
    totalPages() {
      return Math.ceil(this.logs.length / this.logsPerPage);
    },
    // 当前页要显示的日志
    pagedLogs() {
      const start = (this.currentPage - 1) * this.logsPerPage;
      const end = start + this.logsPerPage;
      return this.logs.slice(start, end);
    }
  },
  methods: {
    //--------------------------------------
    //         WebSocket相关
    //--------------------------------------
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => {
        this.checkConnectionStatus();
      }, 2000);
    },

    // 处理收到的WebSocket消息
    handleWebSocketMessage(data) {
      console.log('收到WebSocket消息:', data);

      // 如果有错误属性
      if (data && data.error === true) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }

      // 若是字符串，尝试JSON解析；若失败，则按纯文本日志处理
      if (typeof data === 'string') {
        let textData = data.trim();
        try {
          // 如果能解析为JSON，则继续下面逻辑
          data = JSON.parse(textData);
        } catch (e) {
          // 无法解析JSON => 纯文本日志解析
          this.parseTextLogs(textData);
          return;
        }
      }

      // 如果有 params 字段，则逐项处理
      if (data && data.params) {
        data.params.forEach(param => {
          if (param.result === 'success') {
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

    //--------------------------------------
    //         文本日志解析
    //--------------------------------------
    parseTextLogs(textData) {
      // 如果以 '.' 结尾，说明后端还没发送完，需要再次请求
      let needMore = false;
      if (textData.endsWith('.')) {
        needMore = true;
        // 去掉末尾的 '.'
        textData = textData.slice(0, -1).trim();
      }
// 按换行拆分每一条日志记录
      const lines = textData.split('\n').filter(line => line.trim() !== '');
      // 使用逗号作为分隔符，拆分为【事件、分类、时间、描述】
      const newLogs = lines.map(line => {
        const parts = line.trim().split(',').map(item => item.trim());
        // 取各部分，若描述中包含多个逗号，则合并它们
        const event = parts[0] || '';
        const category = parts[1] || '';
        const time = parts[2] || '';
        const description = parts.slice(3).join(', ');
        return {
          event,
          category,
          time,
          description
        };
      });
     
      // 将解析到的日志追加到 logs
      this.logs = this.logs.concat(newLogs);

      // 若后端尚未发送完 => 再次请求
      if (needMore) {
        setTimeout(() => {
          this.refreshLogs(false); // 这里传 false，表示不弹“刷新成功”
        }, 300);
      }
    },

    //--------------------------------------
    //         更新参数
    //--------------------------------------
    updateParameterValue(key, value) {
      if (key === 'log') {
        // 后端返回的 value 是数组 => 直接替换
        this.logs = Array.isArray(value) ? value : [];
      } else {
        console.log(`未处理的参数: ${key} = ${value}`);
      }
    },

    //--------------------------------------
    //         日志操作
    //--------------------------------------
    deleteLog(index) {
      this.logs.splice(index, 1);
    },
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
    refreshLogs(showModal = true) {
      const keys = ['log'];
      this.lastOperation = { type: 'get', data: keys };
      WebSocketService.sendGetCommand(keys);

      // 是否弹“刷新成功”
      if (showModal) {
        this.showSuccess();
      }
    },
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
    //         错误处理
    //--------------------------------------
    showError(message, details = '') {
      this.errorInfo = { visible: true, message, details };
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
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
    // 初始化WebSocket
    this.initWebSocket();
    // 等待连接后再请求一次日志
    setTimeout(() => {
      this.refreshLogs();
    }, 1000);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
  }
};
</script>

<style scoped>
/* 与 content.vue 保持一致的样式结构 */

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

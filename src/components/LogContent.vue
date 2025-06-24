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
              <!-- <th>操作</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in pagedLogs" :key="index">
              <td>{{ log.event }}</td>
              <td>{{ log.category }}</td>
              <td>{{ log.time }}</td>
              <td>{{ log.description }}</td>
              <!-- <td>
                <button @click="deleteLog(index)">删除</button>
              </td> -->
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="pagination">
          <button @click="changePage('prev')" :disabled="currentPage === 1">←</button>
          <span>{{ currentPage }}/{{ totalPages }}</span>
          <button @click="changePage('next')" :disabled="currentPage === totalPages">→</button>
        </div>

        <!-- 刷新按钮 -->
        <button @click="refreshLogs">刷新</button>

        <!-- 刷新成功弹窗 -->
        <!-- <div v-if="isModalVisible" class="modal">
          <p>刷新成功！</p>
          <button @click="hideModal">关闭</button>
        </div> -->

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
      logsPerPage: 10,   // ← 改为每页10条

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
      return this.logs.slice(start, start + this.logsPerPage);
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
      setTimeout(this.checkConnectionStatus, 2000);
    },
    handleWebSocketMessage(data) {
      if (data && data.error) {
        this.showError(data.message || '通信错误', data.details);
        return;
      }
      if (typeof data === 'string') {
        try { data = JSON.parse(data); }
        catch (e) {
          this.parseTextLogs(data.trim());
          return;
        }
      }
      if (data.params) {
        data.params.forEach(p => {
          if (p.result === 'success') {
            this.updateParameterValue(p.key, p.value);
          } else {
            this.showError(`参数 ${p.key} 获取失败`, p.error);
          }
        });
      } else {
        Object.keys(data).forEach(k => this.updateParameterValue(k, data[k]));
      }
    },

    //--------------------------------------
    //         文本日志解析
    //--------------------------------------
    parseTextLogs(text) {
      let needMore = false;
      if (text.endsWith('.')) {
        needMore = true;
        text = text.slice(0, -1).trim();
      }
      const lines = text.split('\n').filter(l => l);
      const newLogs = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          event: parts[0] || '',
          category: parts[1] || '',
          time: parts[2] || '',
          description: parts.slice(3).join(', ')
        };
      });
      this.logs = this.logs.concat(newLogs);
      if (needMore) {
        setTimeout(() => this.refreshLogs(false), 300);
      }
    },

    //--------------------------------------
    //         更新参数
    //--------------------------------------
    updateParameterValue(key, value) {
      if (key === 'log') {
        this.logs = Array.isArray(value) ? value : [];
      }
    },

    //--------------------------------------
    //         日志操作
    //--------------------------------------
    deleteLog(i) {
      this.logs.splice(i, 1);
    },
    changePage(dir) {
      if (dir === 'prev' && this.currentPage > 1) this.currentPage--;
      else if (dir === 'next' && this.currentPage < this.totalPages) this.currentPage++;
    },

    //--------------------------------------
    //         刷新日志
    //--------------------------------------
    refreshLogs(showModal = true) {
      this.lastOperation = { type: 'get', data: ['log'] };
      WebSocketService.sendGetCommand(['log']);
      if (showModal) this.showSuccess();
    },
    
    showSuccess() {
      this.isModalVisible = true;
      setTimeout(this.hideModal, 2000);
    },
    hideModal() {
      this.isModalVisible = false;
    },

    //--------------------------------------
    //         错误处理
    //--------------------------------------
    showError(msg, det = '') {
      this.errorInfo = { visible: true, message: msg, details: det };
    },
    hideErrorModal() {
      this.errorInfo.visible = false;
    },
    retryLastOperation() {
      if (this.lastOperation.type === 'get') {
        WebSocketService.sendGetCommand(this.lastOperation.data);
      }
      this.hideErrorModal();
    }

  },
  mounted() {
    this.initWebSocket();
    setTimeout(this.refreshLogs, 1000);
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
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
  max-width: 2000px;
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.content-container {
  max-width: 800px;
  margin: 0 auto;
}

/* WebSocket状态 */
.connection-status {
  margin-bottom: 15px;
  padding: 8px;
  background: #fcc;
  border-radius: 4px;
  text-align: center;
}
.connection-status.connected {
  background: #cfc;
}

/* 日志列表 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  white-space: nowrap; /* ← 不换行 */
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
  background: #003366;
  color: #fff;
  border: none;
  cursor: pointer;
}
.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.pagination span {
  margin: 0 10px;
  font-size: 16px;
}

/* 按钮 */
button {
  background: #003366;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 10px;
}
button:hover {
  background: #004488;
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #003366;
  color: #fff;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  z-index: 1000;
}
.modal button {
  margin-top: 10px;
  background: #fff;
  color: #003366;
}
.modal button:hover {
  background: #eee;
}

/* 错误弹窗 */
.error-modal {
  background: #c33;
}
.error-details {
  margin-top: 10px;
  padding: 8px;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
</style>
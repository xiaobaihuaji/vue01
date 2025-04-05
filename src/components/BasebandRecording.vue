<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <!-- WebSocket连接状态显示 -->
        <div class="connection-status" :class="{ connected: wsConnected }">
          WebSocket状态: {{ wsConnected ? '已连接' : '未连接' }}
        </div>

        <h2>基带数据录制</h2>
  
        <!-- 录制时长输入框 -->
        <div class="input-group">
          <label for="recording-time">录制时长</label>
          <div class="input-with-buttons">
            <input 
              id="recording-time"
              v-model.number="recordingTime"
              type="number"
              min="0"
              placeholder="输入录制时长"
              @focus="showUpDownButtons = true"
              @blur="showUpDownButtons = false"
            />
            <span>秒</span>
          </div>
        </div>
  
        <!-- 开始录制按钮 -->
        <button 
          :disabled="!recordingTime || isRecording"
          @click="startRecording"
          :class="{ 'start-recording': isRecording }"
        >
          {{ isRecording ? '正在录制' : '开始录制' }}
        </button>
  
        <!-- 正在录制状态：显示已录制时间及停止录制按钮 -->
        <div v-if="isRecording">
          <p>已录制：{{ recordedTime }}秒</p>
          <button @click="stopRecording">停止录制</button>
        </div>
  
        <!-- 弹窗提示录制完成 -->
        <div v-if="isModalVisible" class="modal">
          <p>录制完成</p>
        </div>
  
        <!-- 文件名与下载按钮 -->
        <div class="input-group">
          <label for="file-name">文件名</label>
          <input id="file-name" v-model="fileName" type="text" placeholder="输入文件名" />
        </div>
        <button @click="downloadFile">下载</button>
      </div>
    </div>
  </div>
</template>
  
<script>
import WebSocketService from '@/store/websocket';

export default {
  name: 'BasebandRecording',
  data() {
    return {
      recordingTime: 0,      // 用户设置的录制时长（秒）
      recordedTime: 0,       // 实际录制经过的秒数
      isRecording: false,    // 是否处于录制状态
      isModalVisible: false, // 用于显示录制完成弹窗
      showUpDownButtons: false, // 控制输入框旁上下按钮显示（备用）
      fileName: '',          // 用户输入的保存文件名
      recordData: '',        // 存储录制过程中接收到的所有数据
      timer: null,           // 定时器ID
      wsConnected: false     // WebSocket连接状态
    };
  },
  methods: {
    // 初始化WebSocket连接，并注册消息回调与连接状态监控
    initWebSocket() {
      WebSocketService.connect();
      WebSocketService.onMessage(this.handleWebSocketMessage);
      this.checkConnectionStatus();
    },
    // 周期性检测WebSocket连接状态
    checkConnectionStatus() {
      this.wsConnected = WebSocketService.isConnected();
      setTimeout(() => {
        this.checkConnectionStatus();
      }, 2000);
    },
    // 处理WebSocket消息（参照Content.vue处理逻辑）
    handleWebSocketMessage(data) {
      console.log('收到WebSocket消息:', data);
      
      // 如果有错误属性，显示错误（这里仅打印，可扩展为弹窗提示）
      if (data && data.error === true) {
        console.error('WebSocket错误:', data.message || '未知错误');
        return;
      }
      
      // 如果数据是字符串，尝试解析为 JSON
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('解析WebSocket数据失败:', e);
        }
      }
      
      // 录制过程中追加保存数据
      this.handleRecordData(data);
    },
    // 追加保存录制数据
    handleRecordData(data) {
      if (this.isRecording) {
        let text;
        if (typeof data === 'object') {
          try {
            text = JSON.stringify(data);
          } catch (e) {
            text = String(data);
          }
        } else {
          text = data;
        }
        this.recordData += text + "\n";
      }
    },
    // 开始录制：发送START指令、清空数据、启动计时器
    startRecording() {
      if (this.isRecording) return;
      if (!this.recordingTime || this.recordingTime <= 0) {
        console.error("录制时长必须大于0秒");
        return;
      }
      this.isRecording = true;
      this.recordedTime = 0;
      this.recordData = ""; // 清空之前的数据
  
      // 发送开始录制指令
      WebSocketService.sendSetCommand({ recordCommand: "START" });
  
      // 启动定时器，每秒更新录制时间，到达设置时间后自动停止录制
      this.timer = setInterval(() => {
        if (this.recordedTime < this.recordingTime) {
          this.recordedTime++;
        } else {
          this.stopRecording();
        }
      }, 1000);
    },
    // 停止录制：发送STOP指令、结束计时器、显示录制完成弹窗
    stopRecording() {
      if (!this.isRecording) return;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      // 发送停止录制指令
      WebSocketService.sendSetCommand({ recordCommand: "STOP" });
      this.isRecording = false;
      this.showRecordingComplete();
    },
    // 显示录制完成弹窗
    showRecordingComplete() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.isModalVisible = false;
      }, 1000);
    },
    // 下载录制数据为TXT文件，如果无数据则保存"NO DATA"
    downloadFile() {
      let content = this.recordData.trim();
      if (content === "") {
        content = "NO DATA";
      }
      const file = this.fileName ? this.fileName : "BasebandRecordData1.txt";
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file;
      link.click();
      window.URL.revokeObjectURL(link.href);
    },
    // 增加录制时长（备用）
    incrementTime() {
      this.recordingTime++;
    },
    // 减少录制时长（备用）
    decrementTime() {
      if (this.recordingTime > 0) {
        this.recordingTime--;
      }
    }
  },
  mounted() {
    // 初始化WebSocket连接与状态监控
    this.initWebSocket();
  },
  beforeUnmount() {
    // 注销WebSocket消息回调，并清除定时器
    WebSocketService.offMessage(this.handleWebSocketMessage);
    if (this.timer) {
      clearInterval(this.timer);
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
  
h2 {
  text-align: center;
  margin-bottom: 30px;
}
  
.input-group {
  margin-bottom: 20px;
}
  
.input-with-buttons {
  display: flex;
  align-items: center;
}
  
.input-with-buttons input {
  width: 100px;
  padding: 5px;
  margin-right: 10px;
}
  
.input-with-buttons button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
}
  
.input-with-buttons button:hover {
  background-color: #004488;
}
  
button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  width: auto;
  text-align: center;
  margin: 5px 0;
}
  
button:hover {
  background-color: #004488;
}
  
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  
.modal p {
  font-size: 18px;
}
  
input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}
  
.start-recording {
  background-color: #90ee90;
}
  
.up-down-buttons button {
  background-color: #003366;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
}
  
.up-down-buttons button:hover {
  background-color: #004488;
}
</style>

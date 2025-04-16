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
          <!-- 保留用户输入文件名；若用户没有输入，则自动显示后端返回的文件名 -->
          <input id="file-name" v-model="fileName" type="text" placeholder="输入文件名（可选）" />
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
      recordedTime: 0,       // 显示的录制秒数，由本地计时器更新（后端返回的 recordedTime 不覆盖本地计时）
      isRecording: false,    // 当前是否处于录制状态
      isModalVisible: false, // 用于显示“录制完成”弹窗
      showUpDownButtons: false, // 控制输入框旁上下按钮显示（备用）
      fileName: '',          // 用户输入的保存文件名
      recordData: "",        // 累计录制过程中接收到的所有数据
      timer: null,           // 本地计时器ID
      pollTimer: null,       // 后端轮询定时器ID
      wsConnected: false,    // WebSocket连接状态
      
      // 后端返回的录制状态信息
      recordStatus: "",
      recordFileName: "",
      recordFilePath: ""     // 例如："/home/ecdav/DRM_Modu_bin/record"
    };
  },
  methods: {
    // ----------------------- WebSocket 初始化及状态监控 -----------------------
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
    
    // ----------------------- 处理 WebSocket 消息 -----------------------
    handleWebSocketMessage(data) {
      console.log('收到WebSocket消息:', data);
      
      if (data && data.error === true) {
        console.error('WebSocket错误:', data.message || '未知错误');
        return;
      }
      
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('解析WebSocket数据失败:', e);
        }
      }
      
      // 处理后端返回的录制状态参数
      if (data && data.params && Array.isArray(data.params)) {
        data.params.forEach(param => {
          if (param.result === 'success') {
            this.updateParameterValue(param.key, param.value);
          } else {
            console.error(`参数 ${param.key} 获取失败: ${param.error || '未知错误'}`);
          }
        });
      }
      
      // 如果正在录制，将所有接收到的数据追加保存到 recordData 中
      this.handleRecordData(data);
    },
    // 将接收到的数据追加保存到 recordData 中
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
    // ----------------------- 根据返回的参数名更新录制状态 -----------------------
    updateParameterValue(key, value) {
      // 如果 key 以 "iqRecordStatus." 前缀，则去除该前缀
      if (key.startsWith("iqRecordStatus.")) {
        key = key.slice("iqRecordStatus.".length);
      }
      switch (key) {
        case 'recordStatus':
          this.recordStatus = value;
          break;
        case 'recordedTime':
          // 如果正在录制，本地计时器控制显示，不覆盖
          if (!this.isRecording) {
            this.recordedTime = parseInt(value);
          }
          break;
        case 'recordFileName':
          // 如果用户未手动输入文件名，则采用后端返回的文件名
          if (!this.fileName) {
            this.fileName = value;
          }
          this.recordFileName = value;
          break;
        case 'recordFilePath':
          this.recordFilePath = value;
          break;
        default:
          console.log(`未处理的参数: ${key} = ${value}`);
      }
    },
    // ----------------------- 开始录制 -----------------------
    startRecording() {
      if (this.isRecording) return;
      if (!this.recordingTime || this.recordingTime <= 0) {
        console.error("录制时长必须大于0秒");
        return;
      }
      this.isRecording = true;
      this.recordedTime = 0;
      this.recordData = ""; // 清空之前的数据
  
      // 发送开始录制指令（set 命令），录制时长以字符串格式发送
      WebSocketService.sendSetCommand({
        "iqRecordCommand.recordCommand": "START",
        "iqRecordCommand.recordTime": this.recordingTime.toString()
      });
  
      // 启动本地计时器：每秒更新录制时间（用于页面显示），达到设定时长后自动停止录制
      this.timer = setInterval(() => {
        if (this.recordedTime < this.recordingTime) {
          this.recordedTime++;
        } else {
          this.stopRecording();
        }
      }, 1000);
  
      // 启动轮询定时器：每秒向后端发送 GET 命令获取录制状态
      this.pollTimer = setInterval(() => {
        const keys = [
          "iqRecordStatus.recordStatus",
          "iqRecordStatus.recordedTime",
          "iqRecordStatus.recordFileName",
          "iqRecordStatus.recordFilePath"
        ];
        WebSocketService.sendGetCommand(keys);
      }, 1000);
    },
    
    // ----------------------- 停止录制 -----------------------
    stopRecording() {
      if (!this.isRecording) return;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      // 发送停止录制指令（set 命令）
      WebSocketService.sendSetCommand({
        "iqRecordCommand.recordCommand": "STOP"
      });
      this.isRecording = false;
      this.showRecordingComplete();
    },
    
    // ----------------------- 显示录制完成弹窗 -----------------------
    showRecordingComplete() {
      this.isModalVisible = true;
      setTimeout(() => {
        this.isModalVisible = false;
      }, 1000);
    },
    
    // ----------------------- 下载录制文件 -----------------------
    downloadFile() {
      // 如果后端返回了文件路径和文件名，则直接使用硬编码的下载地址
      if (this.recordFilePath && this.recordFileName) {
        // 映射：将 Linux 绝对路径 "/home/ecdav/DRM_Modu_bin/record" 映射为网页中的 "/record"
        // 这里我们硬编码 base URL 为 "http://localhost:8080/record/"
        const baseUrl = "http://localhost:8080/record/";
        const downloadUrl = baseUrl + this.recordFileName;
  
        // 使用隐藏的 <a> 标签直接下载，不新开网页
        const link = document.createElement("a");
        link.href = downloadUrl;
        // 如果用户输入了文件名则优先使用用户输入的文件名
        link.download = this.fileName ? this.fileName : this.recordFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 如果后端未返回文件信息，则弹出错误提示（可根据需要扩展其他逻辑）
        alert("错误：未能获取录制文件信息！");
      }
    },
    
    // ----------------------- 备用：录制时长增减功能 -----------------------
    incrementTime() {
      this.recordingTime++;
    },
    decrementTime() {
      if (this.recordingTime > 0) {
        this.recordingTime--;
      }
    }
  },
  mounted() {
    // 初始化 WebSocket 连接及状态监控
    this.initWebSocket();
  },
  beforeUnmount() {
    WebSocketService.offMessage(this.handleWebSocketMessage);
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
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
  
.button-container {
  margin-bottom: 20px;
}
  
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
  
/* 错误弹窗 */
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
  
.error {
  border: 2px solid red;
}
  
.error-msg {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}
</style>




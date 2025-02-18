<template>
    <div class="content-wrapper">
      <div class="content">
        <div class="content-container">
          <h2>基带数据录制</h2>
          
          <!-- 录制时长输入框 -->
          <div class="input-group">
            <label for="recording-time">录制时长</label>
            <div class="input-with-buttons">
              <input 
                id="recording-time"
                v-model="recordingTime"
                type="number"
                min="0"
                placeholder="输入录制时长"
                @focus="showUpDownButtons = true"
                @blur="showUpDownButtons = false"
              />
              <span>秒</span>
              <!-- <div v-if="showUpDownButtons" class="up-down-buttons">
                <button @click="incrementTime">↑</button>
                <button @click="decrementTime">↓</button>
              </div> -->
            </div>
          </div>
  
          <!-- 开始录制按钮 -->
          <button 
            :disabled="!recordingTime"
            @click="startRecording"
            :class="{ 'start-recording': isRecording }"
          >
            {{ isRecording ? '正在录制' : '开始录制' }}
          </button>
  
          <!-- 已录制时间 -->
          <div v-if="isRecording">
            <p>已录制：{{ recordedTime }}秒</p>
          </div>
  
          <!-- 弹窗提示录制完成 -->
          <div v-if="isModalVisible" class="modal">
            <p>录制完成</p>
          </div>
  
          <!-- 文件名和下载按钮 -->
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
  export default {
    name: 'BasebandRecording',
    data() {
      return {
        recordingTime: 0,  // 输入的录制时长
        recordedTime: 0,   // 已录制的时间
        isRecording: false, // 是否正在录制
        isModalVisible: false, // 弹窗显示状态
        showUpDownButtons: false, // 控制上下按钮显示
        fileName: '', // 文件名
      };
    },
    methods: {
      // 开始录制
      startRecording() {
        this.isRecording = true;
        this.recordedTime = 0;
        let interval = setInterval(() => {
          if (this.recordedTime < this.recordingTime) {
            this.recordedTime++;
          } else {
            clearInterval(interval);
            this.isRecording = false;
            this.showRecordingComplete();
          }
        }, 1000);
      },
      
      // 增加录制时长
      incrementTime() {
        this.recordingTime++;
      },
  
      // 减少录制时长
      decrementTime() {
        if (this.recordingTime > 0) {
          this.recordingTime--;
        }
      },
  
      // 显示录制完成弹窗
      showRecordingComplete() {
        this.isModalVisible = true;
        setTimeout(() => {
          this.isModalVisible = false;
        }, 1000);
      },
  
      // 文件下载按钮（此功能暂时不做实际处理）
      downloadFile() {
        console.log(`下载文件：${this.fileName}`);
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
    padding: 6px 12px; /* Adjusted padding */
    border-radius: 3px;
    cursor: pointer;
    width: auto;
    text-align: center;
    margin-left: 0;
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
    background-color: #90ee90;  /* Light green color */
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
  
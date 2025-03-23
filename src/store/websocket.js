
//格式：
// {"command":"set","key":{"exciter.dpdFreqSametoRf":false}}
// {"command":"get","key":["exciter.dpdInputFreq","exciter.dpdFreqSametoRf"]}


// WebSocket服务
let socket = null;
let isConnected = false;
let reconnectTimer = null;
let messageCallbacks = [];

//   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const WS_URL = 'ws://localhost:8880'; // 待修改
//   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

// 创建WebSocket连接
function connect() {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    console.log('WebSocket已连接或正在连接');
    return;
  }

  console.log('正在连接WebSocket服务器...');
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('WebSocket连接成功');
    isConnected = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onmessage = (event) => {
    console.log('收到消息:', event.data);
    try {
      // 尝试解析JSON格式的响应
      const data = JSON.parse(event.data);
      // 触发所有注册的回调函数
      messageCallbacks.forEach(callback => callback(data));
    } catch (e) {
      console.error('解析消息出错:', e);
      // 如果不是JSON格式，也尝试传递给回调
      messageCallbacks.forEach(callback => callback(event.data));
    }
  };

  socket.onclose = () => {
    console.log('WebSocket连接已关闭');
    isConnected = false;
    // 自动重连
    reconnectTimer = setTimeout(() => {
      connect();
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket错误:', error);
    isConnected = false;
  };
}

// 发送get命令 - 修改为符合文档要求的格式
function sendGetCommand(keys) {
  if (!isConnected || !socket) {
    console.error('WebSocket未连接，无法发送命令');
    return false;
  }

  // 按照文档要求格式化get命令
  // 格式："get "key1","key2","key3" ......"
  let formattedKeys = '';
  if (Array.isArray(keys)) {
    formattedKeys = keys.map(key => `"${key}"`).join(',');
  } else {
    formattedKeys = `"${keys}"`;
  }

  const message = `get ${formattedKeys}`;
  
  console.log('发送get命令:', message);

  try {
    socket.send(message);
    return true;
  } catch (e) {
    console.error('发送get命令失败:', e);
    return false;
  }
}

// 发送set命令 - 修改为符合文档要求的格式
function sendSetCommand(keyValues) {
  if (!isConnected || !socket) {
    console.error('WebSocket未连接，无法发送命令');
    return false;
  }

  // 按照文档要求格式化set命令
  // 格式："set "key1":"value1","key2":"value2" ......"
  let formattedKeyValues = '';
  const entries = Object.entries(keyValues);
  
  formattedKeyValues = entries.map(([key, value]) => {
    // 处理布尔值、数字和字符串
    if (typeof value === 'boolean') {
      return `"${key}":${value}`;
    } else if (typeof value === 'number') {
      return `"${key}":${value}`;
    } else {
      return `"${key}":"${value}"`;
    }
  }).join(',');

  const message = `set ${formattedKeyValues}`;
  
  console.log('发送set命令:', message);

  try {
    socket.send(message);
    return true;
  } catch (e) {
    console.error('发送set命令失败:', e);
    return false;
  }
}

// 注册消息回调
function onMessage(callback) {
  if (typeof callback === 'function') {
    messageCallbacks.push(callback);
  }
}

// 注销消息回调
function offMessage(callback) {
  const index = messageCallbacks.indexOf(callback);
  if (index !== -1) {
    messageCallbacks.splice(index, 1);
  }
}

// 关闭WebSocket连接
function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  isConnected = false;
  messageCallbacks = [];
}

// 导出WebSocket服务的方法
export default {
  connect,
  disconnect,
  sendGetCommand,
  sendSetCommand,
  onMessage,
  offMessage,
  isConnected: () => isConnected
};
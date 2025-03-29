let socket = null;
let isConnected = false;
let reconnectTimer = null;
let messageCallbacks = [];

const WS_URL = 'ws://localhost:8880'; // 待修改

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
      const data = JSON.parse(event.data);
      messageCallbacks.forEach(callback => callback(data));
    } catch (e) {
      console.error('解析消息出错:', e);
      messageCallbacks.forEach(callback => callback(event.data));
    }
  };

  socket.onclose = () => {
    console.log('WebSocket连接已关闭');
    isConnected = false;
    reconnectTimer = setTimeout(() => {
      connect();
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket错误:', error);
    isConnected = false;
  };
}

// 发送get命令
function sendGetCommand(keys) 
{
  if (!isConnected || !socket) {
    console.error('WebSocket未连接，无法发送命令');
    return false;
  }

  const message = JSON.stringify({
    command: "get",
    key: Array.isArray(keys) ? keys : [keys] // 确保key是数组格式
  });

  console.log('发送get命令:', message);

  try {
    socket.send(message);
    return true;
  } catch (e) {
    console.error('发送get命令失败:', e);
    return false;
  }
}

// 发送set命令
function sendSetCommand(keyValues) {
  if (!isConnected || !socket) {
    console.error('WebSocket未连接，无法发送命令');
    return false;
  }

  const message = JSON.stringify({
    command: "set",
    key: keyValues
  });

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

<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>时钟同步</h2>

        <!-- 表格 -->
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <!-- 时钟源 -->
          <tr>
            <td>时钟源</td>
            <td>
              <select v-model="clockSource">
                <option value="INT_10MHZ">INT_10MHZ: 内部10MHZ</option>
                <option value="EXT_10MHZ">EXT_10MHZ: 外部10MHZ</option>
                <option value="GNSS">GNSS</option>
              </select>
            </td>
          </tr>

          <!-- SFN偏移 -->
          <tr>
            <td>SFN偏移</td>
            <td>
              <input 
                type="number" 
                v-model="sfnOffset" 
                min="-999" max="999"
                placeholder="请输入SFN偏移"
                :class="{'error': sfnOffset < -999 || sfnOffset > 999}"
              />
              <span>微秒   范围：-999 - 999</span>
              <div v-if="sfnOffset < -999 || sfnOffset > 999" class="error-msg">范围：-999 到 +999</div>
            </td>
          </tr>

          <!-- 输出频率校正 -->
          <tr>
            <td>输出频率校正</td>
            <td>
              <input 
                type="number" 
                v-model="freqCorrection" 
                min="-1000" max="1000"
                placeholder="请输入频率校正值"
                :class="{'error': freqCorrection < -1000 || freqCorrection > 1000}"
              />
              <span>PPB   范围：-1000 - 1000</span>
              <div v-if="freqCorrection < -1000 || freqCorrection > 1000" class="error-msg">范围：-1000 到 +1000</div>
            </td>
          </tr>

          <!-- VTCXO电压字 -->
          <tr>
            <td>VTCXO电压字</td>
            <td>
              <input 
                type="number" 
                v-model="vtcxoWord" 
                min="0" max="65535"
                placeholder="请输入VTCXO电压字"
                :class="{'error': vtcxoWord < 0 || vtcxoWord > 65535}"
              />
              <span>范围: 0 到 65535</span>
              <div v-if="vtcxoWord < 0 || vtcxoWord > 65535" class="error-msg">范围：0 到 65535</div>
            </td>
          </tr>

          <!-- GNSS锁定状态 -->
          <tr>
            <td>GNSS锁定状态</td>
            <td>{{ gnssLock }}</td>
          </tr>

          <!-- GNSS时间 -->
          <tr>
            <td>GNSS时间</td>
            <td>{{ gnssTime }}</td>
          </tr>

          <!-- 经度 -->
          <tr>
            <td>经度</td>
            <td>{{ longitude }}</td>
          </tr>

          <!-- 纬度 -->
          <tr>
            <td>纬度</td>
            <td>{{ latitude }}</td>
          </tr>
        </table>

        <!-- 应用按钮 -->
        <div class="button-container">
          <button @click="showApplySuccess">应用</button>
          <button @click="showRefreshSuccess">刷新</button>
        </div>

        <!-- 应用成功弹窗提示 -->
        <div v-if="isApplyModalVisible" class="modal">
          <p>应用成功！</p>
          <button @click="hideApplyModal">关闭</button>
        </div>

        <!-- 刷新成功弹窗提示 -->
        <div v-if="isRefreshModalVisible" class="modal">
          <p>刷新成功！</p>
          <button @click="hideRefreshModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClockSync',
  data() {
    return {
      // 数据项
      clockSource: 'INT_10MHZ',  // 时钟源
      sfnOffset: 0,  // SFN偏移
      freqCorrection: 0,  // 输出频率校正
      vtcxoWord: 0,  // VTCXO电压字
      gnssLock: 'LOCKED',  // GNSS锁定状态
      gnssTime: '',  // GNSS时间
      longitude: '',  // 经度
      latitude: '',  // 纬度

      // 控制弹窗显示
      isApplyModalVisible: false,
      isRefreshModalVisible: false,
    };
  },
  mounted() {
    // 模拟获取GNSS时间，经度和纬度，假设从系统获取数据
    this.getSystemStatus();
  },
  methods: {
    // 获取系统的GNSS时间、经度和纬度
    getSystemStatus() {
      // 模拟获取 GNSS 时间、经度和纬度
      this.gnssTime = new Date().toLocaleString();  // 获取当前时间
      this.longitude = '39°55′30.1″';  // 模拟经度
      this.latitude = '32°42′20.5″';  // 模拟纬度
    },
    // 显示应用成功弹窗
    showApplySuccess() {
      this.isApplyModalVisible = true;
    },
    // 隐藏应用成功弹窗
    hideApplyModal() {
      this.isApplyModalVisible = false;
    },
    // 显示刷新成功弹窗
    showRefreshSuccess() {
      this.isRefreshModalVisible = true;
    },
    // 隐藏刷新成功弹窗
    hideRefreshModal() {
      this.isRefreshModalVisible = false;
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

.input-with-unit {
  display: flex;
  align-items: center;
}

.input-with-buttons input {
  width: 100px;
  padding: 5px;
  margin-right: 10px;
}

.unit {
  color: #999;
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
}

.modal button {
  margin-top: 10px;
  background-color: white;
  color: #003366;
}

.modal button:hover {
  background-color: #f0f0f0;
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

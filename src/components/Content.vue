<template>
  <div class="content-wrapper">
    <div class="content">
      <div class="content-container">
        <h2>状态概览</h2>
        <table>
          <tr>
            <th>项目</th>
            <th>值/设置</th>
          </tr>
          <tr>
            <td>状态</td>
            <td>No Data</td>
          </tr>
        </table>
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
  name: 'Content',
  data() {
    return {
      isModalVisible: false
    }
  },
  methods: {
    showSuccess() {
      this.isModalVisible = true
    },
    hideModal() {
      this.isModalVisible = false
    }
  }
}
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

<template>
  <header>
    <div class="header-content">
      <div class="title">Bcom-8000 DRM调制器</div>
      <nav>
        <div class="nav-center">
          <ul>
            <!-- 状态 -->
            <li 
              @mouseenter="showMenu('status')" 
              @mouseleave="hideMenu"
              class="nav-item"
            >
              状态
              <div 
                v-if="isStatusMenuVisible" 
                class="submenu"
              >
                <!-- 点击后切换到第一个页面（状态概览） -->
                <div 
                  class="submenu-item"
                  @click="$emit('changePage', 'status')"
                >
                  状态概览
                </div>
                <!-- 点击后切换到第二个页面（日志） -->
                <div 
                  class="submenu-item"
                  @click="$emit('changePage', 'log')"
                >
                  日志
                </div>
              </div>
            </li>
            
            <!-- 系统设置（这里暂时不切换页面，只做演示） -->
            <li 
              @mouseenter="showMenu('system')" 
              @mouseleave="hideMenu"
              class="nav-item"
            >
              系统设置
              <div 
                v-if="isSystemMenuVisible"
                class="submenu"
              >
                <div class="submenu-item">系统设置</div>
                <div class="submenu-item">网络设置</div>
              </div>
            </li>
            
            <!-- DRM（这里暂时不切换页面，只做演示） -->
            <li 
              @mouseenter="showMenu('drm')" 
              @mouseleave="hideMenu"
              class="nav-item"
            >
              DRM
              <div 
                v-if="isDrmMenuVisible"
                class="submenu"
              >
                <div class="submenu-item">复用流输入</div>
                <div class="submenu-item">调制输出</div>
                <div class="submenu-item">时钟同步</div>
                <div class="submenu-item">基带数据录制</div>
              </div>
            </li>
            
            <!-- 登出 -->
            <li @click="logout" class="nav-item">登出</li>
          </ul>
        </div>
        <div class="language-toggle">
          <button @click="toggleLanguage">中/英</button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    // 父组件可传入当前页面名称（可用于样式高亮等）
    currentPage: {
      type: String,
      default: 'status'
    }
  },
  data() {
    return {
      isStatusMenuVisible: false,
      isSystemMenuVisible: false,
      isDrmMenuVisible: false,
      currentLanguage: 'zh'
    }
  },
  methods: {
    showMenu(menu) {
      this.isStatusMenuVisible = false;
      this.isSystemMenuVisible = false;
      this.isDrmMenuVisible = false;
      
      if (menu === 'status') {
        this.isStatusMenuVisible = true;
      } else if (menu === 'system') {
        this.isSystemMenuVisible = true;
      } else if (menu === 'drm') {
        this.isDrmMenuVisible = true;
      }
    },
    hideMenu() {
      this.isStatusMenuVisible = false;
      this.isSystemMenuVisible = false;
      this.isDrmMenuVisible = false;
    },
    logout() {
      console.log('登出');
    },
    toggleLanguage() {
      this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
      console.log(this.currentLanguage === 'zh' ? '切换到中文' : 'Switch to English');
    }
  }
}
</script>

<style scoped>
header {
  background-color: #003366;
  color: white;
  padding: 10px 20px;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 20px;
  white-space: nowrap;
}

nav {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

nav ul {
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
  align-items: center;
}

.nav-item {
  margin: 0 20px;
  cursor: pointer;
  position: relative;
  padding: 10px 0;
}

.nav-item:hover {
  color: #ddd;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #003366;
  padding: 10px;
  min-width: 200px;
  border-radius: 0 0 5px 5px;
  z-index: 1000;
}

.submenu-item {
  padding: 8px 0;
  cursor: pointer;
  text-align: center;
}

.submenu-item:hover {
  color: #ddd;
}

.language-toggle {
  margin-left: 20px;
  white-space: nowrap;
}

.language-toggle button {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.language-toggle button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

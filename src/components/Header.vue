<template>
  <header>
    <div class="header-content">
      <div class="title">{{ $t('title') }}</div> <!-- 动态文本 -->
      <nav>
        <div class="nav-center">
          <ul>
            <!-- 状态 -->
            <li
              @mouseenter="showMenu('status')"
              @mouseleave="hideMenu"
              class="nav-item"
            >
              {{ $t('status') }} <!-- 动态文本 -->
              <div v-if="isStatusMenuVisible" class="submenu">
                <div class="submenu-item" @click="handlePageChange('status')">
                  {{ $t('status') }} <!-- 动态文本 -->
                </div>
                <div class="submenu-item" @click="handlePageChange('log')">
                  {{ $t('log') }} <!-- 动态文本 -->
                </div>
              </div>
            </li>

            <!-- 系统设置 -->
            <li @mouseenter="showMenu('system')" @mouseleave="hideMenu" class="nav-item">
              {{ $t('systemSettings') }} <!-- 动态文本 -->
              <div v-if="isSystemMenuVisible" class="submenu">
                <div class="submenu-item" @click="handlePageChange('SystemsettingContent')">
                  {{ $t('systemSettings') }} <!-- 动态文本 -->
                </div>
                <div class="submenu-item" @click="handlePageChange('NetworkSettings')">
                  {{ $t('networkSettings') }} <!-- 动态文本 -->
                </div>
              </div>
            </li>

            <!-- DRM -->
            <li @mouseenter="showMenu('drm')" @mouseleave="hideMenu" class="nav-item">
              DRM
              <div v-if="isDrmMenuVisible" class="submenu">
                <div class="submenu-item" @click="handlePageChange('MultiplexingInput')">
                  {{ $t('multiplexingInput') }} <!-- 动态文本 -->
                </div>
                <div class="submenu-item" @click="handlePageChange('ModulationOutput')">
                  {{ $t('modulationOutput') }} <!-- 动态文本 -->
                </div>
                <div class="submenu-item" @click="handlePageChange('RFOutput')">
                  {{ $t('rfOutput') }} <!-- 动态文本 -->
                </div>
                <div class="submenu-item" @click="handlePageChange('EnvelopeOutput')">
                  {{ $t('envelopeOutput') }} <!-- 动态文本 -->
                </div>
                <div class="submenu-item" @click="handlePageChange('PAPR')">
                  {{ $t('PAPR') }} <!-- 动态文本 -->
                </div>
              </div>
            </li>

            <!-- 登出 -->
            <li @click="logout" class="nav-item">{{ $t('logout') }}</li> <!-- 动态文本 -->
          </ul>
        </div>
        <div class="language-toggle">
          <button @click="toggleLanguage">{{ $t('languageToggle') }}</button> <!-- 动态文本 -->
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
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
    handlePageChange(pageName) {
      this.$emit('changePage', pageName);
    },
    toggleLanguage() {
      this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
      this.$i18n.locale = this.currentLanguage;  // 切换语言
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

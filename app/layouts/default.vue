<template>
  <div class="app-layout">
    <TheHeader />
    <main class="main-content">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// 移除了重复的语言监听代码
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scrollbar-gutter: stable; /* 预留滚动条空间，避免内容变化时布局闪烁 */
}

/* 暗黑主题滚动条样式 - 应用到 html 和 body */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 12px !important;
  height: 12px !important;
}

html::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {
  background: #030617 !important;
}

html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  border: 2px solid #030617 !important;
}

html::-webkit-scrollbar-thumb:hover,
body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* Firefox 滚动条样式 */
html {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) #030617;
}

body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #030617; /* 确保与滚动条轨道颜色一致 */
  transition: background-color 0.3s, color 0.3s;
}

#__nuxt {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right,
    transparent 0%,
    rgba(0, 220, 130, 0.1) 10%,
    rgba(0, 220, 130, 0.3) 30%,
    rgba(0, 220, 130, 0.5) 50%,
    rgba(0, 220, 130, 0.3) 70%,
    rgba(0, 220, 130, 0.1) 90%,
    transparent 100%
  );
  z-index: 10;
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

input, button, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  h1 {
    font-size: 1.8rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>

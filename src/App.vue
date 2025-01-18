<!-- App.vue -->
<template>
  <div id="app">
    <Header  />
    <Content />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Content from './components/Content.vue'

export default {
  name: 'App',
  components: {
    Header,
    Content
  }
}
</script>

<style>
#app {
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
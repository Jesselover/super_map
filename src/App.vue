<template>
  <div id="app">
    <router-link to="/LeafletMap">LeafletMap</router-link>
    <router-link to="/SuperMap">SuperMap</router-link>
    <router-link to="/register">Register</router-link>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style lang = 'scss'>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

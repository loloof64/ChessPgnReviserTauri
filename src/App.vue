<template>
  <MainZone/>
</template>

<script>
import MainZone from './components/MainZone.vue'
import './App.css';

export default {
  name: 'App',
  components: {
    MainZone
  }
}
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

@font-face {
  font-family: "Free Serif";
  src: local("Free Serif"),
   url(./assets/fonts/FreeSerif.ttf) format("truetype");
}
</style>

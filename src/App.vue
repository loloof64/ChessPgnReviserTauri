<template>
  <div id="root">
    <MainZone />
    <StatusBar :gameData="gameData" />
  </div>
</template>

<script>
import { ref } from "vue";
import MainZone from "./components/MainZone.vue";
import StatusBar from "./components/StatusBar.vue";
import "./App.css";

export default {
  name: "App",
  setup() {
    const gameData = ref();

    return { gameData };
  },
  components: {
    MainZone,
    StatusBar,
  },
};
</script>

<style scoped>
#root {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

@font-face {
  font-family: "Free Serif";
  src: local("Free Serif"), url(./assets/fonts/FreeSerif.ttf) format("truetype");
}
</style>

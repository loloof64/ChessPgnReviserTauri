<template>
  <teleport to="body">
    <div class="dialog-mask" v-if="visible">
        <div class="dialog-content">
          <slot>This dialog has not been given any content.</slot>
        </div>
    </div>
  </teleport>
</template>

<script>
import {ref} from 'vue';
export default {
    setup() {
        const visible = ref(false);

        function open() {
          visible.value = true;
        }

        function close() {
          visible.value = false;
        }

        return {visible, open, close};
    },
}
</script>

<style scoped>
.dialog-mask {
  background-color: #00000082;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  white-space: pre-wrap;
  border-radius: 1vw;
  padding: 2vw;
  font-family: "Free Serif";
  font-size: 30px;
  background-color: rgba(255, 255, 255, 0.651);
}
</style>
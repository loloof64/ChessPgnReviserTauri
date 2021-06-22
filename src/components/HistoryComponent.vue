<template>
  <div id="content" :style="rootStyle">
    <span
      v-for="(item, index) in items"
      :key="index"
      :class="{'selectedNode': index === selectedNodeIndex}"
      @click="handleItemClick(index)"
    >
      {{ item.text + " " }}
    </span>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  props: {
    width: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  setup(props, context) {
    const rootStyle = `width: ${props.width}; height: ${props.height}`;
    const selectedNodeIndex = ref(undefined);

    function handleItemClick(index) {
      const item = props.items[index];

      if (!item.positionFen) return;
      context.emit("position-request", {...item, index});
    }

    function notifyNodeSelected(index) {
        selectedNodeIndex.value = index;
    }

    return { rootStyle, selectedNodeIndex, handleItemClick, notifyNodeSelected };
  },
};
</script>

<style scoped>
#content {
  font-family: "Free Serif";
  font-size: 30px;
  background-color: beige;
  text-align: start;
}

.selectedNode {
    background-color: yellow;
}
</style>
<template>
  <div id="root">
    <div id="buttons_bar">
      <img
        class="button"
        src="../assets/images/first_item.png"
        @click="handleGotoFirst"
      />
      <img
        class="button"
        src="../assets/images/previous_item.png"
        @click="handleGotoPrevious"
      />
      <img
        class="button"
        src="../assets/images/next_item.png"
        @click="handleGotoNext"
      />
      <img
        class="button"
        src="../assets/images/last_item.png"
        @click="handleGotoLast"
      />
    </div>
    <div id="content" :style="rootStyle">
      <span
        v-for="(item, index) in items"
        :key="index"
        :class="{ selectedNode: index === selectedNodeIndex }"
        @click="handleItemClick(index)"
      >
        {{ item.text + " " }}
      </span>
    </div>
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
  },
  setup(props, context) {
    const rootStyle = `width: ${props.width}; height: ${props.height}`;
    const selectedNodeIndex = ref(undefined);
    const items = ref([]);

    function handleItemClick(index) {
      const item = items.value[index];

      if (!item.positionFen) return;
      context.emit("position-request", { ...item, index });
    }

    function newGame() {
      items.value.splice(0, items.value.length);
    }

    function addItem(itemData) {
      if (itemData.whiteTurn) {
        items.value.push({ text: `${itemData.moveNumber}.` });
      }
      items.value.push({ ...itemData, text: itemData.moveFan });
    }

    function notifyNodeSelected(index) {
      selectedNodeIndex.value = index;
    }

    function handleGotoFirst() {}

    function handleGotoPrevious() {}

    function handleGotoNext() {}

    function handleGotoLast() {}

    return {
      items,
      rootStyle,
      selectedNodeIndex,
      handleItemClick,
      notifyNodeSelected,
      handleGotoFirst,
      handleGotoPrevious,
      handleGotoNext,
      handleGotoLast,
      newGame,
      addItem,
    };
  },
};
</script>

<style scoped>
#root {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

#buttons_bar {
  width: 350px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.button {
  border: 1px solid black;
  width: 30px;
  height: 30px;
}

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
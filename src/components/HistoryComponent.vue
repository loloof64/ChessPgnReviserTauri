<template>
    <div id="content" :style="rootStyle">
        <span v-for="(item, index) in items" :key="index" @click="handleItemClick(index)">
            {{item.text + ' '}}
        </span>
    </div>
</template>

<script>
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

        function handleItemClick(index) {
            const item = props.items[index];

            if (! item.positionFen) return;
            context.emit('position-request', item);
        }

        return {rootStyle, handleItemClick};
    },
}
</script>

<style scoped>
#content {
    font-family: 'Free Serif';
    font-size: 30px;
    background-color: beige;
    text-align: start;
}
</style>
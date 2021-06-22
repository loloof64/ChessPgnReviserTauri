<template>
    <div id="content" :style="rootStyle">
        {{items.map((elt) => elt.text).join(' ')}}
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
    setup(props) {
        const rootStyle = `width: ${props.width}; height: ${props.height}`;
        return {rootStyle};
    },
}
</script>

<style scoped>
#content {
    font-family: 'Free Serif';
    font-size: 30px;
    background-color: beige;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
</style>
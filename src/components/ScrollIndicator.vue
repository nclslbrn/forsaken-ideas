<script lang="ts">
export default {
    name: 'ScollIndicator',
    props: {
        count: {
            type: Number,
            required: true
        },
        current: {
            type: Number,
            required: true
        }
    },
    computed: {
        percent() {
            return Math.round((this.current / this.count) * 100)
        }
    }
}
</script>
<template>
    <div
        class="scroll-indicator"
        :style="`
            background: linear-gradient(
              to right,
              color-mix(in srgb, var(--color-primary), transparent 66%),
              color-mix(in srgb, var(--color-primary), transparent 66%) ${Math.max(0, percent - 0.15)}%,
              var(--color-primary) ${percent}%,
              rgba(0, 0, 0, 0) ${percent}%,
              rgba(0, 0, 0, 0)
            );`"
    ></div>
</template>
<style scoped>
.scroll-indicator {
    display: block;
    height: 2px;
    width: 100%;
}
</style>

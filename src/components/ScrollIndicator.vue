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
    methods: {
        getSlashes(): string {
            let out = '<span style="opacity: 0.5">'
            for (let i = 0; i  < this.count; i++) {
                out += i === this.current 
                    ? '</span><span style="color: var(--color-primary)">/</span><span style="opacity: 0.5;">' 
                    : '/'
            }
            out += '</span>'

            return out 
        }
    }

}
</script>
<template>
    <div class="scroll-indicator" v-html="getSlashes()">
    </div>
</template>
<style scoped>
    .scroll-indicator {
        display: flex;
        flex-flow: row nowrap;
    }
    .scroll-indicator span {

    }
</style>
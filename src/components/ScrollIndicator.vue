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
        getIndicators(): string {
            let out = ''
            for (let i = 0; i  < this.count; i++) {
                out += i === this.current 
                    ? '<span class="current"></span>' 
                    : '<span></span>'
            }
            out += ''
            return out 
        }
    }

}
</script>
<template>
  <div class="scroll-indicator">
      <template v-for="i in count" v-bind:key="i">
        <span :class="i === current ? 'current' : ''"></span>
      </template>
    </div>
</template>
<style scoped>
    .scroll-indicator {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
    }
    .scroll-indicator span {
      flex: 1 0 auto;
      height: 2px;
      background: var(--color-bg);
    }
    .scroll-indicator span.current {
      background: var(--color-primary)
    }
</style>

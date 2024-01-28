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
    }
}
</script>
<template>
  <div class="scroll-indicator">
      <template v-for="i in count" v-bind:key="i">
        <span :class="i <= current ? 'seen' : ''"></span>
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
      transition: background 10ms ease-in; 
    }
    .scroll-indicator span.seen {
      background: var(--color-text);

    }
</style>

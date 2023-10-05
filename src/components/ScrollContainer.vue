
<script lang="ts">
import type { PropType } from 'vue';
import type { State } from '@/state'

import { defineComponent, reactive, onMounted, ref, toRef, toRefs } from 'vue';
import { useIntersectionObserver } from '@/useIntersectionObserver';

export default defineComponent({
  name: 'ScrollContainer',
  inheritAttrs: false,
  props: {
    timeout: {
      type: Number,
      default: 0
    },
    viewport: {
      type: (typeof window !== 'undefined' ? window.HTMLElement : Object) as PropType<HTMLElement>,
      default: () => null,
    },
    threshold: { type: String, default: '0px' },
    direction: {
      type: String,
      default: 'vertical',
      validator: (v: string) => ['vertical', 'horizontal'].includes(v),
    },
    maxWaitingTime: { type: Number, default: 80 },
  },
  emits: ['init'],
  setup (props, { emit }) {
    const elRef = ref();
    const state = reactive<State>({
      isInit: false,
      loading: false,
      intersectionObserverInstance: null,
    });

    onMounted(() => {
      init()
      initIntersectionObserver();
    });

    // If there is a set delay time, it will be executed immediately

    function init () {
      state.loading = true;
      window.setTimeout(() => {
        if (state.isInit) return;
        state.isInit = true;
        emit('init');
      }, props.maxWaitingTime || 80);
    }

    function initIntersectionObserver () {
      const { timeout, direction, threshold } = props;
      if (timeout) return;
      // According to the scrolling direction to construct the viewport margin, used to load in advance
      let rootMargin = '0px';
      switch (direction) {
        case 'vertical':
          rootMargin = `${threshold} 0px`;
          break;
        case 'horizontal':
          rootMargin = `0px ${threshold}`;
          break;
      }
      console.log(elRef)
      try {
        const { stop, observer } = useIntersectionObserver({
          rootMargin,
          target: toRef(elRef.value, '$el'),
          onIntersect: (entries: any[]) => {
            const isIntersecting = entries[0].isIntersecting || entries[0].intersectionRatio;
            if (isIntersecting) {
              init();
              if (observer) {
                stop();
              }
            }
          },
          root: toRef(props, 'viewport'),
        });
      } catch (e) {
        init();
      }
    }
    return {
      elRef,
      ...toRefs(state),
    };
  },
})
</script>
<template>
  <div key="component" class="scroll-container" v-if="isInit">
    <slot :loading="loading"></slot>
  </div>
</template>
<style scoped>
.scroll-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  overflow-x: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
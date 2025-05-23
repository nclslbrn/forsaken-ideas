<script lang="ts">
import { type Params } from '../project.d'
import { type PropType } from 'vue'
export default {
  name: "OrderForm",
  props: {
    params: {
      type: Object as PropType<Params>,
      required: true
    }
  }
};
</script>
<template>
  <form id="order-grid">
    <span>Sorted by </span>
    <button :class="{ active: params.sorting === 'title' }" @click.prevent="$emit('sortProjectBy', 'title')">
      title
    </button>
    <button :class="{ active: params.sorting === 'date' }" @click.prevent="$emit('sortProjectBy', 'date')">
      date
    </button>
    <button :class="{ active: params.sorting === 'topic' }" @click.prevent="$emit('sortProjectBy', 'topic')">
      topic
    </button>
    <span> in </span>
    <button @click.prevent="$emit('sortInverse')">
      {{ params.asc ? "ascending" : "descending" }}
    </button>
    <span> order.</span>
  </form>
</template>
<style scoped>
form {
  padding: 1em;
  width: 100%;
  border-top: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  max-height: 64px;
}

@media screen and (min-width: 800px) {

  form button {
    position: relative;
    padding: 0.5em;
    font-size: 14px;
    border: none;
  }

  form button:hover,
  form button:focus {
    box-shadow: inset 0 0 0 1px var(--color-primary);
  }

  form button.active {
    box-shadow: inset 0 0 0 1px var(--color-secondary);
  }
}
</style>

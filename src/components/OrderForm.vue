<script lang="ts">
  import { type Params } from '../project.d.ts'
  import { PropType } from 'vue' 
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
      <!---
      <svg class="icon icon-sort-alphabetically">
        <use xlink:href="#icon-sort-alphabetically"></use>
      </svg>
      -->
      title
    </button>
    <button :class="{ active: params.sorting === 'date' }"  @click.prevent="$emit('sortProjectBy', 'date')">
      <!--
      <svg class="icon icon-sort-numerically">
        <use xlink:href="#icon-sort-numerically"></use>
      </svg>
      -->
      date
    </button>
    <button :class="{ active: params.sorting === 'topic' }" @click.prevent="$emit('sortProjectBy', 'topic')">
      <!--
      <svg class="icon icon-tag">
        <use xlink:href="#icon-tag"></use>
      </svg>
      -->
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
  margin: 1em 0 0 0;
}


@media screen and (min-width: 800px) {

  form button {
    position: relative;
    padding: 0.5em;
    font-size: 16px;
    border: none;
  }

  form button::after {
    position: absolute;
    content: '';
    left: 10%;
    bottom: 0;
    width: 80%;
    height: 1px;
    background: var(--color-text);
    transition: all cubic-bezier(1, 0, 0.3, 0.99) 100ms;
  }

  form button:hover::after,
  form button:focus::after {
    font-weight: 700;
  }

  form button.active::after {
    bottom: 50%;
  }
}
</style>

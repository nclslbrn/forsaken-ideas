<script lang="ts">
export default {
  name: "OrderForm",
  props: {
    sorting: String,
    asc: Boolean,
  },
};
</script>
<template>
  <form id="order-grid">
    <p>
      Sort
      <button @click.prevent="$emit('sortInverse')">
        {{ asc ? "ascending" : "descending" }}
      </button>
      by
    </p>
    <ul>
      <li>
        <button :class="{ active: sorting === 'title' }" title="title" @click.prevent="$emit('sortProjectBy', 'title')">
          <svg class="icon icon-sort-alphabetically">
            <use xlink:href="#icon-sort-alphabetically"></use>
          </svg>
        </button>
      </li>
      <li>
        <button :class="{ active: sorting === 'date' }" title="date" @click.prevent="$emit('sortProjectBy', 'date')">
          <svg class="icon icon-sort-numerically">
            <use xlink:href="#icon-sort-numerically"></use>
          </svg>
        </button>
      </li>
      <li>
        <button :class="{ active: sorting === 'topic' }" title="topic" @click.prevent="$emit('sortProjectBy', 'topic')">
          <svg class="icon icon-tag">
            <use xlink:href="#icon-tag"></use>
          </svg>
        </button>
      </li>
    </ul>
    <slot></slot>
  </form>
</template>
<style scoped>
form {
  margin: 1em 0 0 0;
}

form p,
form ul {
  display: none;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
}

@media screen and (min-width: 800px) {

  form,
  form ul {
    display: inline-flex;
    align-items: flex-end;
  }

  form ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
  }

  form#order-grid ul li {
    margin-right: 0.01em;
  }

  form#order-grid p {
    display: inline-flex;
    padding: 0 0.3em;
    margin: 0;
    align-items: baseline;
  }

  form#order-grid p button {
    padding: 0.75em;
    margin: 0 0.3em;
    font-size: 1em;
  }

  /*
  form#order-grid ul>li:not(:last-child)>button {
    border-right: none;
    margin-right: 1px;
  }
  */

  form#order-grid ul li button {
    padding: 0.5em;
  }

  form#order-grid ul li button,
  form#order-grid p button {
    background: var(--color-bg);
    border: none;
    border-bottom: 1px solid var(--color-text);
  }

  form#order-grid ul li button:hover,
  form#order-grid p button:hover,
  form#order-grid ul li button:focus,
  form#order-grid p button:focus {
    background: var(--color-solid);
    border-bottom: 1px solid var(--color-primary);
  }
}
</style>

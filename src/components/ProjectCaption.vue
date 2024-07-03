<script lang="ts">
import { PropType } from 'vue' 
import type { Project } from '@/project'
export default {
  props: {
    project: {
      type: Object as PropType<Project>,
      required: true
    },
    index: {
      type: Number
    }
  }
}
</script>
<template>
  <div class="project-caption"> 
    <a class="project-caption--title" :href="`./sketch/${project.src}/index.html`">
      <h2>{{ project.title }}</h2>
    </a>
    <div class="project-caption--meta">
      <div class="date">
        <svg class="icon icon-calendar">
          <use xlink:href="#icon-calendar"></use>
        </svg>
        <span>{{ project.date }}</span>
      </div>
      <div class="topic">
        <svg class="icon icon-tag">
          <use xlink:href="#icon-tag"></use>
        </svg>
        <span>{{ project.topic }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-caption {
  flex-grow: 1;
  border-right: 1px solid var(--color-text);
}

.project-caption--title {
  display: block;
  padding: 1em 2em 0 2em;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-text);
}

.project-caption--title:hover,
.project-caption--title:focus {
  color: var(--color-primary);
}

.project-caption--title h2 {
  font-size: 2.5em;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}

@media (orientation: portrait) {
  .project-caption--title h2 {
    font-size: 1.25em;
  }
}

.project-caption--meta {
  padding: 0 2em 1em 2em;
}

@media (orientation: landscape) {
  .project-caption--meta {
    display: inline-flex;
  }
}

.project-caption--meta .date,
.project-caption--meta .topic {
  margin: 0.5em 2em 0.5em 0;
  line-height: 1.5;
}

.project-caption--meta .icon {
  width: 1em;
  height: 1em;
  fill: var(--color-text);
  margin-right: 0.25em;
}
</style>

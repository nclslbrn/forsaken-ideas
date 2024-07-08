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
    <button class="project-caption--title" @click.prevent="$emit('openProject', project.src)">
      <h2>{{ project.title }}</h2>
    </button>
    <div class="project-caption--meta">
      <div class="date">
        <!-- 
        <svg class="icon icon-calendar">
          <use xlink:href="#icon-calendar"></use>
        </svg>
        -->
        <strong>Created:</strong> <span>{{ project.date }}</span>
      </div>
      <div class="topic">
        <!--
        <svg class="icon icon-tag">
          <use xlink:href="#icon-tag"></use>
        </svg>
        -->
        <strong>Topic:</strong> <span>{{ project.topic }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-caption {
  flex-basis: 75%;
  border-right: 1px solid var(--color-text);
}

.project-caption--title {
  display: block;
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
    line-height: 2;
  }
}


@media (orientation: landscape) {
  .project-caption--title {
    padding: 0 2em;
  }

  .project-caption--meta {
    display: inline-flex;
    padding: 0 1em;
    width: 100%;
  }

  .project-caption--meta .date,
  .project-caption--meta .topic {
    width: 50%;
    padding: 0 0 1em 1em;
  }
  .project-caption--meta .date {
    border-right: 1px solid var(--color-text);
  } 
}


.project-caption--meta .date,
.project-caption--meta .topic {
  line-height: 3;
}

.project-caption--meta .icon {
  width: 1em;
  height: 1em;
  fill: var(--color-text);
  margin-right: 0.25em;
}
</style>

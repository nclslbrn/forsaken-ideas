<script lang="ts">
import type { PropType } from 'vue'
import type { Project } from '../project'
// @ts-ignore
export default {
  props: {
    project: {
      type: Object as PropType<Project>,
      required: true
    },
    index: {
      type: Number
    }
  },
}
</script>
<template>
  <div class="project-caption">
    <button class="project-caption--title" :data-text="project.title"
      @click.prevent="$emit('openProject', project.src)">
      {{ project.title }}
    </button>
    <div class="project-caption--meta">
      <div class="date">
        <strong>Created:</strong>&nbsp;<span>{{ project.date }}</span>
      </div>
      <div class="topic">
        <strong>Topic:</strong>&nbsp;<span>{{ project.topic }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-caption {
  flex-grow: 1;
  max-width: calc(100% - 2.6em);
}

.project-caption--meta div {
  height: 100%;
}

.project-caption--title {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 3em;
  min-height: 3em;
  text-align: left;
  text-decoration: none;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}

.project-caption--meta {
  border-right: 1px solid var(--color-border);
}

.project-caption--title:hover,
.project-caption--title:focus {
  color: var(--color-primary);
}


@media screen and (max-width: 1080px) {

  .project-caption--title {
    font-size: 1.2em;
    line-height: 1;
  }

  .project-caption--meta {
    padding: 0 1em;
  }

  .project-caption--meta .date,
  .project-caption--meta .topic {
    height: 24px;
  }
}


@media screen and (min-width: 1080px) {
  .project-caption--meta {
    display: inline-flex;
    width: 100%;
    height: 64px;
  }

  .project-caption--meta .date,
  .project-caption--meta .topic {
    width: 50%;
    padding: 0 0 0 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .project-caption--meta .date {
    border-right: 1px solid var(--color-border);
  }
}
</style>

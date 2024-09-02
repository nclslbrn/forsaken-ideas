<script lang="ts">
import type { PropType } from 'vue' 
import type { Project } from '../project'
// @ts-ignore
import GlitchText from '../../sketch-common/glitchText'
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
  methods: {
    GlitchText
  }
}
</script>
<template>
  <div class="project-caption"> 
    <button 
      :ref="(element) => new GlitchText({ element, effect: 'replace'})" 
      class="project-caption--title"
      :data-text="project.title"
      @click.prevent="$emit('openProject', project.src)">
      {{ project.title }}
    </button>
    <div class="project-caption--meta">
      <div class="date">
        <strong>Created:</strong> <span 
          :data-text="project.date" 
          :ref="(element) => new GlitchText({ element, effect: 'add'})">
          {{ project.date }}
        </span>
      </div>
      <div class="topic">
        <strong>Topic:</strong> <span 
          :data-text="project.topic"
          :ref="(element) => new GlitchText({ element, effect: 'add'})">
          {{ project.topic }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-caption {
  flex-grow: 1;
  border-right: 1px solid var(--color-border);
}

.project-caption--title {
  display: block;
  width: 100%;
  text-align: left;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.project-caption--title:hover,
.project-caption--title:focus {
  color: var(--color-primary);
}

.project-caption--meta .date,
.project-caption--meta .topic {
  line-height: 3;
}

@media (orientation: portrait) {
  .project-caption--title {
    font-size: 1.4em;
    line-height: 1;
  }
  .project-caption--meta {
    padding: 0 1em;
  }

  .project-caption--meta .date,
  .project-caption--meta .topic {
    line-height: 2;
  }
}


@media (orientation: landscape) {
  .project-caption--meta {
    display: inline-flex;
    width: 100%;
  }
  .project-caption--meta .date,
  .project-caption--meta .topic {
    width: 50%;
    padding: 0 0 1em 1em;
  }
  .project-caption--meta .date {
    border-right: 1px solid var(--color-border);
  } 
}

</style>

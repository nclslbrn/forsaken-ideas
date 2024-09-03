<script lang="ts">
import type { Project } from "../project";
export default {
    props: {
        project: {
            type: Object as () => Project,
            required: true,
        },
        index: {
            type: Number,
        },
    },
};
</script>
<template>
    <button @click.prevent="$emit('openProject', project.src)" class="project-preview">
        <img 
         :src="`./sketch/${project.src}/thumbnail.webp`" 
         :alt="project.title" 
         loading="lazy" />
    </button>
</template>

<style scoped>
.project-preview {
    display: block;
    position: relative;
    transition: all 0.01s ease-in;
    overflow: hidden;
    box-shadow: var(--box-shadow-default);
    transition: all 0.03s linear;
}

.project-preview {
    border: 1px solid #ffffff00;
    background: var(--color-solid); 
    padding: 0.5vw;
    border-radius: 2px;
}

.project-preview:focus,
.project-preview:hover {
    box-shadow: var(--box-shadow-active);
}

.project-preview.active,
.project-preview:focus-visible {
  outline: none;
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
}

.project-preview img {
    float: left;
    max-height: 60vh;
    width: auto;
    opacity: 1;
    transition: opacity 0.5s ease-in;
}

.project-preview.active img,
.project-preview:hover img {
    opacity: 0.75;
}

.project-preview img::before,
.project-preview img::after {
    display: block;
    content: "";
    clear: both;
}
</style>

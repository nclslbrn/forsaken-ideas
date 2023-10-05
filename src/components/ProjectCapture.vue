<script lang="ts">
import type { Project } from '@/project'
export default {
    props: {
        project: {
            type: Object as () => Project,
            required: true
        },
        index: {
            type: Number
        }
    }
}
</script>
<template>
    <a :href="`./sketch/${project.src}/index.html`" class="project-preview">
        <img
            :src="`./sketch/${project.src}/thumbnail.jpg`"
            :alt="`iteration of ${project.title}`"
        />
    </a>
</template>

<style scoped>
a.project-preview {
    display: block;
    text-decoration: none;
    transition: all 0.01s ease-in;
    overflow: hidden;
    box-shadow: 0 0.5em 1em var(--color-shadow);
    transition: all 0.01s linear;
}

a.project-preview:hover {
    background-color: var(--color-secondary);
    box-shadow: 0 1em 1em var(--color-shadow);
}

a.project-preview img {
    float: left;
    opacity: 1;
    transition: opacity 0.5s ease-in;
}

a.project-preview:hover img {
    opacity: 0.75;
}

a.project-preview img::before,
a.project-preview img::after {
    display: block;
    content: '';
    clear: both;
}
</style>

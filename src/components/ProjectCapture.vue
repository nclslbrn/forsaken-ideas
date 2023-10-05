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
        <span class="debug-intersection"></span>
    </a>
</template>

<style scoped>
a.project-preview img {
    float: left;
    opacity: 1;
    transition: opacity 0.5s ease-in;
}
a.project-perview.active img,
a.project-preview:hover img {
    opacity: 0.75;
}

a.project-preview span.debug-intersection {
    position: absolute;
    top: 50%;
    display: block;
    left: 50%;
    font-size: 5em;
    z-index: 9999;
}

a.project-preview img::before,
a.project-preview img::after {
    display: block;
    content: '';
    clear: both;
}
</style>

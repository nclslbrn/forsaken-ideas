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
        <img :src="`./sketch/${project.src}/thumbnail.jpg`" :alt="project.title" loading="lazy" />
    </button>
</template>

<style scoped>
.project-preview {
    display: block;
    position: relative;
    transition: all 0.01s ease-in;
    overflow: hidden;
    box-shadow: 0 0.75em 0.66em var(--color-shadow);
    transition: all 0.01s linear;
}

.project-preview {
    background: linear-gradient(to bottom, #222, #000);
    padding: 12px;
    border-radius: 2px;
}

.project-preview.active,
.project-preview:focus,
.project-preview:hover {
    background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
    box-shadow: 0 1.2em 1em var(--color-shadow);
}

a.project-preview img {
    float: left;
    opacity: 1;
    transition: opacity 0.5s ease-in;
}

a.project-perview.active img,
a.project-preview:hover img {
    opacity: 0.75;
}

a.project-preview img::before,
a.project-preview img::after {
    display: block;
    content: "";
    clear: both;
}
</style>

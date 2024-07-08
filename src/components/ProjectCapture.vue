<script lang="ts">
import type { Project } from "@/project";
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
        <img :src="`./sketch/${project.src}/thumbnail.jpg`" :alt="project.title" />
    </button>
</template>

<style scoped>
a.project-preview {
    display: block;
    position: relative;
    text-decoration: none;
    transition: all 0.01s ease-in;
    overflow: hidden;
    box-shadow: 0 0.75em 0.66em var(--color-shadow);
    transition: all 0.01s linear;
}

a.project-preview {
    background: linear-gradient(to bottom, #000, #444);
    padding: 12px;
    border-radius: 2px;
}

a.project-preview.active,
a.project-preview:focus,
a.project-preview:hover {
    background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
    box-shadow: 0 1em 1em var(--color-shadow);
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
    content: "";
    clear: both;
}
</style>

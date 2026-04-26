<script lang="ts">
import type { Project } from '../project'
import DefaultCaptureImg from '@/components/DefaultCaptureImg.vue'
export default {
    components: { DefaultCaptureImg },
    props: {
        project: {
            type: Object as () => Project,
            required: true
        },
        seen: {
            type: Boolean,
            required: true
        },
        index: {
            type: Number
        }
    }
}
</script>
<template>
    <button
        @click.prevent="$emit('openProject', project.src)"
        class="project-preview"
    >
        <img
            v-if="seen"
            class="loaded"
            :src="`./sketch/${project.src}/thumbnail.webp`"
            :alt="project.title"
            :key="project.src"
        />
        <DefaultCaptureImg v-else class="loading" />
    </button>
</template>

<style scoped>
.project-preview {
    display: block;
    position: relative;
    overflow: hidden;
    box-shadow: var(--box-shadow-default);
    transition: all 0.03s linear;
}

.project-preview {
    border: 1px solid #ffffff00;
    background: linear-gradient(to bottom, var(--color-bg), var(--color-solid));
    padding: 0.5vw;
}

.project-preview:focus,
.project-preview:hover {
    box-shadow: var(--box-shadow-active);
}

.project-preview.active,
.project-preview:focus-visible {
    outline: none;
    border: 1px solid var(--color-primary);
}

.project-preview .loading {
    display: block;
    aspect-ratio: 1 / 1;
    width: auto;
    min-height: 436px;
}

.project-preview img {
    float: left;
    max-height: 60vh;
    width: auto;
    opacity: 1;
    transition: opacity 0.95s ease-in;
}

.project-preview.active img,
.project-preview:hover img {
    opacity: 0.75;
}

.project-preview img::before,
.project-preview img::after {
    display: block;
    content: '';
    clear: both;
}
</style>

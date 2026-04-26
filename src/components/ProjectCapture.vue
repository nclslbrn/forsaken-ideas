<script lang="ts">
import type { Project } from '../project'
import loadingCover from '@/assets/loading-project-cover.svg'
export default {
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
    },
    data() {
        return { loadingCover }
    }
}
</script>
<template>
    <button
        @click.prevent="$emit('openProject', project.src)"
        class="project-preview"
    >
        <img
            :class="seen ? 'loaded' : 'loading'"
            :src="
                seen ? `./sketch/${project.src}/thumbnail.webp` : loadingCover
            "
            :alt="project.title"
            :key="project.src"
        />
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
    /* background: var(--color-primary); */
}

.project-preview img.loading {
    display: block;
    aspect-ratio: 1 / 1;
    width: 600px;
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

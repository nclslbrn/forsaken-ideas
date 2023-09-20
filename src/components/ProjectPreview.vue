<script lang="ts">
import type { Project } from '@/project';
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
        <figure class="project-preview--illustrationœ">
            <img :src="`./sketch/${project.src}/thumbnail.jpg`" :alt="`iteration of ${project.title}`" />
        </figure>

        <figcaption>
            <h2 class="project-preview--title">{{ project.title }}</h2>
            <div class="project-preview--meta">
                <div class="date">
                    <svg class="icon icon-calendar">
                        <use xlink:href="#icon-calendar"></use>
                    </svg>
                    <span>{{ project.date }}</span>
                </div>
                <div class="topic">
                    <svg class="icon icon-tag">
                        <use xlink:href="#icon-tag"></use>
                    </svg>
                    <span>{{ project.topic }}</span>
                </div>
            </div>
        </figcaption>

    </a>
</template>

<style scoped>
a.project-preview {
    display: block;
    text-decoration: none;
    color: var(--color-bg);
    transition: all 0.15s ease-in;
}

a.project-preview figure {
    display: block;
    margin: 0;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    overflow: hidden;
}

a.project-preview figure img {
    float: left;
    opacity: 1;
    transition: opacity 0.15s ease-in;
}

a.project-preview:hover figure img {
    opacity: 0.75;
}

a.project-preview figure img::before,
a.project-preview figure img::after {
    display: block;
    content: "";
    clear: both;
}

a.project-preview figcaption {
    clear: both;
    float: none;
    padding: 1rem;
    background-color: var(--color-text);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

a.project-preview:hover figcaption {
    border-top: none;
}

a.project-preview .project-preview--title,
a.project-preview .project-preview--meta {
    color: inherit;
}

a.project-preview:hover .project-preview--title {
    color: var(--color-primary);
}


.project-preview--meta {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
}

.icon {
    width: 1em;
    height: 1em;
    fill: var(--color-bg);
    margin-right: 0.25em;
}

.project-preview--meta .topic span,
.project-preview--meta .date span {
    text-decoration: none;
}

.project {
    position: relative;
}

.project--introduction--description {
    white-space: break-spaces;
}

.project--introduction--preview {
    max-width: 800px;
}
</style>

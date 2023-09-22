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
        <figure class="project-preview--illustration">
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
    padding: 0.5em;
    text-decoration: none;
    transition: all 0.01s ease-in;
    overflow: hidden;
}

a.project-preview figure {
    display: block;
    margin: 0;
    overflow: hidden;
}

a.project-preview:hover figure {
    background-color: var(--color-secondary);
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
    padding: 0.5em 0 0;
    transition: all 0.15s ease-in-out;
}

a.project-preview .project-preview--title {
    color: var(--color-primary);
    line-height: 1.2;
    margin: 0.25em 0;
}

a.project-preview .project-preview--meta {
    padding-top: 0.5em;
    color: var(--color-text);
    border-top: 1px solid var(--color-border);
}

a.project-preview:hover .project-preview--title {
    color: var(--color-secondary);
}


.project-preview--meta {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
}

.icon {
    width: 1em;
    height: 1em;
    fill: var(--color-text);
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

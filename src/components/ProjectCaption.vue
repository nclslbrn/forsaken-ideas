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
    <div class="project-caption">
        <a
            class="project-caption--title"
            :href="`./sketch/${project.src}/index.html`"
        >
            <h2>{{ project.title }}</h2>
        </a>
        <div class="project-caption--meta">
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
    </div>
</template>

<style scoped>
.project-caption {
    display: block;
    width: 300px;
    margin: 0 auto;
}

.project-caption--title {
    text-decoration: none;
}

@media screen and (min-width: 900px) {
    .project-caption {
        margin: 0 0 0 2em;
        width: auto;
    }
}

.project-caption--meta .date,
.project-caption--meta .topic {
    line-height: 1.5;
}

.project-caption--meta .icon {
    width: 1em;
    height: 1em;
    fill: var(--color-text);
    margin-right: 0.25em;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Project } from '@/project'
import OrderForm from '@/components/OrderForm.vue'
import ProjectCapture from '@/components/ProjectCapture.vue'
import ScrollIndicator from './components/ScrollIndicator.vue'
import ProjectCaption from '@/components/ProjectCaption.vue'
import AboutThisSite from '@/components/AboutThisSite.vue'

export default defineComponent({
  components: {
    OrderForm,
    ProjectCapture,
    ScrollIndicator,
    ProjectCaption,
    AboutThisSite
  },
  emits: ['mouseenter'],
  data () {
    return {
      projects: [] as Project[],
      currProjectIndex: 0,
      sorting: 'date',
      asc: false,
      observer: null as IntersectionObserver | null,
    }
  },
  mounted () {
    /*
     * Read URL params and modify state if need
     * then query sketches
     */
    this.queryUrlParams()
    fetch('sketch/index.json')
      .then(response => response.json())
      .then(data => {
        this.projects = data.filter((d: Project) => d !== undefined)
        this.sortProjectBy(this.sorting as keyof Project)
        this.addObserver()
      })
  },
  beforeUnmount () {
    const captures = Array.from(document.querySelectorAll('.project-preview'))
    captures.forEach((elem) => {
      this.observer?.unobserve(elem)
    })
  },
  methods: {
    /**
     * Sort projects 
     * @param prop a property of Project (title|date|topic)
     */
    sortProjectBy: function (
      prop: keyof Project
    ): void {
      const d = [...this.projects]
      if (this.asc) {
        this.projects = d.sort((a, b) => (a[prop] < b[prop] ? -1 : 1))
      } else {
        this.projects = d.sort((a, b) => (a[prop] > b[prop] ? -1 : 1))
      }
      this.sorting = prop
      this.setUrlParams({ sorting: prop })

    },
    /**
     * Reverse the projects array
     */
    sortInverse: function (): void {
      this.asc = !this.asc
      this.sortProjectBy(this.sorting as keyof Project)
      this.setUrlParams({ asc: this.asc ? '1' : '0' })
    },
    /**
     * Read URL params
     */
    queryUrlParams: function (): void {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const ascParam = urlParams.get('asc')
      const sortingParam = urlParams.get('sorting')

      if (ascParam !== null) {
        this.asc = ascParam === '1'
      }
      if (sortingParam !== null) {
        this.sorting = sortingParam
      }
    },
    /**
     * Set URL params 
     * @param params with an object of {paramKey: paramValue}
     */
    setUrlParams: function (params: { [key: string]: string }): void {
      const url = new URL(window.location.href)
      Object.keys(params).forEach((key) => {
        if (url.searchParams.has(key)) {
          url.searchParams.set(key, params[key])
        } else {
          url.searchParams.append(key, params[key])
        }
      })
      window.history.pushState({ path: url.href }, '', url.href)
    },
    /**
     * Make vertical scrol horizontal 
     * @param event 
     */
    onWheel (event: WheelEvent) {
      this.$nextTick(() =>
        (this.$refs.scrollableProject as HTMLElement).scrollLeft += event.deltaY)
    },
    /**
     * Add IntersectionObserver to set the current capture/project
     * (Highlighted and described in <ProjectCaption/>) 
     */
    async addObserver () {
      await this.$nextTick();
      const captures = Array.from(document.querySelectorAll('.project-preview'))
      const options: IntersectionObserverInit = {
        root: this.$refs.scrollableProject as Element,
        rootMargin: '0px',
        threshold: 1,
      };
      const callback: IntersectionObserverCallback = (entries: any) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (
            (window.innerWidth < 800 || entry.intersectionRatio > 0.55) &&
            entry.isIntersecting
          ) {
            this.currProjectIndex = captures.indexOf(entry.target as HTMLElement);
          }
        })
      }
      this.observer = new IntersectionObserver(callback, options) as IntersectionObserver
      captures.forEach((elem) => {
        this.observer?.observe(elem)
      })
    }
  }
})
</script>
<template>
  <header>
    <h1>
      <a title="forsaken ideas">
        <img src="./assets/forsaken-ideas.svg" />
      </a>
    </h1>
    <p>A tool to quickly experiment idea, a place for abandoned projects</p>
  </header>

  <main>
    <div class="scrollable-project" ref="scrollableProject" @wheel.prevent="onWheel">
      <ProjectCapture v-for="(item, index) in projects" v-bind:key="index"
        :class="index === currProjectIndex ? 'active' : ''" @mouseover="currProjectIndex = index"
        @focus="currProjectIndex = index" :project="item" :index="index" />
    </div>
    <div class="row">
      <ProjectCaption v-if="projects[currProjectIndex] !== undefined" :project="projects[currProjectIndex]">
        <ScrollIndicator :count="projects.length" :current="currProjectIndex" />
      </ProjectCaption>
      <OrderForm :sorting="sorting" :asc="asc" @sortInverse="sortInverse" @sortProjectBy="sortProjectBy" />
    </div>
    <AboutThisSite :project-count="projects.length" />
  </main>
</template>

<style scoped>
header {
  display: flex;
  padding: 0.5em 1em;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  text-align: center;
}

@media screen and (min-width: 800px) {
  header {
    padding: 0.5em 2em;
  }
}

header h1 {
  display: block;
  margin: 0;
  fill: var(--color-text);
  font-weight: bolder;
  max-width: 260px;
}

header h1 a {
  display: block;
}

header p {
  line-height: 1;
  margin-bottom: 0;
}

@media screen and (min-width: 900px) {
  header {
    flex-flow: row nowrap;
    justify-content: space-between;
    text-align: left;
  }
}

main {
  padding: 0;
  min-height: 100vh;
  max-height: 100vh;
}


.scrollable-project {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  overflow-x: scroll;
  padding: 1em 0 3em 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: linear-gradient(to left, var(--color-solid), var(--color-bg));
  background-attachment: fixed;
}

.scrollable-project::-webkit-scrollbar {
  display: none;
}

.scrollable-project>* {
  flex: 0 0 260px;
  margin: 0 1em;
  max-width: 100%;
}

@media screen and (min-width: 900px) {
  .scrollable-project>* {
    flex: 0 0 20vw;
  }
}

.scrollable-project a.project-preview:first-child {
  margin-left: 60%;
}

.row {
  padding: 0 2em;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
</style>

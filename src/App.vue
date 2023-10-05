<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { Project } from '@/project'
import OrderForm from '@/components/OrderForm.vue'
import ProjectCapture from '@/components/ProjectCapture.vue'
import ProjectCaption from '@/components/ProjectCaption.vue'
import AboutThisSite from '@/components/AboutThisSite.vue'

export default defineComponent({
  components: {
    OrderForm,
    ProjectCapture,
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
    // Check URL and modify data
    this.queryUrlParams()
    // Query sketches
    fetch('sketch/index.json')
      .then(response => response.json())
      .then(data => {
        this.projects = data.filter((d: Project) => d !== undefined)
        this.sortProjectBy(this.sorting as keyof Project)
        this.addObserver()
      })
  },
  methods: {
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
    sortInverse: function (): void {
      this.asc = !this.asc
      this.sortProjectBy(this.sorting as keyof Project)
      this.setUrlParams({ asc: this.asc ? '1' : '0' })
    },
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
    async addObserver() {
      await this.$nextTick();
      const captures = Array.from(document.querySelectorAll('.project-preview'))
      const containerWidth = (this.$refs.scrollableProject as HTMLElement).offsetWidth
      const containerHeight = (this.$refs.scrollableProject as HTMLElement).offsetWidth
      console.log(containerWidth, containerHeight)
      const options: IntersectionObserverInit = {
        root: this.$refs.scrollableProject as Element,
        rootMargin: '0px',
        //rootMargin: `${(containerWidth/2) - 400}px ${(containerHeight/2) - 400}px`,
        threshold: 0.1,
      };
      console.log(options.rootMargin)
      let prevRatio = 0
      const callback: IntersectionObserverCallback = (entries: any) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          const elem = entry.target as HTMLElement 
          const debugBox = elem?.querySelector('.debug-intersection')
          debugBox.innerText = entry.intersectionRatio || 'undefined'
          
          if (
            //entry.intersectionRatio > prevRatio &&
            entry.isIntersecting
            //!(entry.target as HTMLElement).classList.contains('active')
          ) {
            this.currProjectIndex = captures.indexOf(entry.target as HTMLElement);
            (entry.target as HTMLElement).classList.add('active')
          } else {
            (entry.target as HTMLElement).classList.remove('active')
          }
          prevRatio = entry.intersectionRatio;
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
    <OrderForm :sorting="sorting" :asc="asc" @sortInverse="sortInverse" @sortProjectBy="sortProjectBy" />
  </header>

  <main>
    <div class="scrollable-project" ref="scrollableProject">
      <ProjectCapture 
        v-for="(item, index) in projects" 
        v-bind:key="index"
        @mouseover="currProjectIndex = index"
        :project="item" 
        :index="index"
      />
    </div>
    <ProjectCaption v-if="projects[currProjectIndex] !== undefined" :project="projects[currProjectIndex]"/>
    <AboutThisSite :project-count="projects.length" />
  </main>
</template>

<style scoped>
header {
  display: flex;
  padding: 0.5em 2em;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

header h1 {
  display: block;
  margin: 0;
  fill: var(--color-text);
  font-weight: bolder;
  max-width: 30%;
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
  margin-top: 24px;
}


.scrollable-project {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  overflow-x: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
/* 
.scrollable-project::-webkit-scrollbar {
  display: none;
}
 */

.scrollable-project>* {
  flex: 0 0 400px;
  margin: 0 1em;
  max-width: 100%;
}

.scrollable-project a.project-preview:first-child {
  margin-left: 50%;
}

a.project-preview {
    display: block;
    position: relative;
    text-decoration: none;
    transition: all 0.01s ease-in;
    overflow: hidden;
    box-shadow: 0 0.5em 1em var(--color-shadow);
    transition: all 0.01s linear;
}
a.project-preview.active,
a.project-preview:hover {
    background-color: var(--color-secondary);
    box-shadow: 0 1em 1em var(--color-shadow);
    border: 10px solid var(--color-primary);
}

</style>

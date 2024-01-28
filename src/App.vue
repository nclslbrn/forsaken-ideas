<script lang="ts">
import { defineComponent } from 'vue'
import type { Project } from '@/project'
import OrderForm from '@/components/OrderForm.vue'
import ProjectCapture from '@/components/ProjectCapture.vue'
import ScrollIndicator from './components/ScrollIndicator.vue'
import ProjectCaption from '@/components/ProjectCaption.vue'
import AboutThisSite from '@/components/AboutThisSite.vue'
import {isoDate} from '@/isoDate'

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
      whatsThis: false,
      sorting: 'date',
      asc: false,
      observer: null as IntersectionObserver | null,
    }
  },
  mounted () {
    /*
     *Read URL params and modify state if need
     * then query sketches
     */
    this.queryUrlParams()
    fetch(`sketch/index.json?cache=${isoDate()}`)
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
     * Make vertical scroll horizontal 
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
    <main>
    <div class="scrollable-project" v-if="!whatsThis" ref="scrollableProject" @wheel.prevent="onWheel">
      <header>
        <h1 lang="en">Forsa&shy;ken ideas <span>{{projects.length}}&#8594;</span></h1>
      </header>
      <ProjectCapture v-for="(item, index) in projects" v-bind:key="index"
        :class="index === currProjectIndex ? 'active' : ''" @mouseover="currProjectIndex = index"
        @focus="currProjectIndex = index" :project="item" :index="index" />
    </div>
    <AboutThisSite v-if="whatsThis" :project-count="projects.length" />
    <ScrollIndicator :count="projects.length" :current="currProjectIndex" />
    <div class="row">
      <ProjectCaption v-if="projects[currProjectIndex] !== undefined" :project="projects[currProjectIndex]" />
      <OrderForm :sorting="sorting" :asc="asc" @sortInverse="sortInverse" @sortProjectBy="sortProjectBy">
        <button id="toggleAbout" @click.prevent="whatsThis = !whatsThis">
          <svg class="icon icon-question">
            <use xlink:href="#icon-question"></use>
          </svg>
        </button>
      </OrderForm>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0;
  min-height: 100vh;
  max-height: 100vh;
}

#about, 
.scrollable-project {
  height: 85vh;
}

.scrollable-project {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  overflow-x: scroll;
  padding: 3em 0 3em 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: url(./assets/dust.png) repeat;
  background-attachment: fixed;
}

.scrollable-project header {
  max-width: 30vw;
  width: 100%;
  text-align: right;
  overflow: hidden;
}

.scrollable-project header h1 {
  display: block;
  margin: 0 0.1em;
  fill: var(--color-text);
  font-size: 9vw;
  font-weight: 600;
  white-space: normal;
  line-height: 1;
  webkit-hyphens: auto;
  -moz-hyphens: auto;
  -ms-hyphens: auto; 
  hyphens: auto;
  overflow-wrap: break-word;
}

.scrollable-project header h1 span {
  font-size: 0.5em;
}

@media (orientation: portrait) {
  .scrollable-project {
    height: 85vh;
  }
  .scrollable-project header {
    max-width: 60vw;
  }
  .scrollable-project header h1 {
    text-align: left;
    font-size: 18vw;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

.scrollable-project::-webkit-scrollbar {
  display: none;
}

.scrollable-project>* {
  flex: 0 0 260px;
  margin: 0 1.5em;
  max-width: 100%;
}
  
@media screen and (min-width: 900px) {
  .scrollable-project>* {
    flex: 0 0 auto;
    max-width: 30%;
  }
}

.row {
  padding: 0 1em;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--color-solid);
}

#about {
  overflow-y: auto;
}

button#toggleAbout {
  display: inline-flex;
  margin-left: 0.5em;
  padding: 4px;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 1.1em;
  border: none;
}

@media (orientation: landscape) {
  button#toggleAbout {
    border-bottom: 1px solid var(--color-text);
  }

  button#toggleAbout:focus,
  button#toggleAbout:hover {
    border-bottom: 1px solid var(--color-primary);
  }
}

</style>

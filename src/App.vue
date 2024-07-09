<script lang="ts">
import { defineComponent } from 'vue'
import type { Project, Sorting, Params } from '@/project'

import { queryUrlParams, setUrlParams } from '@/methods/params'

import OrderForm from '@/components/OrderForm.vue'
import ProjectCapture from '@/components/ProjectCapture.vue'
import ScrollIndicator from './components/ScrollIndicator.vue'
import ProjectCaption from '@/components/ProjectCaption.vue'
import AboutThisSite from '@/components/AboutThisSite.vue'
import { isoDate } from '@/isoDate'

export default defineComponent({
  components: {
    OrderForm,
    ProjectCapture,
    ScrollIndicator,
    ProjectCaption,
    AboutThisSite
  },
  emits: ['mouseenter'],
  data() {
    return {
      projects: [] as Project[],
      currProjectIndex: 0,
      prevClicked: false,
      whatsThis: false,
      params: {
        sorting: 'date',
        asc: false,
      } as Params,
      observer: null as IntersectionObserver | null,
    }
  },
  mounted() {
    /*
     *Read URL params and modify state if need
     * then query sketches
     */
    this.queryUrlParams()
    fetch(`sketch/index.json?cache=${isoDate()}`)
      .then(response => response.json())
      .then(data => {
        this.projects = data.filter((d: Project) => d !== undefined)
        this.sortProjectBy(this.params.sorting as Sorting)
        this.addObserver()
        if (window.location.hash.substring(1)) {
          const prevSrcHash = window.location.hash.substring(1);
          this.prevClicked = this.projects.indexOf(this.projects.filter((p) => p.src === prevSrcHash)[0]);
          this.currProjectIndex = this.prevClicked;
        }
      })
  },
  beforeUnmount() {
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
    sortProjectBy: function (prop: Sorting): void {
      const d = [...this.projects]
      if (this.params.asc) {
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
      this.params.asc = !this.params.asc
      this.sortProjectBy(this.params.sorting as Sorting)
      this.setUrlParams({ asc: this.params.asc ? '1' : '0' })
    },
    /**
     * Read URL params
     */
    queryUrlParams: function (): void {
      this.params = queryUrlParams(this.params)
    },
    /**
     * Set URL params 
     * @param params with an object of {paramKey: paramValue}
     */
    setUrlParams: function (params: { [key: string]: string }): void {
      setUrlParams(params)
    },
    /**
     * Make vertical scroll horizontal 
     * @param event 
     */
    onWheel(event: WheelEvent) {
      this.$nextTick(() =>
        (this.$refs.theWall as HTMLElement).scrollLeft += event.deltaY)
    },
    /**
     * Add IntersectionObserver to set the current capture/project
     * (Highlighted and described in <ProjectCaption/>) 
     */
    async addObserver() {
      await this.$nextTick();
      const captures = Array.from(document.querySelectorAll('.project-preview'))
      const options: IntersectionObserverInit = {
        root: this.$refs.theWall as Element,
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
    },
    openProject(src: string) {
      console.log(src)
      window.history.pushState(null, null, `#${src}`)
      window.location = `./sketch/${src}/`
    },
    prevProj() {
      if (this.currProjectIndex > 0) {
        this.currProjectIndex--
        this.prevClicked = this.currProjectIndex
        this.scrollToCurrProject()
      }
    },
    nextProj() {
      if (this.currProjectIndex < this.projects.length - 1) {
        this.currProjectIndex++
        this.prevClicked = this.currProjectIndex
        this.scrollToCurrProject()
      }
    },
    async scrollToCurrProject() {
      await this.$nextTick();
      const captures = Array.from(document.querySelectorAll('.project-preview'))
      captures[this.currProjectIndex]?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }
})
</script>
<template>
  <main>
    <!-- A component which indicates the x progression of the viewport in the wall (below) -->
    <ScrollIndicator :count="projects.length" :current="currProjectIndex" />
    <!-- The wall : Vertical scrolling div -->
    <div class="the-wall" v-if="!whatsThis" ref="theWall"> <!-- @wheel.prevent="onWheel" -->
      <header>
        <h1 lang="en">Forsa&shy;ken ideas <span>{{ projects.length }}&#8594;</span></h1>
      </header>
      <ProjectCapture v-for="(item, index) in projects" v-bind:key="index"
        :class="index === currProjectIndex ? 'active' : ''" @mouseover="currProjectIndex = index"
        @openProject="openProject" @focus="currProjectIndex = index" :autofocus="index === prevClicked" :project="item"
        :index="index" />
    </div>
    <AboutThisSite v-if="whatsThis" :project-count="projects.length" />
    <div class="row">
      <ProjectCaption v-if="projects[currProjectIndex] !== undefined" :project="projects[currProjectIndex]"
        @openProject="openProject" />
      <div class="ui">
        <nav>
          <ul>
            <li><button class="prevProj" @click="prevProj">&#60;</button></li>
            <li><label class="projectIdx">{{ currProjectIndex + 1 }} / {{ projects.length }}</label></li>
            <li><button class="prevProj" @click="nextProj">&#62;</button></li>
          </ul>
        </nav>
        <OrderForm :params="params" @sortInverse="sortInverse" @sortProjectBy="sortProjectBy" />
      </div>
      <button id="toggleAbout" @click.prevent="whatsThis = !whatsThis">INFO</button>

    </div>
  </main>
</template>

<style scoped>
#about,
.the-wall {
  height: 85vh;
}

.the-wall {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  overflow-x: scroll;
  padding: 1em 0 1em 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: url(./assets/dust.png) repeat;
  background-attachment: fixed;
}

.the-wall header {
  max-width: 30vw;
  width: 100%;
  text-align: right;
  overflow: hidden;
}

.the-wall header h1 {
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

@media (orientation: portrait) {
  .the-wall {
    height: 85vh;
  }

  .the-wall header {
    max-width: 60vw;
  }

  .the-wall header h1 {
    text-align: left;
    font-size: 18vw;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  form {
    display: none;
  }
}

.the-wall::-webkit-scrollbar {
  display: none;
}

.the-wall>* {
  flex: 0 0 260px;
  margin: 0 1.5em;
  max-width: 100%;
}

@media screen and (min-width: 900px) {
  .the-wall>* {
    flex: 0 0 auto;
    max-width: 30%;
  }
}

.row {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: flex-start;
  align-items: stretch;
  border-top: 1px solid var(--color-border); 
  border-bottom: 1px solid var(--color-border);
  background: var(--color-solid);
}

#about {
  overflow-y: auto;
}
.ui {
  border-right: 1px solid var(--color-border);
}

.ui nav ul {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  padding: 0;
  list-style-type: none;
  width: 100%;
}
.ui nav ul li > * {
  display: block;
  font-size: 1.6em;
  text-align: center;
  line-height: 1.6;
}

.ui nav ul li:nth-child(2) {
  flex-grow: 1;
}

.ui nav ul li {
  border-right: 1px solid var(--color-border);
}
.ui nav ul li:last-child {
  border-right: none;
}

button#toggleAbout {
  color: var(--color-text);
  font-size: 2em;
  writing-mode: vertical-rl;
  text-orientation: mixed;
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

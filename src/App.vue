<script lang="ts">
import { defineComponent } from 'vue'
import type { Project, Sorting, Params } from './project'
import { queryUrlParams, setUrlParams } from './methods/params'
import OrderForm from './components/OrderForm.vue'
import ProjectCapture from './components/ProjectCapture.vue'
import ScrollIndicator from './components/ScrollIndicator.vue'
import ProjectCaption from './components/ProjectCaption.vue'
import AboutThisSite from './components/AboutThisSite.vue'
import { isoDate } from './isoDate'

interface AppData {
  projects: Project[];
  currProjectIndex: number;
  prevClicked: number;
  whatsThis: boolean;
  params: Params,
  observer: IntersectionObserver | null,
  navButtonOccurs: boolean
}
export default defineComponent({
  components: {
    OrderForm,
    ProjectCapture,
    ScrollIndicator,
    ProjectCaption,
    AboutThisSite
  },
  emits: ['mouseenter'],
  data(): AppData {
    return {
      projects: [],
      currProjectIndex: 0,
      prevClicked: -1,
      whatsThis: false,
      params: {
        sorting: 'date',
        asc: false,
      },
      observer: null,
      navButtonOccurs: false
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
          this.prevClicked = this.projects.indexOf(this.projects.filter((p: Project) => p.src === prevSrcHash)[0]);
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
      this.params.sorting = prop
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
      this.$nextTick(() => (this.$refs.theWall as HTMLElement).scrollLeft += event.deltaY)
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
        if (!this.navButtonOccurs) { // prevent selecting back slide when nav button clicked
          entries.forEach((entry: IntersectionObserverEntry) => {
            if (
              (window.innerWidth < 800 || entry.intersectionRatio > 0.55) &&
              entry.isIntersecting
            ) {
              this.currProjectIndex = captures.indexOf(entry.target as HTMLElement);
            }
          })
        }
      }
      this.observer = new IntersectionObserver(callback, options) as IntersectionObserver
      captures.forEach((elem) => {
        this.observer?.observe(elem)
      })
    },
    openProject(src: string) {
      window.history.pushState(null, '', `#${src}`)
      window.location.href = `./sketch/${src}/`
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
      this.navButtonOccurs = true;
      await this.$nextTick(() => {
        const captures = Array.from(document.querySelectorAll('.project-preview'))
        captures[this.currProjectIndex]?.scrollIntoView({
          behavior: 'smooth',
        });
      }).then(() => {
        setTimeout(() => {
          this.navButtonOccurs = false
        }, 125)
      })
    }
  }
})
</script>
<template>
  <main>
    <!-- The wall : Vertical scrolling div -->
    <div class="the-wall" v-if="!whatsThis" ref="theWall" @wheel.prevent="onWheel">
      <header>
        <h1 lang="en">Forsa&shy;ken ideas <span>{{ projects.length }}&#8594;</span></h1>
      </header>
      <ProjectCapture v-for="(item, index) in projects" v-bind:key="index"
        :class="index === currProjectIndex ? 'active' : ''" 
        :autofocus="index === prevClicked" 
        :project="item"
        :index="index"
        @mouseover="currProjectIndex = index"
        @openProject="openProject" 
        @focus="currProjectIndex = index"
      />
    </div>
    <Transition name="slideDown">
      <AboutThisSite v-if="whatsThis" :project-count="projects.length" />
    </Transition>
    <!-- A component which indicates the x progression of the viewport in the wall  -->
    <ScrollIndicator :count="projects.length" :current="currProjectIndex" />

    <div class="row">
      <ProjectCaption v-if="projects[currProjectIndex] !== undefined" :project="projects[currProjectIndex]" @openProject="openProject" />
      
      <div class="ui">
        <nav>
          <ul>
            <li><button class="prevProj" @click="prevProj">&#60;</button></li>
            <li><label class="projectIdx">{{ currProjectIndex + 1 }} / {{ projects.length }}</label><small>projects</small></li>
            <li><button class="prevProj" @click="nextProj">&#62;</button></li>
          </ul>
        </nav>
        <OrderForm :params="params" @sortInverse="sortInverse" @sortProjectBy="sortProjectBy" />
      </div>
      
      <footer>
        <span>
          <p>Nicolas Lebrun</p>
          <p>MIT License</p>
        </span>
        <button id="toggleAbout" @click="whatsThis = !whatsThis">
          {{ whatsThis ? '×' : 'INFO' }}
        </button>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.the-wall,
#about {
  height: 85vh;
  flex-grow: 1;
}
.the-wall::-webkit-scrollbar {
  display: none;
}

.the-wall>* {
  flex: 0 0 260px;
  margin: 0 2.5em;
  max-width: 100%;
}

.the-wall button.project-preview > img {
    max-height: 90%;
    width: auto;
}

@media screen and (max-width: 1080px) {
  .the-wall header {
    max-width: 60vw;
  }

  .the-wall header h1 {
    text-align: left;
    font-size: 18vw;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .ui {
    display: none;
  }

  footer span {
    display: none;
  }
}

@media screen and (min-width: 900px) {
  .the-wall>* {
    flex: 0 0 auto;
    max-width: 35%;
  } 
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

.ui nav ul li:nth-child(2) {
  flex-grow: 1;
}

.ui nav ul li {
  border-right: 1px solid var(--color-border);
}
.ui nav ul li:last-child {
  border-right: none;
}

footer {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  flex-basis: 2.6em;
}

@media screen and (min-width: 900px) {
  footer {
    flex-basis: auto;
  }
}

footer span {
  padding: 1em;
}

footer span p {
  margin: 0
}

button#toggleAbout {
  padding: 0.25em;
  color: var(--color-text);
  font-size: 1.5em;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

</style>

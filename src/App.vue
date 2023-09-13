<script lang="ts">
import { defineComponent } from 'vue';
import type { Project } from '@/project';
import ProjectPreview from '@/components/ProjectPreview.vue';
import AboutThisSite from '@/components/AboutThisSite.vue';

export default defineComponent({
  components: {
    ProjectPreview,
    AboutThisSite
  },
  data () {
    return {
      projects: [] as Project[],
      sorting: 'date',
      asc: false
    }
  },
  setup () {
  },
  mounted () {
    this.queryUrlParams();

    fetch("sketch/index.json")
      .then(response => response.json())
      .then(data =>
        this.projects = this.sortProjectBy(
          data.filter((d: Project) => d !== undefined),
          this.sorting as keyof Project)
      );
  },
  methods: {
    sortProjectBy: function (projects: Project[], prop: keyof Project) {
      if (this.asc) {
        return projects.sort((a, b) => (a[prop] < b[prop]) ? -1 : 1)
      } else {
        return projects.sort((a, b) => (a[prop] > b[prop]) ? -1 : 1)
      }
    },
    sortByName: function () {
      this.projects = this.sortProjectBy(this.projects, 'title');
      this.sorting = 'title';
      this.setUrlParams({ 'sorting': 'title' });
    },
    sortByDate: function () {
      this.projects = this.sortProjectBy(this.projects, 'date');
      this.sorting = 'date';
      this.setUrlParams({ 'sorting': 'date' });
    },
    sortByTopic: function () {
      this.projects = this.sortProjectBy(this.projects, 'topic');
      this.sorting = 'topic'
      this.setUrlParams({ 'sorting': 'topic' });
    },
    sortInverse: function () {
      this.asc = !this.asc;
      this.projects = this.sortProjectBy(this.projects, this.sorting as keyof Project);
      this.setUrlParams({ 'asc': this.asc ? '1' : '0' });
    },
    queryUrlParams: function () {
      console.log(window.location.search)
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
    setUrlParams: function (params: { [key: string]: string }) {
      console.log(window.location.search)
      const url = new URL(window.location.href)
      Object.keys(params).forEach(key => {
        if (url.searchParams.has(key)) {
          url.searchParams.set(key, params[key])
        } else {
          url.searchParams.append(key, params[key])
        }
      })
      window.history.pushState({ path: url.href }, '', url.href);
    }
  }
})
</script>

<template>
  <header>
    <div class="acronym-block">
      <h1>Make</h1>
      <svg class="site-title">
        <use xlink:href="#site-title"></use>
      </svg>
      <p>A tool to quickly experiment idea, a place for abandoned experiments</p>
    </div>
    <form id="order-grid">
      <ul>
        <li>
          <label>
            Sort
            <button class="small" @click.prevent="sortInverse">
              {{ asc ? 'ascending' : 'descending' }}
            </button>
            by
          </label>
        </li>
        <li>
          <ul>
            <li>
              <button :class="{ active: sorting === 'title' }" value="title" @click.prevent="sortByName">
                <svg class="icon icon-sort-alphabetically">
                  <use xlink:href="#icon-sort-alphabetically"></use>
                </svg>
              </button>
            </li>
            <li>
              <button :class="{ active: sorting === 'date' }" value="date" @click.prevent="sortByDate">
                <svg class="icon icon-sort-numerically">
                  <use xlink:href="#icon-sort-numerically"></use>
                </svg>
              </button>
            </li>
            <li>
              <button :class="{ active: sorting === 'topic' }" value="topic" @click.prevent="sortByTopic">
                <svg class="icon icon-tag">
                  <use xlink:href="#icon-tag"></use>
                </svg>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </form>
  </header>

  <main>
    <masonry-wall :items="projects" :column-width="320" :gap="24">
      <template #default="{ item, index }">
        <ProjectPreview :project="item" :index="index" />
      </template>
    </masonry-wall>
    <AboutThisSite />
  </main>
</template>

<style scoped>
main {
  position: relative;
  width: 100%;
}

header {
  display: flex;
  margin: 0 1em;
  width: calc(100% - 2em);
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}

header h1 {
  overflow: hidden;
  width: 1px;
  height: 1px;
}


header .acronym-block svg {
  display: block;
  margin: 0 auto;
  fill: var(--color-text);
}

header .acronym-block p {
  text-align: center;
  padding: 0 3em;
  margin-bottom: 1em;
}

header .acronym-block h1 {
  color: var(--color-primary);
  font-family: monospace;
}

header form#order-grid ul {
  display: none;
}


header form#order-grid ul li label {
  display: inline-flex;
  padding: 1em 0.25em;
  align-items: baseline;
}

header form#order-grid ul li label button {
  margin: 0 0.25em;
}

@media screen and (min-width: 900px) {
  header {
    flex-flow: row nowrap;
    justify-content: space-around;
  }

  header .acronym-block {
    padding: 0 0.5em;
    flex: 0 1 auto;
    display: inline-flex;
    align-items: center;
  }

  header .acronym-block p {
    margin: 0 2em;
    text-align: left;
  }


  header form#order-grid ul {
    padding: 0;
    flex: 2 0 auto;
    display: flex;
    margin: 0.5em 0;
    list-style-type: none;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
  }


  header form#order-grid ul li {
    margin: 0 0.2em;
  }
}

.mansonry-wall {
  max-width: 100%;
}
</style>

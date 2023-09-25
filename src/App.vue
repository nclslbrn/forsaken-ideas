<script lang="ts">
import { defineComponent } from 'vue';
import type { Project } from '@/project';
import ProjectPreview from '@/components/ProjectPreview.vue';
import AboutThisSite from '@/components/AboutThisSite.vue';
export default defineComponent({
  components: {
    ProjectPreview,
    AboutThisSite,
  },
  data () {
    return {
      projects: [] as Project[],
      diplayedProjects: [] as Project[],
      sorting: 'date',
      asc: false,
    }
  },
  mounted () {
    this.queryUrlParams();

    fetch("sketch/index.json")
      .then(response => response.json())
      .then(data =>
        this.projects = this.sortProjectBy(
          data.filter((d: Project) => d !== undefined),
          this.sorting as keyof Project
        ));
  },
  methods: {
    sortProjectBy: function (projects: Project[], prop: keyof Project): Project[] {
      if (this.asc) {
        return projects.sort((a, b) => (a[prop] < b[prop]) ? -1 : 1)
      } else {
        return projects.sort((a, b) => (a[prop] > b[prop]) ? -1 : 1)
      }
    },
    sortByName: function (): void {
      this.projects = this.sortProjectBy(this.projects, 'title');
      this.sorting = 'title';
      this.setUrlParams({ 'sorting': 'title' });
    },
    sortByDate: function (): void {
      this.projects = this.sortProjectBy(this.projects, 'date');
      this.sorting = 'date';
      this.setUrlParams({ 'sorting': 'date' });
    },
    sortByTopic: function (): void {
      this.projects = this.sortProjectBy(this.projects, 'topic');
      this.sorting = 'topic'
      this.setUrlParams({ 'sorting': 'topic' });
    },
    sortInverse: function (): void {
      this.asc = !this.asc;
      this.projects = this.sortProjectBy(this.projects, this.sorting as keyof Project);
      this.setUrlParams({ 'asc': this.asc ? '1' : '0' });
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
    <div>
      <h1>
        <a title="forsaken ideas">
          <img src="./assets/forsaken-ideas.svg">
        </a>
      </h1>
      <p>A tool to quickly experiment idea, a place for abandoned projects</p>
    </div>

    <form id="order-grid">
      <p>
        Sort
        <button class="small" @click.prevent="sortInverse">
          {{ asc ? 'ascending' : 'descending' }}
        </button>
        by
      </p>
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
    </form>
  </header>

  <main>
    <masonry-wall :items="projects" :column-width="400" :gap="24">
      <template #default="{ item, index }">
        <ProjectPreview :project="item" :index="index" />
      </template>
    </masonry-wall>
    <AboutThisSite :project-count="projects.length" />
  </main>
</template>

<style scoped>
header,
main {
  position: relative;
  width: 90%;
  margin: 0 auto;
}

header {
  display: flex;
  padding: 0.5em 0;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

header h1 {
  display: block;
  margin: 0 auto;
  fill: var(--color-text);
  font-weight: bolder;
}

header form,
header form ul {
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
}

header form ul {
  padding: 0;
  margin: 0;
  list-style-type: none;
}


header form#order-grid ul li {
  margin-right: 0.01em;
}


header form#order-grid p {
  display: inline-flex;
  padding: 0 0.3em;
  margin: 0;
  align-items: baseline;
}

header form#order-grid p button {
  margin: 0 0.3em;
}

header form#order-grid ul>li:not(:last-child)>button {
  border-right: none;
  margin-right: 1px;
}

header form#order-grid ul>li:first-child>button {
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
}

header form#order-grid ul>li:last-child>button {
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

header form#order-grid ul li button {
  padding: 0.5em;
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
</style>

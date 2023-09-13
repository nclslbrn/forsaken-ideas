<template>
  <div class="site-description">
    <p>There are many reasons why I decided to create this site/tool.</p>
    <p>I wanted to be able to experiment with an idea by pooling the tools I had previously created.</p>
    <p>It was also about archiving (in a secure and accessible way) projects even if they hadn't come to fruition.</p>
    <p>Finally, this tool was a way for me to share tools and know-how with the #creativeCoding and #generativeArt
      community, which has given me so much. That's why the skeleton of this site and its content are registered under the
      MIT open
      source licence.
    </p>

    <a class="button" href="https://github.com/nclslbrn/make/">
      <svg class="icon icon-forward">
        <use xlink:href="#icon-repo"></use>
      </svg>
      <span>For a more technical description, visit github</span>
    </a>

    <div class="signature">
      <img id="avatar" src="https://avatars.githubusercontent.com/u/1374627?v=1">
      <span>Nicolas Lebrun (<a href="https://nicolas-lebrun.fr/contact/">@nclslbrn</a>)</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AboutThisSite',
}
</script>

<style scoped>
.site-description {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  margin: 3em auto 1em auto;
  padding-top: 2em;
  width: calc(100% - 2em);
  border-top: 6px double var(--color-border);
}

.site-description p {
  font-size: larger;
}

@media screen and (min-width: 900px) {
  .site-description {
    padding: 4em 6em;
  }

  .site-description p {
    align-self: start;
    line-height: 1.6em;
    padding-bottom: 1em;
  }
}

.site-description .signature {
  display: flex;
  align-items: center;
  margin: 2em 0;
}

.site-description img#avatar {
  max-width: 58px;
  height: auto;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  margin-right: 1em;
}

.site-description a.button {
  display: inline-flex;
  margin-top: 2em;
}
</style>
<template>
    <div id="about">
        <h2>Forsaken ideas</h2>
        <h3>Currently, {{ projectCount }} projects archived 
          <button class="small" @click.prevent="switchLang">
            {{ lang === 'en' ? 'fr' : 'en' }}
          </button>
        </h3>
        
        <div class="site-description"> 
            <div v-if="lang === 'en'" class="text-column">
                <div>
                    <p>
                        I can't quite remember how I came to want to create this
                        compilation of programs (2019). I think I wanted to have
                        a sort of gallery (not necessarily published on the web)
                        that could list current projects.
                    </p>
                    <p>
                        To this desire was added the need to integrate my
                        projects into a common core, because I was often using
                        the same tools (functions, JS classes dedicated to a
                        specific operation). I was copying these files,
                        sometimes modifying them and then no longer knowing in
                        which folder the correct version was stored; I looked
                        into the possibility of using bundlers (Gulp, Webpack
                        and now Rollup) to export a multitude of projects from
                        the same configuration (simply by adding a parameter to
                        the command that launches the development environment).
                    </p>
                    <p>
                        Obviously, once I'd created this workflow and used it on
                        a dozen projects, I moved on to other things, but the
                        idea kept coming back: when I found abandoned programs
                        (that hadn't been completed, shown or published as a
                        work), I'd add them to the catalog.
                    </p>
                </div>

                <div>
                    <p>
                        From the initial idea of having a kind of meta-tool that
                        would enable you to quickly move from an idea to a
                        prototype, this catalog has become a refuge for projects
                        in need of love. The status of this playground is still
                        evolving between these two visions, as I appreciate how
                        a technical necessity can over time become an almost
                        poetic object (a collection of abandoned ideas or
                        self-censored projects).
                    </p>
                    <p>
                        This archiving is a kind of performance (maintaining the
                        ecosystem and feeding it with new projects).
                    </p>
                    <p>
                        From the start, I've wanted this archive to be open, and
                        that's why I've published it under the MIT license, to
                        give back to the #creativeCoding and #generativeArt
                        community for all it's given me.
                    </p>
                    <p>
                        This source is quite raw: no article, no video, just the
                        code (with few comments), but you can experience the
                        projects live from this address.
                    </p>
                </div>
            </div>

            <div v-if="lang === 'fr'" class="text-column">
                <div>
                    <p>
                        Je ne me rappelle plus très bien comment j’ai eu envie
                        de créer cette compilation de programmes (2019). Je
                        pense que je voulais avoir une sorte de galerie (pas
                        forcément publiée sur le web) qui puisse lister les
                        projets en cours.
                    </p>

                    <p>
                        À cette envie, c’est ajouté la nécessité d’intégrer mes
                        projets dans un tronc commun parce que j’utilisais
                        souvent les mêmes outils (des fonctions, des classes JS
                        qui sont dédiées à une opération spécifique). Je copiais
                        ces fichier, parfois, je le modifiais et par la suite,
                        je ne savais plus dans quel dossier était la bonne
                        version ; j’ai étudié la possibilité d’utiliser les
                        bundlers (Gulp, Webpack et maintenant Rollup) pour
                        qu’ils puissent exporter une multitude de projets à
                        partir de la même configuration (simplement en ajoutant
                        un paramètre à la commande qui permet de lancer
                        l’environnement de développement).
                    </p>
                    <p>
                        Évidemment après avoir créé ce workflow et après l’avoir
                        utilisé sur une dizaine de projets, je suis passé à
                        autre chose mais l’idée revenait souvent, quand je trouvais
                        des programmes abandonnés (qui n’avait pas aboutis, pas
                        montrés ou publiés en tant qu’œuvre), je les ajoutais au
                        catalogue.
                    </p>
                </div>
                <div>
                    <p>
                        De l’idée initiale d’avoir une sorte de méta-outil qui
                        permette de rapidement passer d’une idée à un prototype,
                        ce catalogue est devenu un refuge pour projets en manque
                        d’amour. Le statut de cette aire de jeu évolue encore
                        entre ces deux visions. La nécessité
                        technique est devenu avec le temps un objet presque
                        poétique (recueil d’idées abandonnées ou de projets
                        autocensurés).
                    </p>

                    <p>
                        Cet archivage est en quelque sorte une performance
                        (maintenir l'écosystème et l'alimenter en projets
                        neufs).
                    </p>

                    <p>
                        Depuis le début, j’ai voulu que cette archive soit
                        ouverte et c’est pour ça que je l’ai publié sous licence
                        MIT, il s'agit sans doute de rendre à la communauté
                        #creativeCoding et #generativeArt tout ce qu'elle a pu
                        me donner.œ
                    </p>

                    <p>
                        La forme est bien assez brute, pas d’article, pas de
                        vidéo, juste le code (avec peu de commentaires) mais
                        vous pouvez expérimenter les projets en live depuis
                        cette adresse.
                    </p>
                </div>
            </div>
            <a class="button" href="https://github.com/nclslbrn/make/">
                <svg class="icon icon-forward">
                    <use xlink:href="#icon-repo"></use>
                </svg>
                <span>For a technical description, visit github</span>
            </a>

            <div class="signature">
                <img id="avatar" src="https://avatars.githubusercontent.com/u/1374627?v=1" />
                <span>Nicolas Lebrun (<a href="https://nicolas-lebrun.fr/contact/">@nclslbrn</a>)</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'AboutThisSite',
    data () {
        return { lang: 'en' }
    },
    props: {
        projectCount: Number
    },
    methods: {
        switchLang: function(): void {
            this.lang = (this.lang === 'en') ? 'fr' : 'en'
        }
    }
}
</script>

<style scoped>
#about {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    padding: 1em;
    width: 100%;
    background-color: var(--color-solid);
    z-index: 1;
}

#about h2 {
  font-weight: 300;
  font-size: 4.5em;
}

#about h2,
#about h3 {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

#about h3 button {
  margin-left: 1em;
}

#about>div {
    display: flex;
    flex-flow: column nowrap;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
}

.site-description p {
    clear: both;
    float: none;
    font-size: 1.2em;
    line-height: 1.5em;
    font-weight: 400;
}

.site-description button.small {
    display: block;
    margin: 1em auto 3em;
}

@media screen and (min-width: 900px) {
    .site-description {
      padding: 2em 6em;
    }

    .text-column {
       display: block;
       column-count: 3;
       column-gap: 40px;
    }

    .site-description p {
        text-align: justify;
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
    padding: 1em 1.35em 1em 1em;
    margin-top: 2em;
    align-items: center;
}

.site-description a.button svg {
    margin-right: 0.25em;
}
</style>

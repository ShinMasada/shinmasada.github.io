# Shin Masada's site

Open `index.html` in a browser to preview. No build step.

The first project card links to `class-cue.html`, the Class Cue case study. Its
styles, slide viewer, ten slide previews, and original PDF live in
`assets/class-cue/`. Include that folder and `class-cue.html` when publishing
the site. The deck can be viewed inline, opened full size, or downloaded.

Project slots 2 and 3 link to `food-access-la.html` and `spoken-signs.html`.
Both describe work in progress, use the supplied project logos, and share the
case-study styles. Publish all three project HTML files and the complete
`assets/` folder together with `index.html`.

Run the interaction checks with `node --test tests/*.test.cjs`.

## Publish free on GitHub Pages
1. On github.com, create a new public repository (e.g. `shinmasada.github.io`, or any name).
2. Upload `index.html` (and this README) to the repo: Add file → Upload files → Commit.
3. Go to Settings → Pages. Under "Build and deployment", set Source to "Deploy from a branch", Branch to `main` / root, and Save.
4. After a minute or two your site is live at `https://<your-username>.github.io/<repo-name>/`
   (or `https://<your-username>.github.io/` if the repo is named `<your-username>.github.io`).

## Things to edit
- GitHub link: search `YOUR-GITHUB-USERNAME` in `index.html`.
- Projects: the `for(let i=1;i<=6;i++)` loop builds the placeholder cards.
- Skills: the bar list under `// projects + skills` (height % and color per bar). Bar labels live in the "Expert / Advanced…" axis.

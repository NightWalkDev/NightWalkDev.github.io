# Editing the site

Everything you normally change is a content file. Save it with `npm run dev` running and the page at http://localhost:4321 updates by itself. If a file has a mistake, the page shows an error naming the file and the line.

## Where things are

| To change… | Edit |
| --- | --- |
| Name, role, intro, Open to work badge, hero buttons | `src/content/site.yaml` → `hero` |
| The Focus / Engines / Based in boxes | `src/content/site.yaml` → `profile` |
| Home page sections: order, titles, notes, colors | `src/content/site.yaml` → `sections` |
| Contact links and text | `src/content/site.yaml` → `contact` |
| The 3D preview (solar system or a model) | `src/content/site.yaml` → `preview` |
| Which header color each engine gets | `src/content/site.yaml` → `engineColors` |
| A game project | `src/content/projects/<name>.md` |
| A prototype | `src/content/prototypes/<name>.md` |
| A music or art tile | `src/content/art/<name>.md` |
| The theme colors themselves | `src/styles/theme.css` |
| Images, gifs, clips | `public/media/` |
| 3D models (.glb) | `public/models/` |

## Colors

Anywhere a `color` is asked, write a theme color name (`yellow`, `rust`, `green`, `cream`, `teal`, `panel`) or a hex value (`"#34D3E8"`, with quotes). Text on top of the color is picked automatically.

To change what "rust" looks like everywhere, edit `--rust` in `src/styles/theme.css`.

## Add a project

1. Duplicate a file in `src/content/projects/` and rename it. The file name becomes the page address: `my-game.md` → `/projects/my-game/`.
2. Put the cover image in `public/media/` and point `cover:` to it (`/media/my-game.jpg`).
3. Set `order:` to place it (1 = first). The first two projects (see `featured` in site.yaml) get the big top row.
4. Write the page below the second `---` in Markdown.

Prototypes and art tiles work the same way in their own folders. To hide something without deleting it, add `draft: true`.

## Writing a page (Markdown)

```markdown
## A heading

A paragraph with **bold**, *italic* and a [link](https://example.com).

- a list item
- another one

![What the image shows](/media/my-gif.gif)

<video src="/media/my-clip.mp4" autoplay muted loop playsinline></video>

<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Video title" allowfullscreen></iframe>
```

Code blocks get syntax highlighting: write three backticks followed by the language (`csharp`, `cpp`), the code, then three backticks.

## Media tips

- Prefer short `.mp4` clips over gifs: same clip, often 5 to 10 times lighter.
- Long videos: upload to YouTube and embed them.
- Images are shown dithered on the home page and in full on hover. Nothing to do on your side: the dithering is automatic. Its look is set by `dither` in `site.yaml` (`enabled`, `resolution` = pixel size, `levels` = number of shades).

## The 3D preview

`preview.scene: solar` shows the solar system; `model` shows the `.glb` from `preview.model`. Camera, light, sun, orbits and each planet are set right there (sizes and speeds use the same units as the mockup Tweaks). A planet gets an atmosphere halo with `atmosphere: "#hex"` and a ring with `ring: "#hex"`.

## Trailer at the top of a page

Add `trailer:` with a YouTube link to a project or prototype file. It replaces the cover image at the top of that page (the cover is still used on the home page card):

```yaml
trailer: https://www.youtube.com/watch?v=2ErvaO8SYFg
```

## 3D models on a page

A project or prototype can show its own model on its page: add `model: /models/my-model.glb` to its file. Export models as `.glb` without compression, under 20,000 triangles.

## Publishing

Commit and push with Fork. GitHub builds and publishes in 1 to 2 minutes (repository → Actions tab). A red X means the build failed: the live site keeps its previous version; open the run, read the last red lines, fix and push again.

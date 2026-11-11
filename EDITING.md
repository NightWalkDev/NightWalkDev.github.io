# Editing the site

Everything you normally change is a content file. Save it with `npm run dev` running and the page at http://localhost:4321 updates by itself. If a file has a mistake, the page shows an error naming the file and the line.

## Where things are

| To change… | Edit |
| --- | --- |
| Name, role, intro, Open to work badge (text and `badgeColor`), hero buttons | `src/content/site.yaml` → `hero` |
| The Focus / Engines / Based in boxes | `src/content/site.yaml` → `profile` |
| Home page sections: order, titles, notes, colors | `src/content/site.yaml` → `sections` |
| Contact links and text | `src/content/site.yaml` → `contact` |
| The 3D preview (solar system or a model) | `src/content/site.yaml` → `preview` |
| Which header color each engine gets | `src/content/site.yaml` → `engineColors` |
| A game project | `src/content/projects/<name>.md` |
| A prototype | `src/content/prototypes/<name>.md` |
| A music release (album, EP, single) | `src/content/music/<name>.md` |
| An art piece | `src/content/art/<name>.md` |
| Text and color of the Music and Art pages | `src/content/site.yaml` → `musicPage`, `artPage` |
| The theme colors themselves | `src/styles/theme.css` |
| Images, gifs, clips | `public/media/` |
| 3D models (.glb) | `public/models/` |

## Colors

Anywhere a `color` is asked, write a theme color name or a hex value (`"#34D3E8"`, with quotes). Text on top of a theme color is set in `theme.css`; on a hex value it is picked automatically.

| Name | Used for |
| --- | --- |
| `crimson` | Game projects, View projects button, Album tag |
| `plum` | Unreal Engine cards, Based in box |
| `cream` | Contact |
| `amber` | Prototypes, Single tag, hover highlight |
| `orange` | Music |
| `mint` | Art, EP tag |
| `coral` | Music & digital art box, Engines box |
| `mauve` | Unity cards, Focus box, Open to work badge |
| `wine` | Only in the diamond band under the hero |
| `panel` | Neutral dark header |

To change what "crimson" looks like everywhere, edit `--crimson` (and `--on-crimson`, its text color) in `src/styles/theme.css`. The old names `rust`, `yellow`, `green` and `teal` still work and map to `crimson`, `amber`, `mint` and `mint`.

## Add a project

1. Duplicate a file in `src/content/projects/` and rename it. The file name becomes the page address: `my-game.md` → `/projects/my-game/`.
2. Put the cover image in `public/media/` and point `cover:` to it (`/media/my-game.jpg`).
3. Set `order:` to place it (1 = first). The first two projects (see `featured` in site.yaml) get the big top row.
4. Write the page below the second `---` in Markdown.

Prototypes, music releases and art pieces work the same way in their own folders. To hide something without deleting it, add `draft: true`.

## Link buttons

Every external link (contact box, music listen links) is a button like View projects, showing the site's logo in black. In `site.yaml` → `contact.links`, each link has a `label` (shown in grey under the button on hover), `href`, `icon` (an SVG in `public/media/icons/`) and `color` (the palette color closest to that site's own color). The music platforms' colors are in `src/lib/music.ts`.

## Music releases

Each release is a file in `src/content/music/`. `order: 1` is the newest: it opens first on the Music page and sits on the left of the timeline.

- `type` (Album, EP or Single) and `year` are optional; they show in the headers and the timeline when set.
- Under `links`, fill only the platforms where the release exists (`soundcloud`, `spotify`, `youtubeMusic`): each filled link gets a button, empty ones don't. The `soundcloud` link also puts the SoundCloud player on the page (a track or a set/playlist link both work).
- `tracks` is optional: your own tracklist with lengths. A SoundCloud set already lists its tracks in the player.
- Text written under the second `---` shows next to the player (a short description, credits...).

## Art pieces

Each piece is a file in `src/content/art/`. `year` and `tools` are optional; text under the second `---` becomes the caption in the viewer.

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
- Card images get CRT scanlines that disappear on hover. Nothing to do on your side. Their look is set by `scanlines` in `site.yaml` (`enabled`, `darkness`, `spacing`).

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

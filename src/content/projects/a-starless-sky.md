---
title: "A Starless Sky"
engine: Unreal Engine 5
role: Boat controller, camera, interactions, map
scope: 1 year · team of 11
cover: /media/images/thumbnails/a-starless-sky.png
coverAlt: A Starless Sky key art
trailer : https://www.youtube.com/watch?v=MvE6f_5cxbA
order: 1
# color: rust          # optional: overrides the header color picked from the engine
# model: /models/my-model.glb   # optional: shows a 3D preview on this page
# links:
#   - label: Steam page
#     href: https://store.steampowered.com/
---

## Overview

A Starless Sky is a single player, 3rd person exploration game in which you play as a lone sailor in a quest to restore the fallen stars.

My tasks :
- Make a **player boat controller** with satisfying flow and controls to travel across the open world
- Make a cinematic, immersive, but responsive **Camera controller**
- Make the **Level interactions** scattered across the map
- Make **Map features** for players to visualize the game world, add notes and guess their location
- **Menus & Settings** for accessibility and development utilities

Even though I had made several games with Unity in the past, this was my first time using Unreal Engine to make a 
full-size game, so I had to learn everything from scratch.

In this page, I'll mostly discuss the features I made and how I achieved them. 
I'll try to keep things as easy to read as possible, but be warned some sections may contain some technical terms.

### Player Controller
In "A Starless Sky", players explore large desertic areas which contain several points of interest scattered all over its surface.
To traverse the map and reach their goal, they use a wooden sail boat which allows them to move around.

To make the player controller, I used Unreal's default 3rd person character blueprint as a base, 
and made a custom class to override `CharacterMovementComponent` (which I'll call "CMC" from now on). 
This way I could precisely code how the boat is controlled and add custom behaviors as needed.

## Credits

### Art
Louis LEROY,
Victoria YSSEMBOURG,
Liangwei SMITH,
Ernest LANOY,
Alexis THIERS

### Design
Marie VALLEE,
Luc CARRANT,
Liz GUILBERT

<!--
Ideas for this page: what the game is in two lines, what you built,
one gif or video per system, a short code snippet, what you learned.
Images go in public/media/images and are written like this
(no spaces in file names: use dashes):
![Short description](/media/images/page-content/images/my-image.png)
-->

// Tiny software renderer for the dithered 3D previews (solar system or a .glb model).
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const CAMERA_DISTANCE = 3.6;
const DEG = Math.PI / 180;

const hexToRgb = (hex) => {
  let s = String(hex || '').replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) || 0);
};

function icosphere(levels) {
  const t = (1 + Math.sqrt(5)) / 2;
  let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const normalize = (p) => { const l = Math.hypot(p[0], p[1], p[2]); return p.map((c) => c / l); };
  v = v.map(normalize);
  for (let level = 0; level < levels; level++) {
    const cache = {};
    const mid = (a, b) => {
      const key = a < b ? a + '_' + b : b + '_' + a;
      if (cache[key] === undefined) { v.push(normalize(v[a].map((c, i) => (c + v[b][i]) / 2))); cache[key] = v.length - 1; }
      return cache[key];
    };
    f = f.flatMap(([a, b, c]) => { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]; });
  }
  return { v, f };
}

const PLANET_MESH = icosphere(0);
const SUN_MESH = icosphere(2);

export function parseGlb(buffer) {
  const dv = new DataView(buffer);
  if (buffer.byteLength < 20 || dv.getUint32(0, true) !== 0x46546c67) throw new Error('Not a .glb file.');
  let offset = 12, json = null, bin = null;
  while (offset + 8 <= buffer.byteLength) {
    const length = dv.getUint32(offset, true), type = dv.getUint32(offset + 4, true), start = offset + 8;
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, length)));
    else if (type === 0x004e4942) bin = new DataView(buffer, start, length);
    offset = start + length;
  }
  if (!json || !bin) throw new Error('This .glb has no mesh data.');
  if ((json.extensionsUsed || []).some((e) => /draco|meshopt/i.test(e))) throw new Error('Compressed .glb files are not supported. Export with compression turned off.');
  const SIZE = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 }, COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const readAccessor = (index) => {
    const a = json.accessors[index], view = json.bufferViews[a.bufferView], n = COMPONENTS[a.type], size = SIZE[a.componentType];
    const stride = view.byteStride || n * size, base = (view.byteOffset || 0) + (a.byteOffset || 0), out = [];
    const get = { 5126: (o) => bin.getFloat32(o, true), 5125: (o) => bin.getUint32(o, true), 5123: (o) => bin.getUint16(o, true), 5121: (o) => bin.getUint8(o) }[a.componentType];
    for (let k = 0; k < a.count; k++) {
      const row = [];
      for (let c = 0; c < n; c++) row.push(get(base + k * stride + c * size));
      out.push(n === 1 ? row[0] : row);
    }
    return out;
  };
  const multiply = (A, B) => {
    const R = new Array(16).fill(0);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) R[c * 4 + r] += A[k * 4 + r] * B[c * 4 + k];
    return R;
  };
  const localMatrix = (node) => {
    if (node.matrix) return node.matrix;
    const [x, y, z, w] = node.rotation || [0, 0, 0, 1], [sx, sy, sz] = node.scale || [1, 1, 1], [tx, ty, tz] = node.translation || [0, 0, 0];
    return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1];
  };
  const v = [], f = [];
  const walk = (nodeIndex, parent) => {
    const node = json.nodes[nodeIndex], M = multiply(parent, localMatrix(node));
    const det = M[0] * (M[5] * M[10] - M[9] * M[6]) - M[4] * (M[1] * M[10] - M[9] * M[2]) + M[8] * (M[1] * M[6] - M[5] * M[2]);
    if (node.mesh !== undefined) for (const primitive of json.meshes[node.mesh].primitives) {
      if (primitive.mode !== undefined && primitive.mode !== 4) continue;
      const positions = readAccessor(primitive.attributes.POSITION), base = v.length;
      for (const [x, y, z] of positions) v.push([M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]]);
      const indices = primitive.indices !== undefined ? readAccessor(primitive.indices) : positions.map((_, i) => i);
      for (let i = 0; i + 2 < indices.length; i += 3) {
        f.push(det < 0 ? [base + indices[i], base + indices[i + 2], base + indices[i + 1]] : [base + indices[i], base + indices[i + 1], base + indices[i + 2]]);
      }
    }
    (node.children || []).forEach((child) => walk(child, M));
  };
  const roots = json.scenes ? json.scenes[json.scene || 0].nodes : json.nodes.map((_, i) => i);
  roots.forEach((n) => walk(n, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
  if (!f.length) throw new Error('No triangles found in this .glb.');
  return { v, f };
}

export function fitMesh(raw, front = '-Z') {
  const turn = { '+Z': ([x, y, z]) => [-x, y, -z], '-Z': (p) => p, '+X': ([x, y, z]) => [z, y, -x], '-X': ([x, y, z]) => [-z, y, x] }[front] || ((p) => p);
  const v = raw.v.map(turn), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  v.forEach((p) => p.forEach((c, i) => { lo[i] = Math.min(lo[i], c); hi[i] = Math.max(hi[i], c); }));
  const centre = lo.map((c, i) => (c + hi[i]) / 2);
  const centred = v.map((p) => p.map((c, i) => c - centre[i]));
  const radius = Math.max(...centred.map((p) => Math.hypot(p[0], p[1], p[2]))) || 1;
  const fitted = centred.map((p) => p.map((c) => (c * 1.45) / radius));
  const f = raw.f.filter(([a, b, c]) => {
    const A = fitted[a], B = fitted[b], C = fitted[c];
    const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    return Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]) > 1e-7;
  });
  return { v: fitted, f };
}

function modelPalette(hex) {
  const c = hexToRgb(hex), rust = [224, 74, 47];
  const mix = (a, b, k) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
  return [[38, 20, 16], mix(mix(c, rust, 0.6), [0, 0, 0], 0.45), mix(c, rust, 0.35), c, mix(c, [255, 255, 255], 0.55)];
}

function makeView(rx, ry) {
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  return ([x, y, z]) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy; return [x1, y * cx - z1 * sx, y * sx + z1 * cx]; };
}

function makeRaster(W, H) {
  const img = new ImageData(W, H), px = img.data, zb = new Float32Array(W * H).fill(Infinity);
  const tri = (a, b, c, col) => {
    const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(area) < 1e-6) return;
    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const qx = x + 0.5, qy = y + 0.5;
      const w0 = ((c[0] - b[0]) * (qy - b[1]) - (c[1] - b[1]) * (qx - b[0])) / area;
      const w1 = ((a[0] - c[0]) * (qy - c[1]) - (a[1] - c[1]) * (qx - c[0])) / area;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const z = w0 * a[2] + w1 * b[2] + w2 * c[2], i = y * W + x;
      if (z >= zb[i]) continue;
      zb[i] = z;
      const j = i * 4;
      px[j] = col[0]; px[j + 1] = col[1]; px[j + 2] = col[2]; px[j + 3] = 255;
    }
  };
  return { img, px, zb, tri };
}

function drawModel(ctx, mesh, rx, ry, o) {
  const W = ctx.canvas.width, H = ctx.canvas.height, d = CAMERA_DISTANCE, fov = Math.min(W, H) * o.zoom;
  const view = makeView(rx, ry), p = mesh.v.map(view), L = o.light;
  const proj = ([x, y, z]) => { const s = o.ortho ? fov / d : fov / (z + d); return [W / 2 + x * s, H / 2 - y * s, z + d]; };
  const { img, px, tri } = makeRaster(W, H);
  for (const [a, b, c] of mesh.f) {
    const A = p[a], B = p[b], C = p[c];
    const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const g = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3];
    if (o.ortho ? n[2] > 0 : n[0] * g[0] + n[1] * g[1] + n[2] * (g[2] + d) > 0) continue;
    const lit = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / Math.hypot(n[0], n[1], n[2]));
    const k = (0.12 + 0.88 * lit) * 255;
    tri(proj(A), proj(B), proj(C), [k, k, k]);
  }
  const palette = o.palette, n = palette.length;
  for (let i = 0; i < W * H; i++) {
    const j = i * 4;
    if (!px[j + 3]) continue;
    const t = (BAYER[((i / W) & 3) * 4 + ((i % W) & 3)] + 0.5) / 16 - 0.5;
    const lum = px[j] / 255;
    const c = palette[Math.max(0, Math.min(n - 1, Math.round((lum + t / (n - 1)) * (n - 1))))];
    px[j] = c[0]; px[j + 1] = c[1]; px[j + 2] = c[2];
  }
  ctx.putImageData(img, 0, 0);
}

function drawSolarSystem(ctx, o, rx, ry, time) {
  const W = ctx.canvas.width, H = ctx.canvas.height, d = CAMERA_DISTANCE, fov = Math.min(W, H) * o.zoom;
  const view = makeView(rx, ry);
  const proj = (p) => { const [x, y, z] = view(p), s = o.ortho ? fov / d : fov / (z + d); return [W / 2 + x * s, H / 2 - y * s, z + d, s]; };
  const { img, px, zb, tri } = makeRaster(W, H);
  const s = o.solar, sun = s.sun, orbits = s.orbits, planets = s.planets;

  const body = (mesh, c, R, col, emissive) => {
    const world = mesh.v.map((p) => [c[0] + p[0] * R, c[1] + p[1] * R, c[2] + p[2] * R]), screen = world.map(proj);
    for (const [a, b, e] of mesh.f) {
      const g = [0, 1, 2].map((i) => (world[a][i] + world[b][i] + world[e][i]) / 3), n = g.map((v, i) => v - c[i]);
      const nn = Math.hypot(n[0], n[1], n[2]) || 1;
      let k;
      if (emissive) k = 0.8 + 0.45 * Math.max(0, -view(n)[2] / nn);
      else {
        const lit = -(n[0] * g[0] + n[1] * g[1] + n[2] * g[2]) / ((Math.hypot(g[0], g[1], g[2]) || 1) * nn);
        k = 0.22 + 0.9 * Math.pow(0.5 + 0.5 * lit, 1.6);
      }
      tri(screen[a], screen[b], screen[e], col.map((v) => Math.min(255, v * k)));
    }
  };
  const glow = (c, R, col, reach, strength, inner) => {
    const [X, Y, Z, scale] = proj(c), rs = R * scale, rg = rs * (1 + reach);
    const x0 = Math.max(0, Math.floor(X - rg)), x1 = Math.min(W - 1, Math.ceil(X + rg));
    const y0 = Math.max(0, Math.floor(Y - rg)), y1 = Math.min(H - 1, Math.ceil(Y + rg));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dist = Math.hypot(x + 0.5 - X, y + 0.5 - Y), i = y * W + x;
      if (dist > rg || dist < rs * inner || zb[i] < Z - R) continue;
      let f = Math.max(0, Math.min(1, 1 - Math.max(0, dist - rs) / (rg - rs || 1)));
      f *= f * strength;
      if (f < 0.02) continue;
      const j = i * 4, empty = px[j + 3] === 0;
      for (let ch = 0; ch < 3; ch++) px[j + ch] = Math.min(255, (empty ? 0 : px[j + ch]) + col[ch] * f);
      px[j + 3] = 255;
    }
  };

  const count = planets.length, radii = [sun.size + orbits.spacing];
  for (let i = 1; i < count; i++) radii.push(radii[i - 1] + orbits.spacing * Math.pow(orbits.spacingRatio, i - 1));
  const reach = Math.max(sun.size * (1 + sun.glow * 0.5), ...planets.map((pl, i) => radii[i] + pl.size * (pl.ring ? 2.25 : pl.atmosphere ? 1.6 : 1)));
  const fit = Math.min(1.3, 2.15 / reach), sunR = sun.size * fit;
  const orbit = (i) => radii[i] * fit;
  const positions = planets.map((pl, i) => {
    const angle = i * 2.1 + time * orbits.speed * 1.2 * Math.pow(orbits.speedRatio, i);
    return [Math.cos(angle) * orbit(i), 0, Math.sin(angle) * orbit(i)];
  });

  body(SUN_MESH, [0, 0, 0], sunR, sun.color, true);
  planets.forEach((pl, i) => {
    const c = positions[i], R = pl.size * fit;
    body(PLANET_MESH, c, R, pl.color, false);
    if (!pl.ring) return;
    const tilt = 0.45, seg = 28, r0 = R * 1.45, r1 = R * 2.25, ll = Math.hypot(c[0], c[1], c[2]) || 1;
    const k = 0.5 + 0.5 * Math.abs((Math.cos(tilt) * -c[1] + Math.sin(tilt) * -c[2]) / ll), col = pl.ring.map((v) => v * k);
    const ringPoint = (a, r) => { const lx = Math.cos(a) * r, lz = Math.sin(a) * r; return proj([c[0] + lx, c[1] - lz * Math.sin(tilt), c[2] + lz * Math.cos(tilt)]); };
    for (let q = 0; q < seg; q++) {
      const a0 = (q / seg) * Math.PI * 2, a1 = ((q + 1) / seg) * Math.PI * 2;
      const p00 = ringPoint(a0, r0), p01 = ringPoint(a0, r1), p10 = ringPoint(a1, r0), p11 = ringPoint(a1, r1);
      tri(p00, p01, p11, col); tri(p00, p11, p10, col);
    }
  });

  if (orbits.show) {
    const oc = orbits.color.map((v) => v * 0.5);
    planets.forEach((_, i) => {
      const D = orbit(i), steps = 140;
      let prev = proj([D, 0, 0]);
      for (let q = 1; q <= steps; q++) {
        const a = (q / steps) * Math.PI * 2, cur = proj([Math.cos(a) * D, 0, Math.sin(a) * D]);
        const len = Math.max(1, Math.ceil(Math.max(Math.abs(cur[0] - prev[0]), Math.abs(cur[1] - prev[1]))));
        for (let t = 0; t <= len; t++) {
          const u = t / len, x = Math.floor(prev[0] + (cur[0] - prev[0]) * u), y = Math.floor(prev[1] + (cur[1] - prev[1]) * u);
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const idx = y * W + x, z = prev[2] + (cur[2] - prev[2]) * u, j = idx * 4;
          if (z >= zb[idx] || px[j + 3]) continue;
          px[j] = oc[0]; px[j + 1] = oc[1]; px[j + 2] = oc[2]; px[j + 3] = 255;
        }
        prev = cur;
      }
    });
  }

  glow([0, 0, 0], sunR, sun.color, sun.glow, 0.95, 0.9);
  planets.forEach((pl, i) => { if (pl.atmosphere) glow(positions[i], pl.size * fit, pl.atmosphere, 0.55, 0.8, 0.9); });

  const levels = 5;
  for (let i = 0; i < W * H; i++) {
    const j = i * 4;
    if (!px[j + 3]) continue;
    const t = (BAYER[((i / W) & 3) * 4 + ((i % W) & 3)] + 0.5) / 16 - 0.5;
    for (let ch = 0; ch < 3; ch++) px[j + ch] = Math.max(0, Math.min(1, Math.round((px[j + ch] / 255 + t / levels) * levels) / levels)) * 255;
    if (!px[j] && !px[j + 1] && !px[j + 2]) px[j + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
}

function normalizeConfig(cfg) {
  const cam = cfg.camera || {}, solar = cfg.solar || {}, sun = solar.sun || {}, orbits = solar.orbits || {};
  const az = (cfg.light?.angle ?? 45) * DEG, el = (cfg.light?.height ?? -65) * DEG;
  return {
    scene: cfg.scene === 'model' ? 'model' : 'solar',
    resolution: cfg.resolution ?? 160,
    zoom: cam.zoom ?? 0.7, zoomMin: cam.zoomMin ?? 0.2, zoomMax: cam.zoomMax ?? 2,
    tilt: (cam.tilt ?? 25) * DEG, spin: (cam.spin ?? (cfg.scene === 'model' ? 40 : 0)) * DEG, ortho: !!cam.ortho,
    light: [Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)],
    palette: modelPalette(cfg.modelColor || '#FFC83D'),
    solar: {
      sun: { color: hexToRgb(sun.color || '#FFC83D'), size: sun.size ?? 0.5, glow: sun.glow ?? 1 },
      orbits: {
        show: orbits.show ?? true, color: hexToRgb(orbits.color || '#A89A84'), speed: orbits.speed ?? 0.3,
        speedRatio: orbits.speedRatio ?? 0.5, spacing: orbits.spacing ?? 0.5, spacingRatio: orbits.spacingRatio ?? 1.3,
      },
      planets: (solar.planets || []).map((p) => ({
        color: hexToRgb(p.color), size: p.size ?? 0.15,
        atmosphere: p.atmosphere ? hexToRgb(p.atmosphere) : null, ring: p.ring ? hexToRgb(p.ring) : null,
      })),
    },
  };
}

export function mountPreview(canvas, rawConfig) {
  const o = normalizeConfig(rawConfig);
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.height = o.resolution;
  let mesh = null;
  if (o.scene === 'model') {
    fetch(rawConfig.model)
      .then((r) => { if (!r.ok) throw new Error('Model not found: ' + rawConfig.model); return r.arrayBuffer(); })
      .then((buf) => { mesh = fitMesh(parseGlb(buf), rawConfig.modelFront || '-Z'); })
      .catch((err) => console.error('[preview]', err));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const idle = reduceMotion ? 0 : o.spin / 60;
  let rx = -o.tilt, ry = 0.4, vx = 0, vy = idle, drag = null, pinch = 0, zoom = o.zoom, time = 0, last = performance.now();
  let raf = 0, visible = true;
  const pointers = new Map();
  const clampZoom = (z) => Math.max(o.zoomMin, Math.min(o.zoomMax, z));
  const spread = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

  canvas.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
    if (pointers.size === 2) { drag = null; pinch = spread(); } else drag = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { const sp = spread(); if (pinch) zoom = clampZoom((zoom * sp) / pinch); pinch = sp; return; }
    if (!drag) return;
    vy = -(e.clientX - drag.x) * 0.006; vx = -(e.clientY - drag.y) * 0.006;
    drag = { x: e.clientX, y: e.clientY };
  });
  const release = (e) => { pointers.delete(e.pointerId); pinch = 0; drag = null; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom = clampZoom(zoom * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });

  const frame = (now) => {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!reduceMotion) time += dt;
    if (!drag) { vy += (idle - vy) * 0.03; vx *= 0.9; }
    ry += vy; rx = Math.max(-1.5, Math.min(1.5, rx + vx));
    const view = { ...o, zoom };
    if (o.scene === 'solar') drawSolarSystem(ctx, view, rx, ry, time);
    else if (mesh) drawModel(ctx, mesh, rx, ry, view);
    raf = requestAnimationFrame(frame);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }).observe(canvas);
}

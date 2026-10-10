export interface DijkstraRoutingParams {
  xs: number[];
  ys: number[];
  startIx: number;
  startIy: number;
  endIx: number;
  endIy: number;
  evalEdgeCost: (x1: number, y1: number, x2: number, y2: number) => number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

export function runDijkstraGridRouter(params: DijkstraRoutingParams): Array<{ x: number; y: number }> {
  const { xs, ys, startIx, startIy, endIx, endIy, evalEdgeCost, sx, sy, ex, ey } = params;

  const nx = xs.length;
  const ny = ys.length;
  const totalNodes = nx * ny;
  const nodeIdx = (ix: number, iy: number) => iy * nx + ix;

  const stateCount = totalNodes * 3;
  const dist = new Float64Array(stateCount).fill(Infinity);
  const prev = new Int32Array(stateCount).fill(-1);
  const visited = new Uint8Array(stateCount);

  const startNode = nodeIdx(startIx, startIy);
  const endNode = nodeIdx(endIx, endIy);
  dist[startNode * 3 + 0] = 0;

  for (let step = 0; step < stateCount; step++) {
    let uState = -1;
    let bestD = Infinity;
    for (let s = 0; s < stateCount; s++) {
      if (!visited[s] && dist[s] < bestD) {
        bestD = dist[s];
        uState = s;
      }
    }
    if (uState === -1 || bestD === Infinity) break;
    visited[uState] = 1;

    const uNode = Math.floor(uState / 3);
    const uDir = uState % 3;
    if (uNode === endNode) break;

    const uxIdx = uNode % nx;
    const uyIdx = Math.floor(uNode / nx);
    const ux = xs[uxIdx];
    const uy = ys[uyIdx];

    const neighbors: Array<{ nix: number; niy: number; nDir: number }> = [];
    if (uxIdx > 0) neighbors.push({ nix: uxIdx - 1, niy: uyIdx, nDir: 1 });
    if (uxIdx < nx - 1) neighbors.push({ nix: uxIdx + 1, niy: uyIdx, nDir: 1 });
    if (uyIdx > 0) neighbors.push({ nix: uxIdx, niy: uyIdx - 1, nDir: 2 });
    if (uyIdx < ny - 1) neighbors.push({ nix: uxIdx, niy: uyIdx + 1, nDir: 2 });

    for (const nb of neighbors) {
      const vNode = nodeIdx(nb.nix, nb.niy);
      const vx = xs[nb.nix];
      const vy = ys[nb.niy];
      const edgeCost = evalEdgeCost(ux, uy, vx, vy);
      const turnPenalty = uDir !== 0 && uDir !== nb.nDir ? 8 : 0;
      const nextCost = bestD + edgeCost + turnPenalty;
      const vState = vNode * 3 + nb.nDir;
      if (nextCost < dist[vState]) {
        dist[vState] = nextCost;
        prev[vState] = uState;
      }
    }
  }

  let bestEndState = endNode * 3 + 0;
  let bestEndCost = dist[bestEndState];
  for (let d = 1; d <= 2; d++) {
    if (dist[endNode * 3 + d] < bestEndCost) {
      bestEndCost = dist[endNode * 3 + d];
      bestEndState = endNode * 3 + d;
    }
  }

  const rawPath: Array<{ x: number; y: number }> = [];
  let curr = bestEndState;
  while (curr !== -1) {
    const cNode = Math.floor(curr / 3);
    const cix = cNode % nx;
    const ciy = Math.floor(cNode / nx);
    rawPath.push({ x: xs[cix], y: ys[ciy] });
    curr = prev[curr];
  }
  rawPath.reverse();

  if (rawPath.length < 2) {
    rawPath.splice(0, rawPath.length, { x: sx, y: sy }, { x: ex, y: sy }, { x: ex, y: ey });
  }

  // Simplify path: remove duplicate points and merge any collinear or 180° backtracking segments
  const simplified: Array<{ x: number; y: number }> = [];
  for (const pt of rawPath) {
    if (simplified.length === 0) {
      simplified.push(pt);
      continue;
    }
    const last = simplified[simplified.length - 1];
    if (Math.hypot(pt.x - last.x, pt.y - last.y) < 2) {
      continue;
    }
    if (simplified.length >= 2) {
      const prevPt = simplified[simplified.length - 2];
      const dx1 = last.x - prevPt.x;
      const dy1 = last.y - prevPt.y;
      const dx2 = pt.x - last.x;
      const dy2 = pt.y - last.y;
      const bothHoriz = Math.abs(dy1) <= 2 && Math.abs(dy2) <= 2;
      const bothVert = Math.abs(dx1) <= 2 && Math.abs(dx2) <= 2;
      if (bothHoriz || bothVert) {
        simplified[simplified.length - 1] = pt;
        continue;
      }
    }
    simplified.push(pt);
  }

  return simplified;
}

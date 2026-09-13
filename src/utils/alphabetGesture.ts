// ABCD Reward Scheme: Hidden alphabet gesture recognition
// Letter A = 100,000 points
// Letter B = 200,000 points (x2)
// Letter C = 300,000 points (x3)
// ...
// Letter Z = 2,600,000 points (100,000 x 26)

export interface Point {
  x: number;
  y: number;
}

export interface RecognizedLetter {
  letter: string;
  points: number;
  confidence: number;
  center: Point;
}

// Exact reward calculation: Letter A = 100k, B = 200k, ... Z = 2.6M
export function getAlphabetPoints(char: string): number {
  const upper = char.toUpperCase();
  if (upper < 'A' || upper > 'Z') return 0;
  const letterIndex = upper.charCodeAt(0) - 64; // 1 for A, 26 for Z
  return letterIndex * 100_000;
}

// Resample a stroke to N equidistant points
function resampleStroke(points: Point[], n: number = 32): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return Array(n).fill({ ...points[0] });
  }

  // Calculate total path length
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.hypot(dx, dy);
  }

  if (totalLength <= 0.001) {
    return Array(n).fill({ ...points[0] });
  }

  const interval = totalLength / (n - 1);
  const resampled: Point[] = [{ ...points[0] }];
  let currentDist = 0;
  let srcIdx = 1;
  let lastPt = points[0];

  while (resampled.length < n && srcIdx < points.length) {
    const nextPt = points[srcIdx];
    const segDist = Math.hypot(nextPt.x - lastPt.x, nextPt.y - lastPt.y);

    if (currentDist + segDist >= interval) {
      const t = (interval - currentDist) / (segDist || 1);
      const newPt: Point = {
        x: lastPt.x + t * (nextPt.x - lastPt.x),
        y: lastPt.y + t * (nextPt.y - lastPt.y),
      };
      resampled.push(newPt);
      lastPt = newPt;
      currentDist = 0;
    } else {
      currentDist += segDist;
      lastPt = nextPt;
      srcIdx++;
    }
  }

  while (resampled.length < n) {
    resampled.push({ ...points[points.length - 1] });
  }

  return resampled;
}

// Normalize points: scale to standard box [0, 100] preserving aspect ratio if narrow, center at (0,0)
function normalizePoints(pts: Point[]): { points: Point[]; width: number; height: number; center: Point } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const rawWidth = Math.max(1, maxX - minX);
  const rawHeight = Math.max(1, maxY - minY);
  const center: Point = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  // Scale factor: scale largest dimension to 100
  const maxDim = Math.max(rawWidth, rawHeight);
  const scale = 100 / maxDim;

  const normalized = pts.map((p) => ({
    x: (p.x - center.x) * scale,
    y: (p.y - center.y) * scale,
  }));

  return { points: normalized, width: rawWidth, height: rawHeight, center };
}

// Pre-defined canonical shapes for letters A-Z (resampled to 32 points, centered around (0,0))
interface LetterTemplate {
  letter: string;
  points: Point[];
  minStrokes?: number;
  maxStrokes?: number;
  minAspectRatio?: number; // width / height
  maxAspectRatio?: number;
  isClosed?: boolean;
}

function generateTemplate(def: (t: number) => Point, n = 32): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    pts.push(def(t));
  }
  return normalizePoints(pts).points;
}

// Helper line from (x1, y1) to (x2, y2)
function line(x1: number, y1: number, x2: number, y2: number, t: number): Point {
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

// Generate templates for letters A-Z
const LETTER_TEMPLATES: LetterTemplate[] = [
  // A: Unistroke apex with loop or cross (0,100) -> (50,0) -> (100,100) -> (75,50) -> (25,50)
  {
    letter: 'A',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(10, 90, 50, 10, t / 0.35);
      if (t < 0.7) return line(50, 10, 90, 90, (t - 0.35) / 0.35);
      return line(85, 55, 15, 55, (t - 0.7) / 0.3);
    }),
  },
  // A variant 2: Alpha / triangle loop
  {
    letter: 'A',
    points: generateTemplate((t) => {
      if (t < 0.5) return line(15, 85, 50, 15, t / 0.5);
      if (t < 0.8) return line(50, 15, 85, 85, (t - 0.5) / 0.3);
      return line(85, 55, 20, 55, (t - 0.8) / 0.2);
    }),
  },
  // B: Stem down then two loops
  {
    letter: 'B',
    points: generateTemplate((t) => {
      if (t < 0.3) return line(20, 10, 20, 90, t / 0.3);
      if (t < 0.65) {
        const a = ((t - 0.3) / 0.35) * Math.PI;
        return { x: 20 + 35 * Math.sin(a), y: 30 - 20 * Math.cos(a) };
      }
      const a = ((t - 0.65) / 0.35) * Math.PI;
      return { x: 20 + 40 * Math.sin(a), y: 70 - 20 * Math.cos(a) };
    }),
  },
  // C: Counter-clockwise arc starting top-right to bottom-right
  {
    letter: 'C',
    points: generateTemplate((t) => {
      const angle = (0.25 + t * 0.8) * 2 * Math.PI;
      return { x: 50 + 40 * Math.cos(angle), y: 50 + 40 * Math.sin(angle) };
    }),
    isClosed: false,
  },
  // D: Stem down then big arc
  {
    letter: 'D',
    points: generateTemplate((t) => {
      if (t < 0.4) return line(20, 10, 20, 90, t / 0.4);
      const a = ((t - 0.4) / 0.6) * Math.PI;
      return { x: 20 + 55 * Math.sin(a), y: 50 - 40 * Math.cos(a) };
    }),
  },
  // E: (80,15) -> (20,15) -> (20,50) -> (70,50) -> (20,50) -> (20,85) -> (80,85)
  {
    letter: 'E',
    points: generateTemplate((t) => {
      if (t < 0.2) return line(80, 15, 20, 15, t / 0.2);
      if (t < 0.4) return line(20, 15, 20, 50, (t - 0.2) / 0.2);
      if (t < 0.6) return line(20, 50, 70, 50, (t - 0.4) / 0.2);
      if (t < 0.75) return line(70, 50, 20, 50, (t - 0.6) / 0.15);
      if (t < 0.85) return line(20, 50, 20, 85, (t - 0.75) / 0.1);
      return line(20, 85, 80, 85, (t - 0.85) / 0.15);
    }),
  },
  // F: (80,15) -> (20,15) -> (20,50) -> (65,50) -> (20,50) -> (20,85)
  {
    letter: 'F',
    points: generateTemplate((t) => {
      if (t < 0.25) return line(80, 15, 20, 15, t / 0.25);
      if (t < 0.5) return line(20, 15, 20, 50, (t - 0.25) / 0.25);
      if (t < 0.75) return line(20, 50, 65, 50, (t - 0.5) / 0.25);
      return line(20, 50, 20, 85, (t - 0.75) / 0.25);
    }),
  },
  // G: Like C plus inward horizontal bar
  {
    letter: 'G',
    points: generateTemplate((t) => {
      if (t < 0.75) {
        const angle = (0.2 + (t / 0.75) * 0.8) * 2 * Math.PI;
        return { x: 50 + 40 * Math.cos(angle), y: 50 + 40 * Math.sin(angle) };
      }
      return line(85, 60, 50, 60, (t - 0.75) / 0.25);
    }),
  },
  // H: Left stem, crossbar, right stem
  {
    letter: 'H',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(20, 15, 20, 85, t / 0.35);
      if (t < 0.65) return line(20, 50, 80, 50, (t - 0.35) / 0.3);
      return line(80, 15, 80, 85, (t - 0.65) / 0.35);
    }),
  },
  // I: Vertical line down
  {
    letter: 'I',
    points: generateTemplate((t) => line(50, 15, 50, 85, t)),
    maxAspectRatio: 0.5,
  },
  // J: Down from top right then hook left
  {
    letter: 'J',
    points: generateTemplate((t) => {
      if (t < 0.65) return line(65, 15, 65, 65, t / 0.65);
      const a = ((t - 0.65) / 0.35) * Math.PI;
      return { x: 45 + 20 * Math.cos(a), y: 65 + 20 * Math.sin(a) };
    }),
  },
  // K: Stem down then diagonals
  {
    letter: 'K',
    points: generateTemplate((t) => {
      if (t < 0.4) return line(25, 15, 25, 85, t / 0.4);
      if (t < 0.7) return line(80, 15, 25, 50, (t - 0.4) / 0.3);
      return line(25, 50, 80, 85, (t - 0.7) / 0.3);
    }),
  },
  // L: Down from top left then right
  {
    letter: 'L',
    points: generateTemplate((t) => {
      if (t < 0.6) return line(25, 15, 25, 85, t / 0.6);
      return line(25, 85, 85, 85, (t - 0.6) / 0.4);
    }),
  },
  // M: (15,85) -> (15,15) -> (50,60) -> (85,15) -> (85,85)
  {
    letter: 'M',
    points: generateTemplate((t) => {
      if (t < 0.25) return line(15, 85, 15, 15, t / 0.25);
      if (t < 0.5) return line(15, 15, 50, 60, (t - 0.25) / 0.25);
      if (t < 0.75) return line(50, 60, 85, 15, (t - 0.5) / 0.25);
      return line(85, 15, 85, 85, (t - 0.75) / 0.25);
    }),
  },
  // N: (20,85) -> (20,15) -> (80,85) -> (80,15)
  {
    letter: 'N',
    points: generateTemplate((t) => {
      if (t < 0.33) return line(20, 85, 20, 15, t / 0.33);
      if (t < 0.66) return line(20, 15, 80, 85, (t - 0.33) / 0.33);
      return line(80, 85, 80, 15, (t - 0.66) / 0.34);
    }),
  },
  // O: Full counter-clockwise circle
  {
    letter: 'O',
    points: generateTemplate((t) => {
      const a = t * 2 * Math.PI;
      return { x: 50 + 40 * Math.sin(a), y: 50 - 40 * Math.cos(a) };
    }),
    isClosed: true,
  },
  // P: Stem down then upper loop
  {
    letter: 'P',
    points: generateTemplate((t) => {
      if (t < 0.45) return line(25, 15, 25, 85, t / 0.45);
      const a = ((t - 0.45) / 0.55) * Math.PI;
      return { x: 25 + 40 * Math.sin(a), y: 35 - 20 * Math.cos(a) };
    }),
  },
  // Q: Circle + bottom-right diagonal tail
  {
    letter: 'Q',
    points: generateTemplate((t) => {
      if (t < 0.8) {
        const a = (t / 0.8) * 2 * Math.PI;
        return { x: 50 + 36 * Math.sin(a), y: 45 - 36 * Math.cos(a) };
      }
      return line(55, 65, 85, 90, (t - 0.8) / 0.2);
    }),
  },
  // R: Stem down, upper loop, then diagonal leg
  {
    letter: 'R',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(25, 15, 25, 85, t / 0.35);
      if (t < 0.7) {
        const a = ((t - 0.35) / 0.35) * Math.PI;
        return { x: 25 + 38 * Math.sin(a), y: 35 - 20 * Math.cos(a) };
      }
      return line(25, 55, 80, 85, (t - 0.7) / 0.3);
    }),
  },
  // S: S-curve from top right, loops left, across center, loops right to bottom left
  {
    letter: 'S',
    points: generateTemplate((t) => {
      if (t < 0.5) {
        const a = (0.25 + (t / 0.5) * 0.75) * 2 * Math.PI;
        return { x: 50 + 30 * Math.cos(a), y: 32 + 20 * Math.sin(a) };
      }
      const a = ((t - 0.5) / 0.5) * 1.5 * Math.PI;
      return { x: 50 - 30 * Math.cos(a), y: 68 + 20 * Math.sin(a) };
    }),
  },
  // T: Horizontal bar then stem down
  {
    letter: 'T',
    points: generateTemplate((t) => {
      if (t < 0.45) return line(15, 15, 85, 15, t / 0.45);
      return line(50, 15, 50, 85, (t - 0.45) / 0.55);
    }),
  },
  // U: Down from top left, curved bottom, up to top right
  {
    letter: 'U',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(20, 15, 20, 60, t / 0.35);
      if (t < 0.65) {
        const a = ((t - 0.35) / 0.3) * Math.PI;
        return { x: 50 - 30 * Math.cos(a), y: 60 + 25 * Math.sin(a) };
      }
      return line(80, 60, 80, 15, (t - 0.65) / 0.35);
    }),
    isClosed: false,
  },
  // V: Top left to bottom middle to top right
  {
    letter: 'V',
    points: generateTemplate((t) => {
      if (t < 0.5) return line(15, 15, 50, 85, t / 0.5);
      return line(50, 85, 85, 15, (t - 0.5) / 0.5);
    }),
  },
  // W: (15,15) -> (32,85) -> (50,35) -> (68,85) -> (85,15)
  {
    letter: 'W',
    points: generateTemplate((t) => {
      if (t < 0.25) return line(15, 15, 32, 85, t / 0.25);
      if (t < 0.5) return line(32, 85, 50, 35, (t - 0.25) / 0.25);
      if (t < 0.75) return line(50, 35, 68, 85, (t - 0.5) / 0.25);
      return line(68, 85, 85, 15, (t - 0.75) / 0.25);
    }),
  },
  // X: Diagonal (20,20) -> (80,80) and (80,20) -> (20,80)
  {
    letter: 'X',
    points: generateTemplate((t) => {
      if (t < 0.5) return line(20, 20, 80, 80, t / 0.5);
      return line(80, 20, 20, 80, (t - 0.5) / 0.5);
    }),
  },
  // Y: Top left to center, top right to center, stem down
  {
    letter: 'Y',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(20, 15, 50, 50, t / 0.35);
      if (t < 0.7) return line(80, 15, 50, 50, (t - 0.35) / 0.35);
      return line(50, 50, 50, 85, (t - 0.7) / 0.3);
    }),
  },
  // T 2-stroke template: horizontal bar then vertical stem
  {
    letter: 'T',
    points: generateTemplate((t) => {
      if (t < 0.5) return line(15, 20, 85, 20, t / 0.5);
      return line(50, 20, 50, 85, (t - 0.5) / 0.5);
    }),
  },
  // X 2-stroke template: (20,20)->(80,80) then (80,20)->(20,80)
  {
    letter: 'X',
    points: generateTemplate((t) => {
      if (t < 0.5) return line(20, 20, 80, 80, t / 0.5);
      return line(80, 20, 20, 80, (t - 0.5) / 0.5);
    }),
  },
  // A 2-stroke / 3-stroke: apex (20,85)->(50,15)->(80,85) then bar (30,55)->(70,55)
  {
    letter: 'A',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(20, 85, 50, 15, t / 0.35);
      if (t < 0.7) return line(50, 15, 80, 85, (t - 0.35) / 0.35);
      return line(30, 55, 70, 55, (t - 0.7) / 0.3);
    }),
  },
  // H 2/3-stroke: stem1 (25,15)->(25,85), stem2 (75,15)->(75,85), bar (25,50)->(75,50)
  {
    letter: 'H',
    points: generateTemplate((t) => {
      if (t < 0.35) return line(25, 15, 25, 85, t / 0.35);
      if (t < 0.7) return line(75, 15, 75, 85, (t - 0.35) / 0.35);
      return line(25, 50, 75, 50, (t - 0.7) / 0.3);
    }),
  },
  // Z unistroke alternative
  {
    letter: 'Z',
    points: generateTemplate((t) => {
      if (t < 0.3) return line(20, 20, 80, 20, t / 0.3);
      if (t < 0.7) return line(80, 20, 20, 80, (t - 0.3) / 0.4);
      return line(20, 80, 80, 80, (t - 0.7) / 0.3);
    }),
  },
];

// Distance between two resampled point sets
function computePointDistance(ptsA: Point[], ptsB: Point[]): number {
  let sum = 0;
  const len = Math.min(ptsA.length, ptsB.length);
  for (let i = 0; i < len; i++) {
    const dx = ptsA[i].x - ptsB[i].x;
    const dy = ptsA[i].y - ptsB[i].y;
    sum += Math.hypot(dx, dy);
  }
  return sum / len;
}

// Reverse point order for bidirectional stroke traversal matching
function reversePoints(pts: Point[]): Point[] {
  return [...pts].reverse();
}

// One-way closest-point matching
function computeOneWayCloudDistance(ptsA: Point[], ptsB: Point[]): number {
  let sum = 0;
  for (const a of ptsA) {
    let minD = Infinity;
    for (const b of ptsB) {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < minD) minD = d;
    }
    sum += minD;
  }
  return sum / ptsA.length;
}

// Two-way (Bidirectional) Hausdorff / Chamfer Distance
// Ensures candidate matches template AND template matches candidate completely.
// Rejects random squiggles, loops, and partial lines that lack true letter structure.
function computeBiCloudDistance(ptsA: Point[], ptsB: Point[]): number {
  const aToB = computeOneWayCloudDistance(ptsA, ptsB);
  const bToA = computeOneWayCloudDistance(ptsB, ptsA);
  return (aToB + bToA) / 2;
}

// Calculate total path length of normalized points
function computePathLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

/**
 * Recognizes a drawn letter gesture from one or more raw point strokes.
 * Requires the letter to be drawn correctly in:
 * 1) Upright standard orientation, OR
 * 2) Reverse (upside down: 180° rotated or vertically inverted) orientation.
 * Any drawing that is not the alphabet and correctly drawn will be rejected and return null.
 */
export function recognizeAlphabetGesture(strokes: Point[][]): RecognizedLetter | null {
  if (!strokes || strokes.length === 0) return null;

  // Combine all stroke points
  const allRawPoints: Point[] = [];
  for (const stroke of strokes) {
    for (const pt of stroke) {
      allRawPoints.push(pt);
    }
  }

  if (allRawPoints.length < 5) return null;

  // Check bounding box size - reject micro-taps or tiny wiggles
  const norm = normalizePoints(allRawPoints);
  if (norm.width < 32 && norm.height < 32) {
    return null; // Too small to be a deliberate letter drawing
  }

  // Resample combined points to 32 points
  const candidatePts = resampleStroke(allRawPoints, 32);
  const candidateNorm = normalizePoints(candidatePts).points;
  const candidatePathLength = computePathLength(candidateNorm);

  const aspectRatio = norm.width / Math.max(1, norm.height);

  // Candidate representations to test:
  // 1. Upright: Normal orientation
  // 2. Reverse (upside-down): 180° rotation (x -> -x, y -> -y)
  // 3. Reverse (upside-down): Vertical flip (y -> -y)
  const orientations: { name: string; pts: Point[]; ptsRev: Point[]; aspRatio: number }[] = [
    {
      name: 'upright',
      pts: candidateNorm,
      ptsRev: reversePoints(candidateNorm),
      aspRatio: aspectRatio,
    },
    {
      name: 'upside_down_180',
      pts: candidateNorm.map((p) => ({ x: -p.x, y: -p.y })),
      ptsRev: reversePoints(candidateNorm.map((p) => ({ x: -p.x, y: -p.y }))),
      aspRatio: aspectRatio,
    },
    {
      name: 'upside_down_flip',
      pts: candidateNorm.map((p) => ({ x: p.x, y: -p.y })),
      ptsRev: reversePoints(candidateNorm.map((p) => ({ x: p.x, y: -p.y }))),
      aspRatio: aspectRatio,
    },
  ];

  let bestLetter = '';
  let bestScore = -Infinity;
  const isMultiStroke = strokes.length > 1;

  for (const tmpl of LETTER_TEMPLATES) {
    const tmplPathLength = computePathLength(tmpl.points);

    // Path length ratio check: prevents a simple straight line from matching complex letters
    const lenRatio = candidatePathLength / Math.max(1, tmplPathLength);
    if (lenRatio < 0.42 || lenRatio > 2.4) {
      continue;
    }

    for (const orient of orientations) {
      // Aspect ratio constraints (e.g., letter I must be tall/narrow)
      if (tmpl.maxAspectRatio && orient.aspRatio > tmpl.maxAspectRatio) {
        continue;
      }
      if (tmpl.minAspectRatio && orient.aspRatio < tmpl.minAspectRatio) {
        continue;
      }

      // Sequential distance (forward and reversed traversal)
      const distFwd = computePointDistance(orient.pts, tmpl.points);
      const distRev = computePointDistance(orient.ptsRev, tmpl.points);
      const seqDist = Math.min(distFwd, distRev);

      // Two-way bidirectional cloud distance
      const biCloudDist = computeBiCloudDistance(orient.pts, tmpl.points);

      // Blended distance: for multi-stroke, bidirectional cloud distance is dominant
      const combinedDist = isMultiStroke
        ? biCloudDist * 0.75 + seqDist * 0.25
        : seqDist * 0.5 + biCloudDist * 0.5;

      // Score scale: 0 distance = 1.0; 25 distance = 0.5; >50 distance = 0.0
      const score = Math.max(0, 1 - combinedDist / 38);

      if (score > bestScore) {
        bestScore = score;
        bestLetter = tmpl.letter;
      }
    }
  }

  // Strict confidence threshold:
  // Must be a genuine alphabet shape in upright or upside-down orientation.
  // Rejects arbitrary scribbles, zigzags, random shapes, and incomplete sketches.
  if (bestScore >= 0.58 && bestLetter) {
    const points = getAlphabetPoints(bestLetter);
    return {
      letter: bestLetter,
      points,
      confidence: Math.min(0.99, Number(bestScore.toFixed(2))),
      center: norm.center,
    };
  }

  return null;
}

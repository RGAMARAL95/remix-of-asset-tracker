/**
 * Contrast checker — paste into the browser console on any route.
 *
 * Walks every text node on the page, works out the colour it is ACTUALLY drawn
 * against (climbing until it finds a non-transparent ancestor, and compositing
 * translucent layers on the way), and reports everything under the WCAG AA bar.
 *
 * Written because two contrast bugs shipped that maths-on-paper missed:
 *   - white form values on a white card, because an opaque surface inherited
 *     `text-white` from the shell and never reset it;
 *   - a tile label at 2.30:1, back when tiles were frosted over a light green.
 *
 * Both were invisible to typecheck, lint, build and every automated test we
 * had. Only measuring the rendered page finds them.
 *
 *   node scripts/a11y-contrast.js     → prints the snippet to paste
 *   or paste the IIFE below straight into DevTools
 */

const SNIPPET = String.raw`
(() => {
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  // Colours arrive as rgb()/rgba() OR oklch() depending on where they came
  // from — shadcn's tokens are oklch. Parsing oklch's 0-1 lightness as an RGB
  // channel made a perfectly legible dark-on-white button report 1.0:1, so
  // anything not rgb() is resolved by letting the browser convert it.
  const toRGB = (() => {
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);
    return value => {
      if (/^rgba?\(/.test(value)) return (value.match(/[\d.]+/g) || []).map(Number);
      probe.style.color = '';
      probe.style.color = value;
      const resolved = getComputedStyle(probe).color;
      return (resolved.match(/[\d.]+/g) || []).map(Number);
    };
  })();
  const parse = s => toRGB(s);
  const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const over = (fg, a, bg) => [0, 1, 2].map(i => Math.round(fg[i] * a + bg[i] * (1 - a)));

  // A gradient is an opaque layer too, but it lives in background-IMAGE, not
  // background-color. Without this the climb below sails past the app's canvas,
  // finds nothing opaque, and falls back to white — which reported every piece
  // of white text in the app at about 1.07:1. Forty false failures, and the one
  // real one buried among them.
  //
  // Takes the LIGHTEST stop, which is the worst case for the white text we put
  // on these gradients.
  function gradientStop(cs) {
    const bi = cs.backgroundImage;
    if (!bi || bi === 'none' || !/gradient/.test(bi)) return null;
    const stops = bi.match(/rgba?\([^)]+\)/g);
    if (!stops) return null;
    return stops.map(parse).map(c => [c[0], c[1], c[2]]).sort((a, b) => L(b) - L(a))[0];
  }

  // The colour a node is really drawn on: climb ancestors, compositing every
  // translucent background until an opaque one is found.
  function effectiveBg(el) {
    let stack = [], n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c.length >= 3) {
        const a = c.length === 4 ? c[3] : 1;
        if (a > 0) { stack.push([[c[0], c[1], c[2]], a]); if (a === 1) break; }
      }
      const g = gradientStop(cs);
      if (g) { stack.push([g, 1]); break; }
      n = n.parentElement;
    }
    let base = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i][0], stack[i][1], base);
    return base;
  }

  const fails = [];
  const seen = new Set();
  document.querySelectorAll('*').forEach(el => {
    if (el.children.length) return;                    // leaves only
    const text = (el.textContent || '').trim();
    if (!text) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const col = parse(cs.color);
    const alpha = col.length === 4 ? col[3] : 1;
    const bg = effectiveBg(el);
    const fg = over([col[0], col[1], col[2]], alpha, bg);

    const px = parseFloat(cs.fontSize);
    const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
    // AA: 3:1 for large text (>=24px, or >=18.66px bold), else 4.5:1
    const bar = px >= 24 || (bold && px >= 18.66) ? 3 : 4.5;
    const r = ratio(fg, bg);

    if (r < bar) {
      const key = text.slice(0, 24) + cs.color + cs.fontSize;
      if (seen.has(key)) return;
      seen.add(key);
      fails.push({
        text: text.slice(0, 32),
        ratio: +r.toFixed(2),
        needs: bar,
        size: cs.fontSize,
        color: cs.color,
        on: 'rgb(' + bg.join(',') + ')',
        where: el.className && typeof el.className === 'string' ? el.className.slice(0, 40) : el.tagName,
      });
    }
  });

  fails.sort((a, b) => a.ratio - b.ratio);
  console.log('%c' + location.pathname + ' — ' + fails.length + ' contrast failure(s)',
    'font-weight:bold;font-size:14px');
  if (fails.length) console.table(fails); else console.log('all text passes AA');
  return fails;
})()
`;

console.log( SNIPPET );

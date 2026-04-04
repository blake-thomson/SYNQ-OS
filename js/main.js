/* =========================================
   SYNQ OS — Premium UI JavaScript
   ========================================= */

// --- Nav: glassmorphism on scroll ---
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// --- Nav: mobile toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      document.body.style.overflow = 'hidden';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
      document.body.style.overflow = '';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
      document.body.style.overflow = '';
    }
  });
}

// --- Scroll Reveal: IntersectionObserver ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children').forEach(el => {
  revealObserver.observe(el);
});

// --- Animated Counters ---
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutExpo(progress) * target);
    if (prefix || suffix) {
      el.textContent = prefix + value + suffix;
    } else {
      el.textContent = value;
    }
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (prefix || suffix) {
        el.textContent = prefix + target + suffix;
      } else {
        el.textContent = target;
      }
    }
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('[data-target]');
      counters.forEach(counter => animateCounter(counter));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats, .results-stats, .growth-grid').forEach(el => {
  counterObserver.observe(el);
});

// --- Magnetic hover on glass cards ---
document.querySelectorAll('.service-card, .glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-deltaY * 2}deg) rotateY(${deltaX * 2}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// --- Smooth page load fade ---
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// --- Animated Text Cycle ---
// Vanilla JS port of the framer-motion AnimatedTextCycle React component.
// Mirrors: AnimatePresence mode="wait", spring width, blur-fade-slide variants.
class TextCycle {
  constructor(el, words, interval = 3000) {
    this.el       = el;
    this.words    = words;
    this.interval = interval;
    this.idx      = 0;
    this.busy     = false;
    this._setup();
  }

  _setup() {
    // Hidden ruler — measures word widths at the exact rendered font-size
    this.ruler = document.createElement('span');
    Object.assign(this.ruler.style, {
      position: 'fixed', top: '-9999px', left: '-9999px',
      visibility: 'hidden', pointerEvents: 'none',
      whiteSpace: 'nowrap', fontFamily: 'inherit',
      fontWeight: '800', letterSpacing: 'inherit',
    });
    document.body.appendChild(this.ruler);

    // Live word element
    this.wordEl = document.createElement('span');
    this.wordEl.className = 'text-cycle__word';
    this.wordEl.textContent = this.words[0];
    this.el.appendChild(this.wordEl);

    // Set initial container width after fonts are ready
    requestAnimationFrame(() => {
      this.el.style.width = this._measure(this.words[0]) + 'px';
    });

    setTimeout(() => this._tick(), this.interval);
  }

  _measure(word) {
    // Match font-size of the container so ruler is pixel-accurate
    this.ruler.style.fontSize = getComputedStyle(this.el).fontSize;
    this.ruler.textContent = word;
    return Math.ceil(this.ruler.getBoundingClientRect().width);
  }

  _tick() {
    if (this.busy) return;
    this.busy = true;

    const nextIdx  = (this.idx + 1) % this.words.length;
    const nextWord = this.words[nextIdx];

    // 1. Stamp exiting ghost (absolute — doesn't shift layout)
    const ghost = this.wordEl.cloneNode(true);
    ghost.classList.add('text-cycle__word--exiting');
    this.el.appendChild(ghost);
    ghost.addEventListener('animationend', () => ghost.remove(), { once: true });

    // 2. Swap word content + trigger enter animation
    this.wordEl.textContent = nextWord;
    this.wordEl.className = 'text-cycle__word text-cycle__word--entering';
    this.wordEl.addEventListener('animationend', () => {
      this.wordEl.className = 'text-cycle__word';
      this.busy = false;
      setTimeout(() => this._tick(), this.interval);
    }, { once: true });

    // 3. Spring-feel width transition (CSS handles the animation)
    this.el.style.width = this._measure(nextWord) + 'px';
    this.idx = nextIdx;
  }
}

// Boot — SYNQ OS on-brand industry cycling words
const heroCycleEl = document.getElementById('heroCycle');
if (heroCycleEl) {
  new TextCycle(heroCycleEl, [
    'Service Businesses',
    'HVAC Companies',
    'Med Spas',
    'Law Firms',
    'Contractors',
    'Local Brands',
    'Growing Teams',
    'Roofers',
    'Solar Companies',
    'Consultants',
  ], 3000);
}

// --- Scrolling Testimonial Columns ---
document.querySelectorAll('.tscroll__col').forEach(col => {
  const track = col.querySelector('.tscroll__track');
  if (!track) return;
  const speed = col.dataset.speed || '15';
  track.style.setProperty('--tscroll-speed', speed + 's');
  // Duplicate children for seamless loop
  const items = Array.from(track.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
});

// --- Calendly: swap placeholder when URL is set ---
const CALENDLY_URL = null;

if (CALENDLY_URL) {
  const embedContainer = document.getElementById('calendlyEmbed');
  if (embedContainer) {
    embedContainer.innerHTML = `
      <div class="calendly-inline-widget"
           data-url="${CALENDLY_URL}"
           style="min-width:320px;height:700px;width:100%;"></div>
    `;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }
}

// ===== WebGL Shader Hero (Results page) =====
;(function shaderHeroBoot() {
  const canvas = document.getElementById('shaderCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2');
  if (!gl) return; // graceful fallback — hero just shows black bg

  // --- Shader source ---
  const vertSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

  const fragSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;

/*  Dotted wave surface.
    Uses a screen-space grid with perspective foreshortening.
    Each pixel finds its grid cell and checks nearby dots. */

void main(void) {
  vec2 px = gl_FragCoord.xy;
  vec2 res = resolution;
  float aspect = res.x / res.y;

  // Map pixel to centered coords
  vec2 uv = (px - 0.5 * res) / res.y;

  // Perspective warp: bottom of screen = close, top = far
  // This maps screen Y to a depth value
  float py = uv.y + 0.25; // shift center down
  float depth = 1.0 / max(0.05, 0.6 - py * 0.8); // perspective depth

  // Grid in "world" XZ space (X = screen horizontal, Z = depth)
  float gridSpacing = 0.06;
  vec2 worldXZ = vec2(uv.x * depth, depth);

  // Snap to nearest grid cell
  vec2 cell = floor(worldXZ / gridSpacing + 0.5);

  // Gold palette
  vec3 goldHi  = vec3(0.84, 0.75, 0.49);
  vec3 goldMid = vec3(0.66, 0.54, 0.25);
  vec3 goldLo  = vec3(0.22, 0.18, 0.08);

  vec3 col = vec3(0.0);

  // Check 5x5 neighborhood
  for (float j = -2.0; j <= 2.0; j++) {
    for (float i = -2.0; i <= 2.0; i++) {
      vec2 c = cell + vec2(i, j);

      // Wave displacement (Y in world = vertical on screen)
      float wave = sin(c.x * 0.5 + time * 0.8) * 0.012
                 + sin(c.y * 0.35 + time * 0.6) * 0.015
                 + sin((c.x + c.y) * 0.25 + time * 0.4) * 0.008;

      // World position of this grid dot
      vec2 dotWorld = c * gridSpacing;

      // Project back to screen: inverse of the perspective warp
      float dotDepth = dotWorld.y;
      if (dotDepth < 0.3) continue;
      float dotScreenX = dotWorld.x / dotDepth;
      float dotScreenY = (0.6 - 1.0 / dotDepth) / 0.8 - 0.25;

      // Add wave offset in screen space
      dotScreenY += wave / dotDepth;

      // Distance in pixel space
      vec2 dotUV = vec2(dotScreenX, dotScreenY);
      vec2 diff = (uv - dotUV) * res.y;
      float dist = length(diff);

      // Dot size: larger when close (small depth), smaller when far
      float dotSize = max(1.5, 4.0 / dotDepth);

      // Soft dot
      float da = smoothstep(dotSize, dotSize * 0.2, dist);

      // Fade with depth
      float fog = exp(-dotDepth * 0.15);

      // Wave-based color variation
      float waveColor = sin(c.x * 0.5 + time * 0.8) * 0.5 + 0.5;
      vec3 dotCol = mix(goldLo, goldHi, waveColor * fog);

      col += dotCol * da * fog * 0.9;
    }
  }

  // Vignette — fade edges to black
  vec2 vc = px / res - 0.5;
  float vig = 1.0 - dot(vc, vc) * 1.8;
  col *= max(0.0, vig);

  // Subtle warm ambient at bottom
  col += vec3(0.015, 0.01, 0.004) * max(0.0, 0.5 - uv.y);

  O = vec4(col, 1.0);
}`;

  // --- Compile helper ---
  function compile(shader, source) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader));
    }
  }

  // --- Build program ---
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  compile(vs, vertSrc);
  compile(fs, fragSrc);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  // --- Geometry (full-screen quad) ---
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  // --- Uniforms ---
  const uRes  = gl.getUniformLocation(program, 'resolution');
  const uTime = gl.getUniformLocation(program, 'time');

  // --- Resize --- (use dpr=1 for dot surface — higher DPR makes dots sub-pixel)
  function resize() {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // --- Render loop ---
  let raf;
  function loop(now) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, now * 1e-3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  // --- Pause when out of view for perf ---
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      raf = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(raf);
    }
  }, { threshold: 0 });
  observer.observe(canvas);
})();

// --- VSL Play Button ---
const vslPlayBtn = document.getElementById('vslPlayBtn');
const vslVideo = document.getElementById('vslVideo');
if (vslPlayBtn && vslVideo) {
  vslPlayBtn.addEventListener('click', () => {
    vslVideo.classList.toggle('playing');
    // When a real video URL is added, this is where you'd
    // create/show an iframe or trigger video playback.
    // For now it toggles the play button visibility.
  });
}

// --- Re-observe new reveal elements (for service detail pages) ---
document.querySelectorAll('.service-detail__header.reveal, .service-detail__grid.stagger-children, .service-detail__steps.stagger-children, .service-detail__diff.stagger-children').forEach(el => {
  revealObserver.observe(el);
});

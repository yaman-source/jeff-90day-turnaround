"use client";

import React, { useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
    line3?: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  note?: string;
  identity?: {
    name: string;
    title: string;
  };
  className?: string;
}

// ─── WebGL shader source ──────────────────────────────────────────────────────

const defaultShaderSource = `#version 300 es
/*
* made by Matthias Hurrle (@atzedent)
* "To boldly go where no man has gone before."
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) { t+=a*noise(p); p*=2.*m; a*=.5; }
  return t;
}

float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
  }
  O=vec4(col,1);
}`;

// ─── WebGL Renderer ───────────────────────────────────────────────────────────

class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private scale: number;
  private shaderSource: string;

  private readonly vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

  private readonly vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext("webgl2")!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.shaderSource = defaultShaderSource;
  }

  updateShader(source: string) {
    this.reset();
    this.shaderSource = source;
    this.setup();
    this.init();
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  compile(shader: WebGLShader, source: string) {
    const { gl } = this;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    }
  }

  test(source: string): string | null {
    const { gl } = this;
    const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const result = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
      ? null
      : gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    return result;
  }

  reset() {
    const { gl } = this;
    if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
      if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
      gl.deleteProgram(this.program);
    }
  }

  setup() {
    const { gl } = this;
    this.vs = gl.createShader(gl.VERTEX_SHADER)!;
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.shaderSource);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const { gl, program } = this;
    if (!program) return;

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = program as any;
    p.resolution = gl.getUniformLocation(program, "resolution");
    p.time = gl.getUniformLocation(program, "time");
  }

  render(now = 0) {
    const { gl, program } = this;
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = program as any;
    gl.uniform2f(p.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(p.time, now * 1e-3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const visibleRef = useRef<boolean>(true);
  const lastFrameRef = useRef<number>(0);
  const FPS_CAP = 30;
  const FRAME_MS = 1000 / FPS_CAP;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    const resize = () => {
      if (!canvasRef.current) return;
      // Use container dimensions so canvas fills the hero even when it's taller than viewport
      const container = canvasRef.current.parentElement;
      const w = container ? container.offsetWidth : window.innerWidth;
      const h = container ? container.offsetHeight : window.innerHeight;
      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;
      rendererRef.current?.updateScale(dpr);
    };

    rendererRef.current = new WebGLRenderer(canvas, dpr);
    rendererRef.current.setup();
    rendererRef.current.init();
    resize();

    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }

    // Pause rendering when hero is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Watch for container height changes (e.g. font load, content shift)
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!visibleRef.current) return;
      if (now - lastFrameRef.current < FRAME_MS) return;
      lastFrameRef.current = now;
      rendererRef.current?.render(now);
    };
    loop(0);

    window.addEventListener("resize", resize, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      ro.disconnect();
      rendererRef.current?.reset();
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return canvasRef;
}

// ─── Hero Component ───────────────────────────────────────────────────────────

const AnimatedShaderHero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  note,
  identity,
  className = "",
}) => {
  const canvasRef = useShaderBackground();

  return (
    // min-h-dvh: expands to fit content on short screens; overflow-x-hidden only
    <div className={`relative w-full min-h-dvh overflow-x-hidden bg-black ${className}`}>
      {/* Canvas fills the full container height (not just window height) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ background: "black", transform: "translateZ(0)", willChange: "transform", backfaceVisibility: "hidden" }}
        aria-hidden="true"
      />

      {/* Content — relative so it drives the container height; min-h-dvh centres on large screens */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-dvh text-white pt-24 pb-16 px-4">

        <div className="text-center max-w-5xl mx-auto w-full">
          <div className="space-y-1 mb-6">
            {/* Mobile-first font scaling: 2rem → 3rem sm → 4.5rem md → 6rem lg */}
            <h1 className="text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent animate-fade-in-up animation-delay-200 leading-tight">
              {headline.line1}
            </h1>
            <h1 className="text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-400 leading-tight">
              {headline.line2}
            </h1>
            {headline.line3 && (
              <h1 className="text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-200 via-amber-300 to-orange-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-600 leading-tight">
                {headline.line3}
              </h1>
            )}
          </div>

          <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600 mb-8">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-orange-100/90 font-light leading-relaxed">
              {subtitle}
            </p>
          </div>

          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-800">
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className="px-8 py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-300/30 hover:border-orange-300/50 text-orange-100 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}

          {note && (
            <p className="text-xs sm:text-sm text-orange-100/40 animate-fade-in-up animation-delay-800 mt-3">
              {note}
            </p>
          )}
        </div>

        {identity && (
          <div className="mt-10 pt-6 border-t border-white/10 animate-fade-in-up animation-delay-800 text-center">
            <p className="text-base sm:text-xl font-bold text-white mb-1">{identity.name}</p>
            <p className="text-xs sm:text-sm text-orange-200/60">{identity.title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedShaderHero;

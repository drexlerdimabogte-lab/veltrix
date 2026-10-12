"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { useClientSnapshot } from "@/lib/useClientSnapshot";

function seeded(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

/** Pointer state shared between the DOM hit area and the render loop (no React re-renders). */
type Ptr = { hover: boolean; drag: boolean; lastX: number; lastY: number; vx: number; vy: number; t: number; lx: number; ly: number; gx: number; gy: number };

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!; const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.2, "rgba(255,255,255,.4)");
    grd.addColorStop(0.5, "rgba(255,255,255,.1)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
}

const R = 2;
const onSphere = (lat: number, lon: number, r = R) => new THREE.Vector3(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon));

/* Surface dots: front-facing ones bright, back side dimmed so the globe reads as a solid volume. */
const dotVert = `attribute float aSize; attribute float aSeed; uniform float uTime; uniform float uPx; uniform float uIn; varying float vA; varying float vHot;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vec3 n = normalize(normalMatrix * position);
  float facing = n.z; vA = mix(.12, 1., smoothstep(-.2, .5, facing)) * uIn;
  vHot = step(.94, aSeed) * (.55 + .45*sin(uTime*2.2 + aSeed*50.));
  gl_PointSize = aSize * uPx * (1. + vHot) * (7. / -mv.z); gl_Position = projectionMatrix * mv; }`;
const dotFrag = `varying float vA; varying float vHot; void main(){ float d = length(gl_PointCoord - .5); if(d>.5) discard;
  float core = smoothstep(.5,.0,d); vec3 col = mix(vec3(.95,.92,.88), vec3(1.,.18,.14), max(vHot, .25));
  gl_FragColor = vec4(col, core*vA*(.55+vHot)); }`;

/* Lat/long grid, faded on the back hemisphere. */
const gridVert = `varying float vF; void main(){ vec3 n = normalize(normalMatrix * position); vF = smoothstep(-.3, .6, n.z); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
const gridFrag = `uniform float uIn; varying float vF; void main(){ gl_FragColor = vec4(vec3(1.,.28,.22), (.05 + vF*.22) * uIn); }`;

/* Fresnel atmosphere rim. */
const atmoVert = `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const atmoFrag = `uniform float uPulse; uniform float uIn; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 3.2);
  gl_FragColor = vec4(vec3(1.,.16,.1) * f * (1.1 + uPulse*.35), f * .9 * uIn); }`;

/* Arcs / rings with a traveling pulse along aProg (0..1); uDraw reveals the line on entrance. */
const trailVert = `attribute float aProg; attribute float aSeed; varying float vP; varying float vS; void main(){ vP = aProg; vS = aSeed; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const trailFrag = `uniform float uTime; uniform float uDraw; uniform float uBase; uniform float uSpeed; varying float vP; varying float vS;
void main(){ if(vP > uDraw) discard; float head = fract(uTime*uSpeed + vS); float d = vP - head; float pulse = smoothstep(-.18, 0., d) * step(d, 0.);
  vec3 col = mix(vec3(.85,.72,.55), vec3(1.,.2,.14), pulse); gl_FragColor = vec4(col*(1.+pulse*1.6), uBase + pulse*.95); }`;

function Globe({ reduced, mobile, ptr }: { reduced: boolean; mobile: boolean; ptr: MutableRefObject<Ptr> }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const sats = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const mats = useRef<THREE.ShaderMaterial[]>([]);
  const reg = (m: THREE.ShaderMaterial | null) => { if (m && !mats.current.includes(m)) mats.current.push(m); };
  const st = useRef({ rotY: 0.6, rotX: 0, vel: 0.12, intro: reduced ? 1 : 0, tiltX: 0, tiltY: 0 });
  const glow = useGlowTexture();
  const px = Math.min(typeof window !== "undefined" ? devicePixelRatio : 1, 1.6);

  const data = useMemo(() => {
    const rnd = seeded(11);
    const N = mobile ? 700 : 1600;
    const dots = new Float32Array(N * 3), size = new Float32Array(N), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
      dots.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3); size[i] = 1.4 + rnd() * 1.6; seed[i] = rnd();
    }
    const grid: number[] = [];
    const seg = 96;
    for (let la = -60; la <= 60; la += 30) for (let s = 0; s < seg; s++) {
      const a = (s / seg) * Math.PI * 2, b = ((s + 1) / seg) * Math.PI * 2, lat = (la * Math.PI) / 180;
      grid.push(...onSphere(lat, a, R * 1.002).toArray(), ...onSphere(lat, b, R * 1.002).toArray());
    }
    for (let lo = 0; lo < 180; lo += 30) for (let s = 0; s < seg; s++) {
      const a = (s / seg) * Math.PI * 2, b = ((s + 1) / seg) * Math.PI * 2, lon = (lo * Math.PI) / 180;
      const p = (t: number) => new THREE.Vector3(R * 1.002 * Math.sin(t) * Math.cos(lon), R * 1.002 * Math.cos(t), R * 1.002 * Math.sin(t) * Math.sin(lon));
      grid.push(...p(a).toArray(), ...p(b).toArray());
    }
    // great-circle-ish arcs lifted above the surface
    const A = mobile ? 7 : 12, aPos: number[] = [], aProg: number[] = [], aSeed: number[] = [];
    const S = 48;
    for (let k = 0; k < A; k++) {
      const p0 = onSphere((rnd() - 0.5) * 2.2, rnd() * Math.PI * 2), p1 = onSphere((rnd() - 0.5) * 2.2, rnd() * Math.PI * 2);
      const lift = 1 + 0.25 + p0.distanceTo(p1) * 0.12, sd = rnd();
      let prev: THREE.Vector3 | null = null;
      for (let s = 0; s <= S; s++) {
        const t = s / S, v = new THREE.Vector3().copy(p0).lerp(p1, t).normalize().multiplyScalar(R * (1 + (lift - 1) * Math.sin(Math.PI * t)));
        if (prev) { aPos.push(...prev.toArray(), ...v.toArray()); aProg.push((s - 1) / S, t); aSeed.push(sd, sd); }
        prev = v;
      }
    }
    const ring = (r: number) => { const pos: number[] = [], pr: number[] = [], sd: number[] = []; const n = 220;
      for (let s = 0; s < n; s++) { const a = (s / n) * Math.PI * 2, b = ((s + 1) / n) * Math.PI * 2;
        pos.push(Math.cos(a) * r, 0, Math.sin(a) * r, Math.cos(b) * r, 0, Math.sin(b) * r); pr.push(s / n, (s + 1) / n); sd.push(0, 0); }
      return { pos: new Float32Array(pos), prog: new Float32Array(pr), seed: new Float32Array(sd) }; };
    const D = mobile ? 120 : 320, dust = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) dust.set([(rnd() - 0.5) * 16, (rnd() - 0.5) * 10, (rnd() - 0.5) * 8 - 3], i * 3);
    return { dots, size, seed, grid: new Float32Array(grid), arcs: { pos: new Float32Array(aPos), prog: new Float32Array(aProg), seed: new Float32Array(aSeed) },
      ring1: ring(2.75), ring2: ring(3.2), dust };
  }, [mobile]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05), s = st.current, p = ptr.current, t = state.clock.elapsedTime;
    if (!reduced) s.intro = Math.min(1, s.intro + d / 1.8);
    const k = reduced ? 1 : easeOutExpo(s.intro);
    if (!reduced) {
      if (p.drag) { const live = performance.now() - p.t < 90; // pointer velocity only counts while it is still moving
        s.vel = THREE.MathUtils.damp(s.vel, live ? p.vx : 0, 12, d); if (live) s.rotX = THREE.MathUtils.clamp(s.rotX + p.vy * d, -0.6, 0.6); }
      else s.vel = THREE.MathUtils.damp(s.vel, p.hover ? 0.9 : 0.12, p.hover ? 2.2 : 1.1, d); // smooth speed-up on hover, inertia after drag
      s.rotY += s.vel * d;
      s.rotX = THREE.MathUtils.damp(s.rotX, 0, p.drag ? 0 : 0.8, d);
      s.tiltX = THREE.MathUtils.damp(s.tiltX, p.hover ? p.ly * 0.35 : p.gy * 0.12, 3, d);
      s.tiltY = THREE.MathUtils.damp(s.tiltY, p.hover ? p.lx * 0.45 : p.gx * 0.15, 3, d);
    }
    if (spin.current) spin.current.rotation.set(s.rotX + 0.32, s.rotY, 0);
    if (root.current) { root.current.rotation.set(s.tiltX, s.tiltY, 0); root.current.scale.setScalar((mobile ? 0.98 : 1.08) * (0.72 + 0.28 * k)); }
    if (rings.current && !reduced) { rings.current.rotation.y = t * 0.08; rings.current.rotation.z = 0.35 + Math.sin(t * 0.3) * 0.04; }
    if (sats.current && !reduced) sats.current.children.forEach((c, i) => { const a = t * (0.25 + i * 0.07) + i * 2.1, r = 2.75 + (i % 2) * 0.45; c.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.25, Math.sin(a) * r); });
    const pulse = reduced ? 0 : Math.sin(t * 1.4) * 0.5 + 0.5;
    if (halo.current) { const sc = 6.4 + pulse * 0.5; halo.current.scale.set(sc, sc, 1); (halo.current.material as THREE.SpriteMaterial).opacity = 0.32 * k; }
    for (const m of mats.current) { const u = m.uniforms;
      if (u.uTime) u.uTime.value = reduced ? 0 : t; if (u.uIn) u.uIn.value = k; if (u.uPulse) u.uPulse.value = pulse;
      if (u.uDraw) u.uDraw.value = reduced ? 1 : THREE.MathUtils.clamp((s.intro - 0.25) / 0.6, 0, 1.001); }
  });

  const trail = (base: number, speed: number) => ({ uTime: { value: 0 }, uDraw: { value: reduced ? 1 : 0 }, uBase: { value: base }, uSpeed: { value: speed } });
  return (
    <group ref={root}>
      <sprite ref={halo} scale={[6.4, 6.4, 1]}>
        <spriteMaterial map={glow} color="#ff2a1f" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <group ref={spin}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.dots, 3]} />
            <bufferAttribute attach="attributes-aSize" args={[data.size, 1]} />
            <bufferAttribute attach="attributes-aSeed" args={[data.seed, 1]} />
          </bufferGeometry>
          <shaderMaterial ref={reg} transparent depthWrite={false} blending={THREE.AdditiveBlending}
            uniforms={{ uTime: { value: 0 }, uPx: { value: px }, uIn: { value: 0 } }} vertexShader={dotVert} fragmentShader={dotFrag} />
        </points>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.grid, 3]} /></bufferGeometry>
          <shaderMaterial ref={reg} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{ uIn: { value: 0 } }} vertexShader={gridVert} fragmentShader={gridFrag} />
        </lineSegments>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.arcs.pos, 3]} />
            <bufferAttribute attach="attributes-aProg" args={[data.arcs.prog, 1]} />
            <bufferAttribute attach="attributes-aSeed" args={[data.arcs.seed, 1]} />
          </bufferGeometry>
          <shaderMaterial ref={reg} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={trail(0.1, 0.35)} vertexShader={trailVert} fragmentShader={trailFrag} />
        </lineSegments>
      </group>
      <mesh scale={1.14}>
        <sphereGeometry args={[R, 64, 64]} />
        <shaderMaterial ref={reg} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending}
          uniforms={{ uPulse: { value: 0 }, uIn: { value: 0 } }} vertexShader={atmoVert} fragmentShader={atmoFrag} />
      </mesh>
      <group ref={rings} rotation={[0, 0, 0.35]}>
        {[data.ring1, data.ring2].map((rg, i) => (
          <lineSegments key={i} rotation={[1.2 + i * 0.22, 0, i * 0.4]}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[rg.pos, 3]} />
              <bufferAttribute attach="attributes-aProg" args={[rg.prog, 1]} />
              <bufferAttribute attach="attributes-aSeed" args={[rg.seed, 1]} />
            </bufferGeometry>
            <shaderMaterial ref={reg} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={trail(i ? 0.08 : 0.16, i ? 0.06 : 0.1)} vertexShader={trailVert} fragmentShader={trailFrag} />
          </lineSegments>
        ))}
      </group>
      <group ref={sats}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * (2.75 + (i % 2) * 0.45), 0, Math.sin(i * 2.1) * (2.75 + (i % 2) * 0.45)]}>
            <sphereGeometry args={[i === 0 ? 0.05 : 0.032, 12, 12]} />
            <meshBasicMaterial color={i === 0 ? "#ff3a2c" : "#efe4d2"} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.dust, 3]} /></bufferGeometry>
        <pointsMaterial size={0.016} color="#d8c3a0" transparent opacity={0.28} depthWrite={false} />
      </points>
    </group>
  );
}

export default function NeuralCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const ptr = useRef<Ptr>({ hover: false, drag: false, lastX: 0, lastY: 0, vx: 0, vy: 0, t: 0, lx: 0, ly: 0, gx: 0, gy: 0 });
  // "" on the server → canvas is client-only; otherwise "<reduced><mobile>" flags, e.g. "01".
  const envKey = useClientSnapshot(() => `${matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0}${innerWidth < 768 ? 1 : 0}`, "");
  const env = envKey ? { reduced: envKey[0] === "1", mobile: envKey[1] === "1" } : null;
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    const m = (e: PointerEvent) => { ptr.current.gx = e.clientX / innerWidth - 0.5; ptr.current.gy = e.clientY / innerHeight - 0.5; };
    addEventListener("pointermove", m);
    return () => { io.disconnect(); removeEventListener("pointermove", m); };
  }, []);

  const local = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ptr.current.lx = (e.clientX - r.left) / r.width - 0.5; ptr.current.ly = (e.clientY - r.top) / r.height - 0.5;
  };
  return (
    <div ref={wrap} className="hero-canvas">
      {env && (
        <Canvas style={{ pointerEvents: "none" }} dpr={env.mobile ? [1, 1.3] : [1, 1.6]} camera={{ position: [0, 0, 8.2], fov: 45 }} frameloop={env.reduced ? "demand" : visible ? "always" : "never"}
          gl={{ antialias: !env.mobile, alpha: true, powerPreference: "high-performance" }}>
          <Globe reduced={env.reduced} mobile={env.mobile} ptr={ptr} />
        </Canvas>
      )}
      {/* Circular hit area around the globe only: the rest of the canvas lets clicks through to the headline/CTA. */}
      {env && !env.reduced && (
        <div className="globe-hit" data-cursor="Drag"
          onPointerEnter={(e) => { ptr.current.hover = true; local(e); }}
          onPointerLeave={() => { ptr.current.hover = false; }}
          onPointerDown={(e) => { const p = ptr.current; p.drag = true; p.lastX = e.clientX; p.lastY = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { local(e); const p = ptr.current; if (!p.drag) return;
            p.vx = (e.clientX - p.lastX) * 0.6; p.vy = (e.clientY - p.lastY) * 0.3; p.lastX = e.clientX; p.lastY = e.clientY; p.t = performance.now(); }}
          onPointerUp={(e) => { ptr.current.drag = false; if (e.pointerType !== "mouse") ptr.current.hover = false; }}
          onPointerCancel={() => { ptr.current.drag = false; ptr.current.hover = false; }} />
      )}
    </div>
  );
}

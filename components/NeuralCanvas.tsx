"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { useClientSnapshot } from "@/lib/useClientSnapshot";

type Ptr = { hover: boolean; drag: boolean; lastX: number; lastY: number; vx: number; vy: number; t: number; lx: number; ly: number; gx: number; gy: number };
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

function seeded(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

/** Soft radial texture for additive volumetric halos (generated, no assets). */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!; const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.18, "rgba(255,255,255,.45)");
    grd.addColorStop(0.45, "rgba(255,255,255,.12)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
}

const nodeVert = `attribute float aSize; attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA; varying float vHot;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); float z = -mv.z;
  vHot = step(.93, aSeed) * (.6 + .4*sin(uTime*2. + aSeed*40.));
  vA = smoothstep(12., 4.5, z);
  gl_PointSize = aSize * uPx * (1. + vHot*1.5) * (9. / z); gl_Position = projectionMatrix * mv; }`;
const nodeFrag = `varying float vA; varying float vHot; void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if(d>.5) discard;
  float core = smoothstep(.5,.0,d); vec3 col = mix(vec3(.96,.93,.88), vec3(1.,.2,.16), vHot);
  gl_FragColor = vec4(col, core*core*vA*(.75+vHot)); }`;

function Neural({ reduced, mobile, ptr }: { reduced: boolean; mobile: boolean; ptr: MutableRefObject<Ptr> }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const st = useRef({ rotY: 0.4, rotX: 0, vel: 0.14, intro: reduced ? 1 : 0, tiltX: 0, tiltY: 0, glow: 0 });
  const shell = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const lineMat = useRef<THREE.ShaderMaterial>(null);
  const nodeMat = useRef<THREE.ShaderMaterial>(null);
  const glow = useGlowTexture();

  const { nodes, sizes, seeds, lines, dust } = useMemo(() => {
    const rnd = seeded(7);
    const N = mobile ? 110 : 280;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
      const rad = 2.1 + (rnd() - 0.5) * 0.9;
      pts.push(new THREE.Vector3(Math.cos(th) * r * rad * 1.15, y * rad * 0.92, Math.sin(th) * r * rad));
    }
    const nodePos = new Float32Array(N * 3), sz = new Float32Array(N), sd = new Float32Array(N);
    pts.forEach((p, i) => { p.toArray(nodePos, i * 3); sz[i] = 2 + rnd() * 3.5; sd[i] = rnd(); });
    const seg: number[] = [], prog: number[] = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      if (pts[i].distanceTo(pts[j]) < 0.78 && rnd() > 0.35) { seg.push(...pts[i].toArray(), ...pts[j].toArray()); const o = rnd(); prog.push(o, o + 1); }
    }
    const D = mobile ? 220 : 650, dustPos = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) { dustPos[i * 3] = (rnd() - 0.5) * 18; dustPos[i * 3 + 1] = (rnd() - 0.5) * 11; dustPos[i * 3 + 2] = (rnd() - 0.5) * 10 - 2; }
    return { nodes: nodePos, sizes: sz, seeds: sd, lines: { pos: new Float32Array(seg), prog: new Float32Array(prog) }, dust: dustPos };
  }, [mobile]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime, g = group.current; if (!g) return;
    const d = Math.min(dt, 0.05), s = st.current, p = ptr.current;
    if (reduced) return; // static frame under reduced motion
    s.intro = Math.min(1, s.intro + d / 1.8);
    const k = easeOutExpo(s.intro);
    // steady axial spin (like a globe), faster on hover, inertia after drag
    if (p.drag) { const live = performance.now() - p.t < 90;
      s.vel = THREE.MathUtils.damp(s.vel, live ? p.vx : 0, 12, d); if (live) s.rotX = THREE.MathUtils.clamp(s.rotX + p.vy * d, -0.7, 0.7); }
    else s.vel = THREE.MathUtils.damp(s.vel, p.hover ? 0.75 : 0.14, p.hover ? 2.2 : 1.1, d);
    s.rotY += s.vel * d;
    s.rotX = THREE.MathUtils.damp(s.rotX, 0, p.drag ? 0 : 0.8, d);
    // turn/tilt toward the mouse
    s.tiltX = THREE.MathUtils.damp(s.tiltX, p.hover ? p.ly * 0.5 : p.gy * 0.3, 3, d);
    s.tiltY = THREE.MathUtils.damp(s.tiltY, p.hover ? p.lx * 0.6 : p.gx * 0.25, 3, d);
    s.glow = THREE.MathUtils.damp(s.glow, p.hover || p.drag ? 1 : 0, 3, d);
    if (spin.current) spin.current.rotation.set(s.rotX + 0.18, s.rotY, 0);
    g.rotation.set(s.tiltX, s.tiltY, -p.gx * 0.12);
    g.position.set(p.gx * 0.3, -p.gy * 0.18 + Math.sin(t * 0.6) * 0.06, 0);
    g.scale.setScalar((mobile ? 0.95 : 1.15) * (0.7 + 0.3 * k) * (1 + s.glow * 0.04));
    state.camera.position.x = p.gx * 0.5; state.camera.position.y = -p.gy * 0.35; state.camera.lookAt(0, 0, 0);
    if (core.current) { const sc = 1 + Math.sin(t * 1.3) * 0.05 + s.glow * 0.12; core.current.scale.setScalar(sc); core.current.rotation.set(t * 0.3, t * 0.45, 0); }
    if (shell.current) shell.current.rotation.set(-t * 0.06, -t * 0.1, t * 0.02);
    if (orbit.current) orbit.current.children.forEach((c, i) => { const a = t * (0.35 + i * 0.09) + i * 2.3, r = 2.6 + (i % 2) * 0.5; c.position.set(Math.cos(a) * r, Math.sin(a * 1.4 + i) * 0.9, Math.sin(a) * r); });
    if (halo.current) { const sc = 4.2 + Math.sin(t * 1.3) * 0.3 + s.glow * 0.8; halo.current.scale.set(sc, sc, 1); (halo.current.material as THREE.SpriteMaterial).opacity = 0.55 * k; }
    if (lineMat.current) { lineMat.current.uniforms.uTime.value = t; lineMat.current.uniforms.uBoost.value = 1 + s.glow; }
    if (nodeMat.current) nodeMat.current.uniforms.uTime.value = t;
  });

  return (
    <group ref={group} scale={mobile ? 0.95 : 1.15}>
      {/* volumetric halos */}
      <sprite ref={halo} scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={glow} color="#ff2a1f" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite scale={[9, 9, 1]}>
        <spriteMaterial map={glow} color="#7a0d08" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <group ref={spin}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodes, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial ref={nodeMat} transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={{ uTime: { value: 0 }, uPx: { value: Math.min(typeof window !== "undefined" ? devicePixelRatio : 1, 1.6) } }}
          vertexShader={nodeVert} fragmentShader={nodeFrag} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines.pos, 3]} />
          <bufferAttribute attach="attributes-aProg" args={[lines.prog, 1]} />
        </bufferGeometry>
        <shaderMaterial ref={lineMat} transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={{ uTime: { value: 0 }, uBoost: { value: 1 } }}
          vertexShader={`attribute float aProg; varying float vP; varying float vZ; void main(){ vP=aProg; vec4 mv=modelViewMatrix*vec4(position,1.); vZ=-mv.z; gl_Position=projectionMatrix*mv; }`}
          fragmentShader={`uniform float uTime; uniform float uBoost; varying float vP; varying float vZ; void main(){ float p=fract(vP*.5-uTime*.22*uBoost); float hot=smoothstep(.95,1.,p); vec3 base=vec3(.6,.55,.5)*.2; vec3 red=vec3(1.,.16,.12); float fade=smoothstep(11.5,4.,vZ); gl_FragColor=vec4(base+red*hot*1.8,(0.22+hot*.95)*fade); }`} />
      </lineSegments>
      <mesh ref={shell}>
        <icosahedronGeometry args={[2.95, 2]} />
        <meshBasicMaterial color="#c9a96e" wireframe transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color="#1a1a1a" emissive="#ff2a2a" emissiveIntensity={0.7} metalness={0.9} roughness={0.25} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshBasicMaterial color="#ff4a3a" toneMapped={false} />
      </mesh>
      </group>
      <group ref={orbit}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}><sphereGeometry args={[i === 0 ? 0.05 : 0.03, 12, 12]} /><meshBasicMaterial color={i === 0 ? "#ff3a2c" : "#efe4d2"} toneMapped={false} /></mesh>
        ))}
      </group>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry>
        <pointsMaterial size={0.018} color="#d8c3a0" transparent opacity={0.4} depthWrite={false} fog />
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
        <Canvas style={{ pointerEvents: "none" }} dpr={env.mobile ? [1, 1.3] : [1, 1.6]} camera={{ position: [0, 0, 7], fov: 45 }} frameloop={env.reduced ? "demand" : visible ? "always" : "never"}
          gl={{ antialias: !env.mobile, alpha: true, powerPreference: "high-performance" }}>
          <fog attach="fog" args={["#070707", 5.5, 12]} />
          <ambientLight intensity={0.15} />
          <pointLight position={[3, 2, 4]} intensity={34} color="#ff2a2a" />
          <pointLight position={[-4, -2, 2]} intensity={14} color="#d8b98a" />
          <Neural reduced={env.reduced} mobile={env.mobile} ptr={ptr} />
        </Canvas>
      )}
      {/* Circular hit area around the shape only: the rest of the canvas lets clicks through to the headline/CTA. */}
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

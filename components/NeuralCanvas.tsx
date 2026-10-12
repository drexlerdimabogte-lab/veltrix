"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useClientSnapshot } from "@/lib/useClientSnapshot";

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

function Neural({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const lineMat = useRef<THREE.ShaderMaterial>(null);
  const nodeMat = useRef<THREE.ShaderMaterial>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const glow = useGlowTexture();
  const baseX = 0;

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

  useEffect(() => {
    const m = (e: PointerEvent) => { target.current.x = e.clientX / innerWidth - 0.5; target.current.y = e.clientY / innerHeight - 0.5; };
    addEventListener("pointermove", m); return () => removeEventListener("pointermove", m);
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime, g = group.current; if (!g) return;
    const d = Math.min(dt, 0.05);
    // critically-damped mouse follow
    cur.current.x = THREE.MathUtils.damp(cur.current.x, target.current.x, 2.6, d);
    cur.current.y = THREE.MathUtils.damp(cur.current.y, target.current.y, 2.6, d);
    if (reduced) return; // static frame under reduced motion
    g.rotation.y += d * 0.06;
    g.rotation.x = cur.current.y * 0.4;
    g.rotation.z = -cur.current.x * 0.22;
    g.position.x = baseX + cur.current.x * 0.35;
    g.position.y = -cur.current.y * 0.2;
    state.camera.position.x = cur.current.x * 0.6; state.camera.position.y = -cur.current.y * 0.4; state.camera.lookAt(0, 0, 0);
    if (core.current) { const s = 1 + Math.sin(t * 1.3) * 0.035; core.current.scale.setScalar(s); core.current.rotation.set(t * 0.18, t * 0.27, 0); }
    if (shell.current) shell.current.rotation.set(-t * 0.05, -t * 0.08, 0);
    if (halo.current) { const s = 4.2 + Math.sin(t * 1.3) * 0.25; halo.current.scale.set(s, s, 1); }
    const tt = reduced ? 0 : t;
    if (lineMat.current) lineMat.current.uniforms.uTime.value = tt;
    if (nodeMat.current) nodeMat.current.uniforms.uTime.value = tt;
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={mobile ? 0.95 : 1.15}>
      {/* volumetric halos */}
      <sprite ref={halo} scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={glow} color="#ff2a1f" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite scale={[9, 9, 1]}>
        <spriteMaterial map={glow} color="#7a0d08" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
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
          uniforms={{ uTime: { value: 0 } }}
          vertexShader={`attribute float aProg; varying float vP; varying float vZ; void main(){ vP=aProg; vec4 mv=modelViewMatrix*vec4(position,1.); vZ=-mv.z; gl_Position=projectionMatrix*mv; }`}
          fragmentShader={`uniform float uTime; varying float vP; varying float vZ; void main(){ float p=fract(vP*.5-uTime*.22); float hot=smoothstep(.95,1.,p); vec3 base=vec3(.6,.55,.5)*.2; vec3 red=vec3(1.,.16,.12); float fade=smoothstep(11.5,4.,vZ); gl_FragColor=vec4(base+red*hot*1.8,(0.22+hot*.95)*fade); }`} />
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
  // "" on the server → canvas is client-only; otherwise "<reduced><mobile>" flags, e.g. "01".
  const envKey = useClientSnapshot(() => `${matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0}${innerWidth < 768 ? 1 : 0}`, "");
  const env = envKey ? { reduced: envKey[0] === "1", mobile: envKey[1] === "1" } : null;
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="hero-canvas">
      {env && (
        <Canvas dpr={env.mobile ? [1, 1.3] : [1, 1.6]} camera={{ position: [0, 0, 7], fov: 45 }} frameloop={env.reduced ? "demand" : visible ? "always" : "never"}
          gl={{ antialias: !env.mobile, alpha: true, powerPreference: "high-performance" }}>
          <fog attach="fog" args={["#070707", 5.5, 12]} />
          <ambientLight intensity={0.15} />
          <pointLight position={[3, 2, 4]} intensity={34} color="#ff2a2a" />
          <pointLight position={[-4, -2, 2]} intensity={14} color="#d8b98a" />
          <Neural reduced={env.reduced} mobile={env.mobile} />
        </Canvas>
      )}
    </div>
  );
}

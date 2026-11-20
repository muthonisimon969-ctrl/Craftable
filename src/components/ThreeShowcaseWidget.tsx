import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeShowcaseWidgetProps {
  heightPx?: number;
}

export function ThreeShowcaseWidget({ heightPx = 220 }: ThreeShowcaseWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    let frameId = 0;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        48,
        container.clientWidth / Math.max(1, container.clientHeight),
        0.1,
        100
      );
      camera.position.set(0, 0.8, 5.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xc7d2fe, 0.75));
      const key = new THREE.DirectionalLight(0xff8370, 1.5);
      key.position.set(4, 5, 4);
      scene.add(key);

      const rim = new THREE.PointLight(0x818cf8, 2.2, 20);
      rim.position.set(-4, -2, 3);
      scene.add(rim);

      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.1, 0.34, 120, 20),
        new THREE.MeshStandardMaterial({
          color: 0x6366f1,
          roughness: 0.22,
          metalness: 0.65,
        })
      );
      scene.add(knot);

      const orbGeo = new THREE.IcosahedronGeometry(0.45, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xff5e5b,
        wireframe: true,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(2.1, 0.7, -0.4);
      scene.add(orb);

      const ptsCount = 180;
      const pos = new Float32Array(ptsCount * 3);
      for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 10;
      const ptsGeo = new THREE.BufferGeometry();
      ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(
        ptsGeo,
        new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.05 })
      );
      scene.add(pts);

      let targetRx = 0;
      let targetRy = 0;
      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
        const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
        targetRy = nx * 0.65;
        targetRx = ny * 0.45;
      };
      container.addEventListener('pointermove', onPointerMove);

      const onResize = () => {
        if (!renderer || !container) return;
        camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const renderLoop = () => {
        frameId = requestAnimationFrame(renderLoop);
        const t = clock.getElapsedTime();
        knot.rotation.y = t * 0.45 + targetRy;
        knot.rotation.x = t * 0.22 + targetRx;
        orb.rotation.y = -t * 0.8;
        orb.position.y = Math.sin(t * 1.4) * 0.55;
        pts.rotation.y = t * 0.06;
        renderer?.render(scene, camera);
      };
      renderLoop();

      return () => {
        cancelAnimationFrame(frameId);
        container.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        knot.geometry.dispose();
        (knot.material as THREE.Material).dispose();
        orbGeo.dispose();
        orbMat.dispose();
        ptsGeo.dispose();
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      return undefined;
    }
  }, []);

  return (
    <div
      ref={hostRef}
      aria-label="Interactive 3D showcase viewport"
      style={{
        width: '100%',
        height: heightPx,
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid var(--border-soft)',
        background: 'radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.16), var(--surface-container))',
      }}
    />
  );
}

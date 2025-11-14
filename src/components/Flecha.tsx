import * as THREE from "three";
import { useMemo } from "react";

interface FlechaProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

export default function Flecha({ from, to, color = "black" }: FlechaProps) {
  const arrow = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);

    const dir = end.clone().sub(start).normalize();
    const len = start.distanceTo(end);

    return new THREE.ArrowHelper(dir, start, len, color);
  }, [from, to, color]);

  return <primitive object={arrow} />;
}

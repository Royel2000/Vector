import { OrbitControls, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState, useMemo } from "react";
import * as THREE from "three";
import Flecha from "./components/Flecha";

interface VectorData {
  name: string;
  components: [number, number, number];
  color: string;
}

export default function VectorCalculator() {
  const [mode, setMode] = useState<"2D" | "3D">("3D");
  const [vectors, setVectors] = useState<VectorData[]>([]);
  const [showIndividualVectors, setShowIndividualVectors] = useState(true);
  const [showPolygonPoints, setShowPolygonPoints] = useState(false);

  // --- Construcción del polígono ---
  const polygonSegments = useMemo(() => buildPolygon(vectors), [vectors]);

  // --- Crear el Shape para dibujar el área ---
  const polygonAreaShape = useMemo(() => {
    if (mode !== "2D") return null;
    return buildShapeFromSegments(polygonSegments);
  }, [polygonSegments, mode]);

  // --- Área automática ---
  const area = useMemo(() => {
    if (mode !== "2D") return null;
    return computePolygonArea(vectors);
  }, [vectors, mode]);

  // --- SUMA VECTORIAL ---
  const sum = vectors.reduce<[number, number, number]>(
    (acc, v) =>
      acc.map((n, i) => n + v.components[i]) as [number, number, number],
    [0, 0, 0]
  );

  // --- CÁLCULO DE r Y θ SOLO PARA 2D ---
  const r = Math.sqrt(sum[0] * sum[0] + sum[1] * sum[1]);
  const theta = Math.atan2(sum[1], sum[0]) * (180 / Math.PI);

  const addVector = () => {
    setVectors((prev) => [
      ...prev,
      {
        name: `V${prev.length + 1}`,
        components: [0, 0, 0],
        color: getRandomColor(),
      },
    ]);
  };

  const updateComponent = (i: number, index: number, value: number) => {
    const copy = [...vectors];
    copy[i].components[index] = value;
    setVectors(copy);
  };

  const removeVector = (index: number) => {
    setVectors((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePolar = (i: number, type: "r" | "theta", value: number) => {
    const copy = [...vectors];
    const [x, y] = copy[i].components;

    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x) * (180 / Math.PI);

    const newR = type === "r" ? value : r;
    const newTheta = type === "theta" ? value : theta;

    const rad = (newTheta * Math.PI) / 180;

    copy[i].components = [newR * Math.cos(rad), newR * Math.sin(rad), 0];
    setVectors(copy);
  };

  return (
    <div
      className="flex flex-col lg:flex-row w-full min-h-screen p-4 
                    bg-gray-100 text-gray-900 dark:bg-zinc-950"
    >
      {/* -------- SCENE -------- */}
      <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
        <Canvas
          camera={{
            position: mode === "3D" ? [5, 5, 5] : [0, 0, 80],
            up: new THREE.Vector3(0, 1, 0),
            fov: 50,
          }}
        >
          <ambientLight intensity={1} />
          {mode === "3D" && <gridHelper args={[100, 40]} />}
          <axesHelper args={[50]} />

          <OrbitControls enableRotate />

          {/* Rotación para modo 2D */}
          <group rotation={mode === "2D" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
            {/* --- ÁREA DEL POLÍGONO (Relleno gris) --- */}
            {mode === "2D" && polygonAreaShape && (
              <mesh>
                <shapeGeometry args={[polygonAreaShape]} />
                <meshBasicMaterial
                  color="gray"
                  transparent
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* --- ETIQUETA AREA --- */}
            {area !== null && (
              <Html position={[0, 0, 0]}>
                <div className="text-white text-xs bg-black/60 px-2 py-1 rounded">
                  Área = {area.toFixed(2)} u²
                </div>
              </Html>
            )}

            {/* Vectores individuales */}
            {showIndividualVectors &&
              vectors.map((v, i) => (
                <Flecha
                  key={i}
                  from={[0, 0, 0]}
                  to={v.components}
                  color={v.color}
                />
              ))}

            {/* Polígono método del polígono */}
            {polygonSegments.map((seg, i) => (
              <group key={i}>
                <Flecha from={seg.from} to={seg.to} color="grey" />

                {showPolygonPoints && (
                  <>
                    <Html position={seg.from}>
                      <div className="text-xs bg-black/50 text-white px-1 rounded">
                        ({seg.from[0].toFixed(2)}, {seg.from[1].toFixed(2)})
                      </div>
                    </Html>
                    <Html position={seg.to}>
                      <div className="text-xs bg-black/50 text-white px-1 rounded">
                        ({seg.to[0].toFixed(2)}, {seg.to[1].toFixed(2)})
                      </div>
                    </Html>
                  </>
                )}
              </group>
            ))}

            <Flecha from={[0, 0, 0]} to={sum} color="red" />
          </group>
        </Canvas>
      </div>

      {/* -------- PANEL -------- */}
      <div className="w-full lg:w-96 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 mt-4 lg:mt-0 lg:ml-4">
        <h2 className="text-xl mb-3 font-bold dark:text-white">
          Calculadora de Vectores 3D
        </h2>

        <button
          onClick={() => setShowIndividualVectors((v) => !v)}
          className="bg-blue-600 text-white px-3 py-2 rounded w-full mb-3"
        >
          {showIndividualVectors ? "Ocultar vectores" : "Mostrar vectores"}
        </button>

        {mode === "2D" && (
          <button
            onClick={() => setShowPolygonPoints((v) => !v)}
            className="bg-purple-600 text-white px-3 py-2 rounded w-full mb-4"
          >
            {showPolygonPoints ? "Ocultar coordenadas" : "Mostrar coordenadas"}
          </button>
        )}

        <label className="font-semibold dark:text-zinc-300">Dimensiones:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "2D" | "3D")}
          className="w-full mb-4 border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
        >
          <option value="3D">3D (x, y, z)</option>
          <option value="2D">2D (magnitud, ángulo)</option>
        </select>

        {/* Inputs */}
        {vectors.map((v, i) =>
          mode === "3D" ? (
            <div key={i} className="flex gap-2 items-center mb-2">
              {v.components.map((c, j) => (
                <input
                  key={j}
                  type="number"
                  value={c}
                  onChange={(e) =>
                    updateComponent(i, j, parseFloat(e.target.value) || 0)
                  }
                  className="w-1/3 border rounded px-1 py-1 text-center 
                            dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                />
              ))}
              <button
                onClick={() => removeVector(i)}
                className="bg-red-500 text-white rounded px-2 py-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <div key={i} className="flex gap-2 items-center mb-2">
              <input
                type="number"
                placeholder="r"
                onChange={(e) =>
                  updatePolar(i, "r", parseFloat(e.target.value) || 0)
                }
                className="w-1/2 border rounded px-1 py-1 text-center 
                          dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
              />
              <input
                type="number"
                placeholder="θ°"
                onChange={(e) =>
                  updatePolar(i, "theta", parseFloat(e.target.value) || 0)
                }
                className="w-1/2 border rounded px-1 py-1 text-center 
                          dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
              />
              <button
                onClick={() => removeVector(i)}
                className="bg-red-500 text-white rounded px-2 py-1"
              >
                ✕
              </button>
            </div>
          )
        )}

        <button
          onClick={addVector}
          className="bg-emerald-500 text-white px-3 py-2 rounded w-full mt-2"
        >
          Añadir vector
        </button>

        <div className="mt-4 dark:text-zinc-300">
          <h3 className="font-semibold mb-1">Vector Resultante</h3>

          <p>R = ({sum.map((n) => n.toFixed(2)).join(", ")})</p>

          {mode === "2D" && (
            <p>
              r = {r.toFixed(2)}, θ = {theta.toFixed(2)}°
            </p>
          )}
        </div>

        {area !== null && (
          <div className="mt-3 dark:text-zinc-300">
            <h3 className="font-semibold">Área del polígono:</h3>
            <p>{area.toFixed(2)} unidades²</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------- UTILIDADES ---------------------- */

function buildPolygon(vectors: VectorData[]) {
  const segments: {
    from: [number, number, number];
    to: [number, number, number];
  }[] = [];

  let current: [number, number, number] = [0, 0, 0];

  vectors.forEach((v) => {
    const next: [number, number, number] = [
      current[0] + v.components[0],
      current[1] + v.components[1],
      current[2] + v.components[2],
    ];

    segments.push({ from: current, to: next });
    current = next;
  });

  return segments;
}

function buildShapeFromSegments(segments: ReturnType<typeof buildPolygon>) {
  if (segments.length < 2) return null;

  const shape = new THREE.Shape();

  const first = segments[0].from;
  shape.moveTo(first[0], first[1]);

  segments.forEach((seg) => {
    shape.lineTo(seg.to[0], seg.to[1]);
  });

  shape.lineTo(first[0], first[1]); // cerrar

  return shape;
}

function computePolygonArea(vectors: VectorData[]) {
  if (vectors.length < 2) return 0;

  const pts: { x: number; y: number }[] = [];
  let x = 0,
    y = 0;

  pts.push({ x: 0, y: 0 });

  vectors.forEach((v) => {
    x += v.components[0];
    y += v.components[1];
    pts.push({ x, y });
  });

  let sum = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    sum += p.x * q.y - p.y * q.x;
  }

  const p0 = pts[0];
  const pn = pts[pts.length - 1];
  sum += pn.x * p0.y - pn.y * p0.x;

  return Math.abs(sum) / 2;
}

function getRandomColor() {
  const colors = ["blue", "orange", "purple", "cyan", "magenta"];
  return colors[Math.floor(Math.random() * colors.length)];
}

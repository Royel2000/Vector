import { OrbitControls, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState, useMemo } from "react";
import * as THREE from "three";
import Flecha from "./components/Flecha";
import { motion, AnimatePresence } from "framer-motion";

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

  // Construcción del polígono
  const polygonSegments = useMemo(() => buildPolygon(vectors), [vectors]);

  // Shape para el área
  const polygonAreaShape = useMemo(() => {
    if (mode !== "2D") return null;
    return buildShapeFromSegments(polygonSegments);
  }, [polygonSegments, mode]);

  // Cálculo del área
  const area = useMemo(() => {
    if (mode !== "2D") return null;
    return computePolygonArea(vectors);
  }, [vectors, mode]);

  // SUMA VECTORIAL
  const sum = vectors.reduce<[number, number, number]>(
    (acc, v) =>
      acc.map((n, i) => n + v.components[i]) as [number, number, number],
    [0, 0, 0]
  );

  // SOLO EN 2D — r y θ
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-100 text-gray-900 dark:bg-zinc-950"
    >
      {/* PANEL INFERIOR FLOTANTE */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute z-50 bottom-3"
      >
        <div className="flex mb-2 gap-x-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowIndividualVectors((v) => !v)}
            className="bg-zinc-900/70 border border-zinc-800 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-900 text-white rounded-2xl w-full py-0.5 transition-all duration-200"
          >
            {showIndividualVectors ? "Ocultar Vectores" : "Mostrar Vectores"}
          </motion.button>

          {mode === "2D" && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowPolygonPoints((v) => !v)}
              className="bg-zinc-900/70 border border-zinc-800 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-900 text-white rounded-2xl w-full py-0.5 transition-all duration-200"
            >
              {showPolygonPoints
                ? "Ocultar coordenadas"
                : "Mostrar coordenadas"}
            </motion.button>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="md:flex px-3 py-1 rounded-2xl border border-zinc-800 hover:border-indigo-900 hover:bg-indigo-950/50 justify-center text-zinc-200 bg-zinc-900/70 transition-all duration-200"
        >
          <h3 className="font-semibold mr-1">Vector Resultante</h3>
          <p className=" px-1">
            R = ({sum.map((n) => n.toFixed(2)).join(", ")})
          </p>

          {mode === "2D" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-2 text-indigo-300 px-1 rounded-lg shadow-lg bg-indigo-900/50 shadow-indigo-900 animate-pulse"
            >
              r = {r.toFixed(2)}, θ = {theta.toFixed(2)}°
            </motion.p>
          )}

          {area !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=" dark:text-white flex ml-5"
            >
              <h3 className="font-semibold">Área del polígono:</h3>
              <p className="ml-2 text-indigo-300 px-1 rounded-lg shadow-lg bg-indigo-900/50 shadow-indigo-900 animate-pulse">
                {area.toFixed(2)} unidades²
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* SCENE */}
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

          <group rotation={mode === "2D" ? [2, 0, 0] : [0, 0, 0]}>
            {mode === "2D" && polygonAreaShape && (
              <mesh>
                <shapeGeometry args={[polygonAreaShape]} />
                <meshBasicMaterial
                  color="blue"
                  transparent
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {area !== null && (
              <Html position={[0, 0, 0]}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white text-xs w-24 bg-black/60 px-2 py-1 rounded"
                >
                  Área = {area.toFixed(2)} u²
                </motion.div>
              </Html>
            )}

            {/* FLECHAS */}
            {showIndividualVectors &&
              vectors.map((v, i) => (
                <Flecha
                  key={i}
                  from={[0, 0, 0]}
                  to={v.components}
                  color={v.color}
                />
              ))}

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

      {/* PANEL DE CONTROLES */}
      <div className="absolute mt-4 w-full lg:w-96">
        <label className="font-semibold dark:text-zinc-300">
          Dimensiones:{" "}
        </label>

        <motion.select
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          value={mode}
          onChange={(e) => setMode(e.target.value as "2D" | "3D")}
          className="mb-3 ml-2 border w-1/2 rounded-2xl px-2 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 py-1.5 pr-8 pl-3 text-base"
        >
          <option value="3D">3D (x, y, z)</option>
          <option value="2D">2D (magnitud, ángulo)</option>
        </motion.select>

        {/* INPUTS */}
        <AnimatePresence>
          {vectors.map((v, i) =>
            mode === "3D" ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex gap-2 items-center mb-2"
              >
                {v.components.map((c, j) => (
                  <motion.input
                    whileFocus={{ scale: 1.05 }}
                    key={j}
                    type="number"
                    value={c}
                    onChange={(e) =>
                      updateComponent(i, j, parseFloat(e.target.value) || 0)
                    }
                    className="w-1/4 border rounded-lg px-1 py-1 text-center 
             dark:bg-zinc-800 dark:text-white dark:border-zinc-700
             focus:outline-1 focus:outline-indigo-500 hover:outline-1 hover:outline-indigo-800 hover:shadow-lg hover:shadow-indigo-900 transition-all duration-300"
                  />
                ))}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeVector(i)}
                  className="dark:bg-zinc-900 border dark:border-zinc-800 hover:bg-red-900 hover:outline-1 hover:outline-red-800 hover:shadow-lg hover:shadow-red-900 text-white rounded-lg px-2 py-1"
                >
                  ✕
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex gap-2 items-center mb-2"
              >
                <motion.input
                  whileFocus={{ scale: 1.05 }}
                  type="number"
                  placeholder="r"
                  onChange={(e) =>
                    updatePolar(i, "r", parseFloat(e.target.value) || 0)
                  }
                  className="w-1/2 border rounded px-1 py-1 text-center 
             dark:bg-zinc-800 dark:text-white dark:border-zinc-700
             focus:outline focus:outline-indigo-500 hover:outline-1 hover:outline-indigo-800 hover:shadow-lg hover:shadow-indigo-900 transition-all duration-300"
                />
                <motion.input
                  whileFocus={{ scale: 1.05 }}
                  type="number"
                  placeholder="θ°"
                  onChange={(e) =>
                    updatePolar(i, "theta", parseFloat(e.target.value) || 0)
                  }
                  className="w-1/2 border rounded px-1 py-1 text-center 
             dark:bg-zinc-800 dark:text-white dark:border-zinc-700
             focus:outline focus:outline-indigo-500 hover:outline-1 hover:outline-indigo-800 hover:shadow-lg hover:shadow-indigo-900 transition-all duration-300"
                />

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => removeVector(i)}
                  className="dark:bg-zinc-900 border dark:border-zinc-800 text-white rounded-2xl px-2 py-1"
                >
                  ✕
                </motion.button>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* BOTÓN AÑADIR VECTOR */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={addVector}
          className="bg-zinc-900 border border-zinc-800 hover:bg-indigo-950 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-900 text-white px-3 py-2 rounded-2xl mt-2"
        >
          Añadir vector
        </motion.button>
      </div>
    </motion.div>
  );
}

// ───────────────────────────── UTILIDADES ───────────────────────────────

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
  segments.forEach((seg) => shape.lineTo(seg.to[0], seg.to[1]));
  shape.lineTo(first[0], first[1]);

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
  const colors = ["blue", "purple", "magenta"];
  return colors[Math.floor(Math.random() * colors.length)];
}

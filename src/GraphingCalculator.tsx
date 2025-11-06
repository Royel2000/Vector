import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import { Text } from "@react-three/drei";

interface VectorData {
  name: string;
  components: [number, number, number];
  color: string;
}

export default function VectorCalculator() {
  const [mode, setMode] = useState<"2D" | "3D">("3D");

  const [vectors, setVectors] = useState<VectorData[]>([]);

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

  const sum = vectors.reduce(
    (acc, v) => acc.map((n, i) => n + v.components[i]),
    [0, 0, 0]
  );

  const removeVector = (index: number) => {
    setVectors((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePolar = (i: number, type: "r" | "theta", value: number) => {
    const copy = [...vectors];
    const [x, y] = copy[i].components;
    const r = Math.sqrt(x ** 2 + y ** 2);
    const theta = Math.atan2(y, x) * (180 / Math.PI);

    const newR = type === "r" ? value : r;
    const newTheta = type === "theta" ? value : theta;

    // convertir a radianes
    const rad = (newTheta * Math.PI) / 180;
    copy[i].components = [newR * Math.cos(rad), newR * Math.sin(rad), 0];
    setVectors(copy);
  };

  return (
    <div>
      
      <div className="flex flex-col lg:flex-row w-full min-h-screen p-4 bg-gray-100 text-gray-900 dark:bg-zinc-950">
        {/* Escena 3D */}
        <div className="flex-1 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-lg">
          <Canvas
            camera={{
              position: mode === "3D" ? [5, 5, 5] : [0, 0, 50],
              up: new THREE.Vector3(0, 1, 0),
              fov: 50,
            }}
          >
            <ambientLight />

            {/* Fondo tipo GeoGebra */}
            <InfiniteGeoGebraGrid mode={mode} />

            {/* Ejes y números */}
            <GeoGebraAxes mode={mode} range={50} spacing={5} />

            <group rotation={mode === "2D" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
              <GeoGebraAxes range={50} spacing={5} />
            </group>

            {/* Controles */}
            <OrbitControls
              enablePan={mode === "3D"}
              enableRotate={mode === "3D"}
              enableDamping={mode === "3D"}
              maxPolarAngle={mode === "3D" ? Math.PI : 0}
              minPolarAngle={mode === "3D" ? 0 : Math.PI}
            />

            {/* Vectores */}
            <group rotation={mode === "2D" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
              {vectors.map((v, i) => (
                <VectorArrow key={i} vector={v} />
              ))}
              <VectorArrow
                vector={{
                  name: "R",
                  components: sum as [number, number, number],
                  color: "red",
                }}
              />
            </group>
          </Canvas>
        </div>

        {/* Panel lateral */}
        <div className="w-full lg:w-96 bg-white rounded-lg shadow-lg p-4 mt-4 lg:mt-0 lg:ml-4 dark:bg-linear-to-b dark:from-zinc-800 dark:to-zinc-950">
          <h2 className="text-xl mb-3 dark:bg-linear-to-r dark:from-gray-300 dark:to-zinc-100 dark:bg-clip-text text-transparent">
            Calculadora de Vectores 3D
          </h2>

          <div className="mb-4 dark:text-zinc-300 flex justify-between text-center">
            <label className="font-semibold mr-2">Dimensiones:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "2D" | "3D")}
              className="border rounded px-2 py-1 appearance-none dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="3D">3D (x, y, z)</option>
              <option value="2D">2D (magnitud, ángulo)</option>
            </select>
          </div>

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
                    className="w-1/3 border rounded px-1 py-1 text-center appearance-none dark:text-white dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:border-green-500 transition-all duration-500"
                  />
                ))}
                <button
                  onClick={() => removeVector(i)}
                  className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 dark:bg-zinc-700 hover:-translate-0.5 hover:size-9 transition-all duration-1000"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  type="number"
                  placeholder="Magnitud (r)"
                  onChange={(e) =>
                    updatePolar(i, "r", parseFloat(e.target.value) || 0)
                  }
                  className="w-1/2 border rounded px-1 py-1 text-center appearance-none dark:text-white dark:bg-zinc-800 dark:border-zinc-700"
                />
                <input
                  type="number"
                  placeholder="Ángulo (°)"
                  onChange={(e) =>
                    updatePolar(i, "theta", parseFloat(e.target.value) || 0)
                  }
                  className="w-1/2 border rounded px-1 py-1 text-center appearance-none dark:text-white dark:bg-zinc-800 dark:border-zinc-700"
                />
                <button
                  onClick={() => removeVector(i)}
                  className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )
          )}

          <button
            onClick={addVector}
            className="dark:bg-linear-to-r dark:hover:from-green-300 dark:hover:to-green-500 bg-emerald-500  dark:bg-clip-text text-xl font-extrabold dark:text-transparent text-white px-3 py-2 rounded w-full mt-2 transition-all duration-700 hover:bg-emerald-600 dark:bg-zinc-300"
          >
            Añadir vector
          </button>

          <div className="mt-4 dark:text-zinc-300">
            <h3 className="font-semibold mb-1">Vector Resultante (Suma)</h3>
            <p>R = ({sum.map((n) => n.toFixed(2)).join(", ")})</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VectorArrow({ vector }: { vector: VectorData }) {
  const dir = new THREE.Vector3(...vector.components).normalize();
  const length = new THREE.Vector3(...vector.components).length();
  const origin = new THREE.Vector3(0, 0, 0);

  return <arrowHelper args={[dir, origin, length, vector.color]} />;
}

function getRandomColor() {
  const colors = ["red", "blue", "orange", "purple", "cyan", "magenta"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function InfiniteGeoGebraGrid({ mode }: { mode: "2D" | "3D" }) {
  const size = mode === "3D" ? 100 : 1000;
  const divisions = mode === "3D" ? 20 : 200;
  const grid = new THREE.GridHelper(size, divisions, 0xdddddd, 0xeeeeee);
  grid.material.opacity = 0.35;
  (grid.material as THREE.Material).transparent = true;
  return (
    <primitive
      object={grid}
      rotation={mode === "2D" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
    />
  );
}

interface GeoGebraAxesProps {
  range?: number;
  spacing?: number;
}

export function GeoGebraAxes({
  range = 50,
  spacing = 1,
}: GeoGebraAxesProps & { mode?: "2D" | "3D" }) {
  const labels = [];

  // Eje X
  for (let x = -range; x <= range; x += spacing) {
    if (x !== 0) {
      labels.push(
        <Text key={`x${x}`} position={[x, -0.3, 0]} fontSize={0.7} color="#777">
          {x}
        </Text>
      );
    }
  }

  // Eje Y
  for (let y = -range; y <= range; y += spacing) {
    if (y !== 0) {
      labels.push(
        <Text key={`y${y}`} position={[0, y, 0]} fontSize={0.7} color="#777">
          {y}
        </Text>
      );
    }
  }

  return (
    <group>
      {/* Eje X */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, range * 2, 8]} />
        <meshBasicMaterial color="#e11d48" /> {/* rojo */}
      </mesh>

      {/* Eje Y */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, range * 2, 8]} />
        <meshBasicMaterial color="#22c55e" /> {/* verde */}
      </mesh>

      {/* Eje Z */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, range * 2, 8]} />
        <meshBasicMaterial color="#3b82f6" /> {/* azul */}
      </mesh>

      {labels}
    </group>
  );
}

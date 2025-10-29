import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState } from "react";

interface FunctionData {
expression: string;
color: string;
}

export default function GraphingCalculator() {
const [functions, setFunctions] = useState<FunctionData[]>([
{ expression: "Math.sin(x)", color: "red" },
]);

const addFunction = () => {
setFunctions((prev) => [
...prev,
{ expression: "", color: getRandomColor() },
]);
};

const removeFunction = (i: number) => {
setFunctions((prev) => prev.filter((_, idx) => idx !== i));
};

const updateFunction = (i: number, value: string) => {
const copy = [...functions];
copy[i].expression = value;
setFunctions(copy);
};

return ( <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-100 p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
{/* Canvas 3D */} <div className="flex-1 bg-white shadow-lg rounded-lg overflow-hidden relative flex items-center justify-center">
{/* ✅ Menor altura en modo celular */} <div className="w-full h-64 sm:aspect-[16/9] lg:h-full">
<Canvas camera={{ position: [10, 10, 10], fov: 50 }}> <ambientLight /> <axesHelper args={[10]} />
<gridHelper args={[20, 20]} /> <OrbitControls />
{functions.map((f, i) => ( <GraphLine key={i} fn={f.expression} color={f.color} />
))} </Canvas> </div> </div>


  {/* Panel de control */}
  <div className="w-full lg:w-96 bg-white shadow-lg rounded-lg p-4 flex flex-col max-h-[90vh] overflow-y-auto">
    <h2 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4">
      Calculadora Gráfica 3D
    </h2>

    <div className="flex flex-col gap-3">
      {functions.map((f, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:space-x-2 gap-2 items-center"
        >
          <input
            type="text"
            placeholder="f(x) ="
            value={f.expression}
            onChange={(e) => updateFunction(i, e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => removeFunction(i)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full sm:w-auto"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addFunction}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        Añadir función
      </button>
    </div>

    <div className="grid grid-cols-4 gap-2 mt-4">
      {[
        "sin",
        "cos",
        "tan",
        "log",
        "sqrt",
        "pow",
        "+",
        "-",
        "*",
        "/",
        "x",
      ].map((b) => (
        <button
          key={b}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm"
          onClick={() =>
            setFunctions((prev) => {
              const copy = [...prev];
              copy[prev.length - 1].expression += b;
              return copy;
            })
          }
        >
          {b}
        </button>
      ))}
    </div>
  </div>
</div>


);
}

function GraphLine({ fn, color }: { fn: string; color: string }) {
const points = useMemo(() => {
const arr: THREE.Vector3[] = [];
for (let x = -10; x <= 10; x += 0.1) {
try {
const y = eval(fn);
arr.push(new THREE.Vector3(x, y, 0));
} catch {
arr.push(new THREE.Vector3(x, 0, 0));
}
}
return arr;
}, [fn]);

return <Line points={points} color={color} lineWidth={2} />;
}

function getRandomColor() {
const colors = ["red", "blue", "green", "orange", "purple", "cyan"];
return colors[Math.floor(Math.random() * colors.length)];
}

import { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar.tsx";
import GraphingCalculator from "./GraphingCalculator.tsx";

import SplashScreen from "./components/SplashScreen.tsx";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dura 2 segundos (ajústalo como quieras)
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : (
        <div className="dark:bg-zinc-950 min-h-screen">
        <Navbar />
          <div>
            <GraphingCalculator />
          </div>
        </div>
      )}
    </>
  );
}

export default App;

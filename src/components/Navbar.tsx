import { useState, useEffect } from "react";

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Tomar el tema del sistema o el guardado
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Aplicar el tema a la etiqueta HTML + guardar preferencia
  useEffect(() => {
    const html = document.documentElement;

    if (theme == "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <div className="flex">
      <div className="w-full py-2 top-0 backdrop-blur z-50 px-10 flex dark:text-white transition-all">
        <div className="w-full flex flex-row justify-between items-center px-[10px]">
          <img
            src="/vite.svg"
            className="cursor-pointer hover:animate-pulse w-[2rem] mr-6"
            alt="Logo"
          />

          <h1 className="font-bold sm:text-2xl py-1 px-3 rounded-lg text-indigo-200 shadow-xl bg-indigo-950 border border-indigo-700 shadow-indigo-950">
            Vectores
          </h1>

          <button
            onClick={toggleTheme}
            className="dark:bg-opacity-30 dark:bg-zinc-600 p-1 bg-zinc-300 rounded-full transition-all"
          >
            {theme === "light" ? (
              // icono de luna
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-9 fill-slate-800"
              >
                <path d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" />
              </svg>
            ) : (
              // icono de sol
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-9 fill-slate-100"
              >
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z..." />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

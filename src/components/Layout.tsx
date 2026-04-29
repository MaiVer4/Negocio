import React from "react" // Asegúrate de importar React
import { Link, useLocation } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const linkClass = (path: string) =>
    location.pathname === path
      ? "text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-lg transition-all"
      : "text-gray-400 hover:text-white px-3 py-2 transition-all"

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
      {/* ... todo el resto del código del Layout que ya tienes ... */}
      <div className="flex">
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-6 space-y-6">
           <nav className="flex flex-col space-y-4">
            <Link className={linkClass("/")} to="/">📊 Dashboard</Link>
            <Link className={linkClass("/produccion")} to="/produccion">🏭 Producción</Link>
            <Link className={linkClass("/ventas")} to="/ventas">💰 Ventas</Link>
            <Link className={linkClass("/vendedores")} to="/vendedores">👥 Vendedores</Link>
            <Link className={linkClass("/entregas")} to="/entregas">🚚 Entregas</Link>
            <Link className={linkClass("/inventario")} to="/inventario">📦 Inventario</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:ml-64 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
      {/* ... el nav móvil ... */}
    </div>
  )
}
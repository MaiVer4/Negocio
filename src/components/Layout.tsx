import React from "react"
import { Link, useLocation } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  // Clase para los links (Sidebar y Móvil)
  const linkClass = (path: string) =>
    location.pathname === path
      ? "text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
      : "text-gray-400 hover:text-white px-3 py-2 transition-all flex items-center gap-2"

  // Clase específica para los iconos del móvil
  const mobileLinkClass = (path: string) =>
    location.pathname === path ? "text-emerald-400" : "text-gray-500"

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 md:pb-0">
      <div className="flex">
        {/* SIDEBAR (Escritorio - visible desde md en adelante) */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6 space-y-8">
           <div className="px-3">
             <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
               Smart<span className="text-emerald-500">Ledger</span>
             </h2>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Panel de Control</p>
           </div>

           <nav className="flex flex-col space-y-2">
            <Link className={linkClass("/")} to="/"><span>📊</span> Dashboard</Link>
            <Link className={linkClass("/produccion")} to="/produccion"><span>🏭</span> Producción</Link>
            <Link className={linkClass("/ventas")} to="/ventas"><span>💰</span> Ventas</Link>
            <Link className={linkClass("/vendedores")} to="/vendedores"><span>👥</span> Vendedores</Link>
            <Link className={linkClass("/entregas")} to="/entregas"><span>🚚</span> Entregas</Link>
            <Link className={linkClass("/inventario")} to="/inventario"><span>📦</span> Inventario</Link>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-8 md:ml-64 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* NAVEGACIÓN MÓVIL (Solo visible en pantallas pequeñas) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 flex justify-around items-center p-2 md:hidden z-50">
        <Link to="/" className={`flex flex-col items-center p-2 ${mobileLinkClass("/")}`}>
          <span className="text-lg">📊</span>
          <span className="text-[9px] font-bold uppercase mt-1">Inicio</span>
        </Link>
        <Link to="/produccion" className={`flex flex-col items-center p-2 ${mobileLinkClass("/produccion")}`}>
          <span className="text-lg">🏭</span>
          <span className="text-[9px] font-bold uppercase mt-1">Lotes</span>
        </Link>
        <Link to="/ventas" className={`flex flex-col items-center p-2 ${mobileLinkClass("/ventas")}`}>
          <span className="text-lg">💰</span>
          <span className="text-[9px] font-bold uppercase mt-1">Ventas</span>
        </Link>
        <Link to="/inventario" className={`flex flex-col items-center p-2 ${mobileLinkClass("/inventario")}`}>
          <span className="text-lg">📦</span>
          <span className="text-[9px] font-bold uppercase mt-1">Stock</span>
        </Link>
        <Link to="/vendedores" className={`flex flex-col items-center p-2 ${mobileLinkClass("/vendedores")}`}>
          <span className="text-lg">👥</span>
          <span className="text-[9px] font-bold uppercase mt-1">Staff</span>
        </Link>
      </nav>
    </div>
  )
}
import React from "react"
import { Link, useLocation } from "react-router-dom"
 
interface LayoutProps {
    children: React.ReactNode
}
 
const NAV_ITEMS = [
    { path: "/",           icon: "📊", label: "Dashboard", short: "Inicio"   },
    { path: "/produccion", icon: "🏭", label: "Producción", short: "Lotes"   },
    { path: "/ventas",     icon: "💰", label: "Ventas",     short: "Ventas"  },
    { path: "/inventario", icon: "📦", label: "Inventario", short: "Stock"   },
    { path: "/vendedores", icon: "👥", label: "Vendedores", short: "Staff"   },
]
 
export default function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const isActive = (path: string) => location.pathname === path
 
    return (
        <div className="min-h-screen text-white" style={{ background: "#0a0c10" }}>
 
            {/* ── SIDEBAR DESKTOP ── */}
            <aside
                className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 z-40 overflow-y-auto"
                style={{
                    background: "#0d0f14",
                    borderRight: "1px solid #1a1d24",
                }}
            >
                {/* Logo */}
                <div className="px-6 pt-7 pb-6 flex-shrink-0" style={{ borderBottom: "1px solid #1a1d24" }}>
                    <h2
                        className="text-lg font-black uppercase tracking-tighter text-white leading-none"
                        style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}
                    >
                        Nexus<span style={{ color: "#34d399" }}>Business</span>
                    </h2>
                    <p className="text-[9px] font-mono font-bold uppercase tracking-[2px] mt-1" style={{ color: "#4b5060" }}>
                        Panel de Control
                    </p>
                </div>
 
                {/* Nav */}
                <nav className="flex flex-col gap-1 px-3 pt-5 flex-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ path, icon, label }) => (
                        <Link
                            key={path}
                            to={path}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold whitespace-nowrap"
                            style={{
                                background: isActive(path) ? "rgba(52,211,153,0.08)" : "transparent",
                                color: isActive(path) ? "#34d399" : "#5a5f6e",
                                border: isActive(path) ? "1px solid rgba(52,211,153,0.15)" : "1px solid transparent",
                            }}
                        >
                            <span
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-base flex-shrink-0"
                                style={{
                                    background: isActive(path) ? "rgba(52,211,153,0.12)" : "#111318",
                                }}
                            >
                                {icon}
                            </span>
                            <span className="flex-1 truncate">{label}</span>
                            {isActive(path) && (
                                <span
                                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: "#34d399" }}
                                />
                            )}
                        </Link>
                    ))}
                </nav>
 
                {/* Footer del sidebar */}
                <div className="px-6 py-5 flex-shrink-0" style={{ borderTop: "1px solid #1a1d24" }}>
                    <p className="text-[9px] font-mono uppercase tracking-[1.5px]" style={{ color: "#2a2d36" }}>
                        v1.0 · negocio-app
                    </p>
                </div>
            </aside>
 
            {/* ── CONTENIDO PRINCIPAL ── */}
            <div className="lg:ml-60 min-h-screen pb-28 sm:pb-24 md:pb-8 flex flex-col">
                <main className="flex-1 p-3 xs:p-4 sm:p-5 md:p-8 w-full mx-auto max-w-7xl">
                    {children}
                </main>
            </div>
 
            {/* ── NAV MÓVIL (visible solo en md y menores) ── */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center z-50"
                style={{
                    background: "rgba(13,15,20,0.98)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderTop: "1px solid #1a1d24",
                    paddingBottom: "max(12px, env(safe-area-inset-bottom))",
                    paddingTop: "12px",
                }}
            >
                {NAV_ITEMS.map(({ path, icon, short }) => (
                    <Link
                        key={path}
                        to={path}
                        className="flex flex-col items-center gap-0.5 px-1.5 py-2 relative flex-1 justify-center"
                    >
                        {/* Indicador activo */}
                        {isActive(path) && (
                            <span
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-b-full"
                                style={{ background: "#34d399" }}
                            />
                        )}
 
                        {/* Ícono con fondo cuando activo */}
                        <span
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all flex-shrink-0"
                            style={{
                                background: isActive(path) ? "rgba(52,211,153,0.1)" : "transparent",
                            }}
                        >
                            {icon}
                        </span>
 
                        <span
                            className="text-[8px] font-bold uppercase tracking-[0.3px] font-mono text-center leading-tight"
                            style={{ color: isActive(path) ? "#34d399" : "#4b5060" }}
                        >
                            {short}
                        </span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

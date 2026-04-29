import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import ProduccionPage from "./pages/Produccion"
import VentasPage from "./pages/Ventas"
import Inventario from "./pages/Inventorio" // ✅ Corregido de "Inventorio" a "Inventario"
import Vendedores from "./pages/Vendedores"
import Entregas from "./pages/Entregas"
import Login from "./pages/Login"           // ✅ Importamos la nueva página de Login
import ProtectedRoute from "./components/ProtectedRoute" // ✅ El guardián de rutas

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas: Si no hay login, redirigen a /login */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/produccion" element={
          <ProtectedRoute>
            <ProduccionPage />
          </ProtectedRoute>
        } />
        
        <Route path="/ventas" element={
          <ProtectedRoute>
            <VentasPage />
          </ProtectedRoute>
        } />
        
        <Route path="/vendedores" element={
          <ProtectedRoute>
            <Vendedores />
          </ProtectedRoute>
        } />
        
        <Route path="/inventario" element={
          <ProtectedRoute>
            <Inventario />
          </ProtectedRoute>
        } />
        
        <Route path="/entregas" element={
          <ProtectedRoute>
            <Entregas />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
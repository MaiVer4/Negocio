import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async () => {
    if (!email || !password) return alert("Completa los campos");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      alert("Credenciales incorrectas o error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-emerald-500/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-emerald-500 italic">NEXUS ERP</h1>
          <p className="text-gray-500 text-sm">Ingresa para gestionar tu negocio</p>
        </div>
        
        <div className="space-y-4">
          <Input 
            placeholder="Correo electrónico" 
            type="email" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <Input 
            placeholder="Contraseña" 
            type="password" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Verificando..." : "Entrar al Sistema"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
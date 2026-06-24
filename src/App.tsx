// Definicion de rutas: publicas (login, registro) y privadas.
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./componentes/Layout";
import { RutaProtegida } from "./componentes/RutaProtegida";
import { Login } from "./paginas/Login";
import { Registro } from "./paginas/Registro";
import { Dashboard } from "./paginas/Dashboard";
import { Clientes } from "./paginas/Clientes";
import { ClienteFormulario } from "./paginas/ClienteFormulario";
import { VehiculoFormulario } from "./paginas/VehiculoFormulario";
import { NuevaSimulacion } from "./paginas/NuevaSimulacion";
import { Simulaciones } from "./paginas/Simulaciones";
import { SimulacionDetalle } from "./paginas/SimulacionDetalle";
import { Perfil } from "./paginas/Perfil";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/nuevo" element={<ClienteFormulario />} />
        <Route path="/clientes/:id" element={<ClienteFormulario />} />
        {/* El catalogo vive en la pantalla de inicio ("/"). */}
        <Route path="/vehiculos" element={<Navigate to="/" replace />} />
        <Route path="/vehiculos/nuevo" element={<VehiculoFormulario />} />
        <Route path="/vehiculos/:id" element={<VehiculoFormulario />} />
        <Route path="/simulaciones/nueva" element={<NuevaSimulacion />} />
        <Route path="/simulaciones/:id/editar" element={<NuevaSimulacion />} />
        <Route path="/simulaciones" element={<Simulaciones />} />
        <Route path="/simulaciones/:id" element={<SimulacionDetalle />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { BrowserRouter, Route, Routes } from "react-router-dom";
import HealthCheck from "../pages/public/HealthCheck";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HealthCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

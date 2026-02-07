import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Meetings from "./pages/Meetings";
import MOMs from "./pages/MOMs";
import Tasks from "./pages/Tasks";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/moms" element={<MOMs />} />
        <Route path="/tasks" element={<Tasks />} />
      </Route>
    </Routes>
  );
}

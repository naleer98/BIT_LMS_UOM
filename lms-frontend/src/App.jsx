import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subjects from "./pages/Subjects";
import SubjectDetails from "./pages/SubjectDetails";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects/:subjectCode"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <SubjectDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
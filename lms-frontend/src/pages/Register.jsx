import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import uomLogo from "../assets/uom-logo.png";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.role
    ) {
      alert("Please fill all fields");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("bitLmsToken", data.token);
      localStorage.setItem("bitLmsUser", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userUpdated"));

      if (data.user.role === "student") {
        navigate("/student-dashboard");
      } else if (data.user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Cannot connect to backend server. Please check npm run dev.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-2">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 text-white p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white p-3 flex items-center justify-center shadow-xl">
                <img
                  src={uomLogo}
                  alt="University of Moratuwa Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <p className="text-cyan-100 font-bold uppercase tracking-wide text-sm">
                  University of Moratuwa
                </p>

                <h1 className="text-3xl md:text-4xl font-black mt-1">
                  BIT LMS
                </h1>

                <p className="text-blue-100 font-semibold mt-1">
                  Learning Management System
                </p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-cyan-100 font-black uppercase tracking-wide text-sm">
                Create Account
              </p>

              <h2 className="text-4xl md:text-5xl font-black leading-tight mt-3">
                Start Your Learning Journey with BIT LMS
              </h2>

              <p className="text-blue-100 leading-8 mt-6 text-lg">
                Register to access subject resources, quizzes, assignment
                submissions, enrollments, and academic progress tracking.
              </p>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-3xl">🎓</p>
                <h3 className="font-black mt-3">Students</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Learn and submit work
                </p>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-3xl">👨‍🏫</p>
                <h3 className="font-black mt-3">Teachers</h3>
                <p className="text-blue-100 text-sm mt-1">Manage resources</p>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-3xl">🛠</p>
                <h3 className="font-black mt-3">Admins</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Monitor the system
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/20 pt-6">
            <p className="text-blue-100 text-sm">
              Developed By:{" "}
              <span className="font-black text-white">Naleer Khan</span>
            </p>

            <p className="text-blue-100 text-sm mt-1">
              Contact:{" "}
              <span className="font-black text-white">0703255917</span>
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <p className="text-blue-700 font-black uppercase tracking-wide text-sm">
              Registration
            </p>

            <h2 className="text-4xl font-black text-slate-900 mt-3">
              Create Account
            </h2>

            <p className="text-slate-500 leading-7 mt-4">
              Fill in your details to create your BIT LMS account.
            </p>

            <form onSubmit={handleRegister} className="mt-8 space-y-5">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="form-label">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-24"
                    placeholder="Minimum 6 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-blue-700 hover:text-blue-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <p className="text-center text-slate-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-700 font-black">
                Login
              </Link>
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-sm text-slate-500 font-semibold">
                BIT LMS • University of Moratuwa
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import uomLogo from "../assets/uom-logo.png";

function safeGetUser() {
  try {
    const storedUser = localStorage.getItem("bitLmsUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data:", error);
    localStorage.removeItem("bitLmsUser");
    localStorage.removeItem("bitLmsToken");
    return null;
  }
}

function getDashboardLink(role) {
  if (role === "admin") return "/admin-dashboard";
  if (role === "teacher") return "/teacher-dashboard";
  if (role === "student") return "/student-dashboard";
  return null;
}

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => safeGetUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateUser = () => {
      setUser(safeGetUser());
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("userUpdated", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("userUpdated", updateUser);
    };
  }, []);

  const dashboardLink = getDashboardLink(user?.role);

  const handleLogout = () => {
    localStorage.removeItem("bitLmsUser");
    localStorage.removeItem("bitLmsToken");
    window.dispatchEvent(new Event("userUpdated"));

    setUser(null);
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <img
                src={uomLogo}
                alt="University of Moratuwa Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">
                BIT LMS
              </h1>

              <p className="text-xs text-slate-500 font-bold mt-1">
                University of Moratuwa
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <NavbarLink to="/" label="Home" />

            {user && <NavbarLink to="/subjects" label="Subjects" />}

            {user && dashboardLink && (
              <NavbarLink to={dashboardLink} label="Dashboard" />
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                  <p className="text-sm font-black text-blue-800">
                    Hi, {user.name}
                  </p>

                  <p className="text-xs text-slate-500 capitalize">
                    {user.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-3 rounded-full bg-red-50 text-red-600 font-black hover:bg-red-600 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">
                  Login
                </Link>

                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="lg:hidden w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-5 p-5 rounded-3xl bg-white border border-slate-200 shadow-xl">
            <div className="space-y-2">
              <MobileNavbarLink to="/" label="Home" onClick={closeMenu} />

              {user && (
                <MobileNavbarLink
                  to="/subjects"
                  label="Subjects"
                  onClick={closeMenu}
                />
              )}

              {user && dashboardLink && (
                <MobileNavbarLink
                  to={dashboardLink}
                  label="Dashboard"
                  onClick={closeMenu}
                />
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200">
              {user ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="font-black text-blue-800">{user.name}</p>

                    <p className="text-sm text-slate-500">{user.email}</p>

                    <p className="text-sm text-slate-500 capitalize">
                      Role: {user.role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-5 py-3 rounded-full bg-red-50 text-red-600 font-black hover:bg-red-600 hover:text-white transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={closeMenu} className="btn-outline">
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 font-semibold">
                Developed By: Naleer Khan
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Contact: 0703255917
              </p>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavbarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-full font-black transition ${
          isActive
            ? "bg-blue-700 text-white shadow-md"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function MobileNavbarLink({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-2xl font-black transition ${
          isActive
            ? "bg-blue-700 text-white"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default Navbar;
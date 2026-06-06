import { Link } from "react-router-dom";
import { allSubjects, bitSemesters } from "../data/bitData";
import uomLogo from "../assets/uom-logo.png";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("bitLmsUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getDashboardLink(role) {
  if (role === "admin") return "/admin-dashboard";
  if (role === "teacher") return "/teacher-dashboard";
  if (role === "student") return "/student-dashboard";
  return "/login";
}

function Home() {
  const user = getStoredUser();
  const dashboardLink = getDashboardLink(user?.role);

  const totalWeeklyTopics = allSubjects.reduce(
    (total, subject) => total + (subject.weeks?.length || 0),
    0
  );

  const dashboardStats = [
    {
      title: "Total Subjects",
      value: allSubjects.length,
      icon: "📚",
    },
    {
      title: "Semesters",
      value: bitSemesters.length,
      icon: "🗓",
    },
    {
      title: "Weekly Topics",
      value: totalWeeklyTopics,
      icon: "📘",
    },
    {
      title: "User Roles",
      value: 3,
      icon: "👥",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-grid opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
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
                <p className="text-cyan-100 font-black uppercase tracking-wide text-sm">
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

            <p className="mt-10 inline-flex px-4 py-2 bg-white/10 border border-white/20 rounded-full text-cyan-100 font-semibold">
              🎓 Bachelor of Information Technology Learning Platform
            </p>

            <h2 className="mt-6 text-4xl md:text-6xl font-black leading-tight">
              Professional LMS for <br />
              <span className="text-cyan-300">BIT Academic Learning</span>
            </h2>

            <p className="mt-6 text-lg text-blue-50 leading-8 max-w-xl">
              A modern learning management system for students, teachers, and
              administrators to manage subjects, resources, quizzes,
              enrollments, submissions, and academic progress in one platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link to={dashboardLink} className="hero-btn-primary">
                    Open Dashboard
                  </Link>

                  <Link to="/subjects" className="hero-btn-outline">
                    View Subjects
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="hero-btn-primary">
                    Login to LMS
                  </Link>

                  <Link to="/register" className="hero-btn-outline">
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel p-8">
            <h2 className="text-2xl font-black">LMS Learning Flow</h2>

            <p className="text-blue-100 mt-3 leading-7">
              BIT LMS supports the complete learning cycle from subject access
              to assessment tracking.
            </p>

            <div className="mt-6 space-y-4">
              <FlowItem number="01" title="Login with role-based access" />
              <FlowItem number="02" title="Browse semester-wise subjects" />
              <FlowItem number="03" title="Access resources and materials" />
              <FlowItem number="04" title="Attempt quizzes and view results" />
              <FlowItem number="05" title="Submit assignments and view marks" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dashboardStats.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="text-4xl">{stat.icon}</div>

              <div>
                <h3 className="text-3xl font-black text-slate-900">
                  {stat.value}
                </h3>

                <p className="text-slate-500 font-semibold">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6">
          <div className="section-heading">
            <p>BIT Academic Structure</p>
            <h2>Semester-Based Learning Path</h2>
            <span>
              Subjects are organized semester-wise with weekly syllabus topics,
              learning materials, quizzes, and submissions.
            </span>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bitSemesters.map((semester) => {
              const weeklyCount = semester.subjects.reduce(
                (total, subject) => total + (subject.weeks?.length || 0),
                0
              );

              return (
                <div key={semester.semester} className="dashboard-card">
                  <p className="text-blue-700 font-black">{semester.level}</p>

                  <h3 className="mt-2 text-2xl font-black">
                    {semester.semester}
                  </h3>

                  <div className="mt-6 space-y-3">
                    <InfoRow label="Subjects" value={semester.subjects.length} />
                    <InfoRow label="Weekly Topics" value={weeklyCount} />
                  </div>

                  <div className="mt-6 space-y-3">
                    {semester.subjects.slice(0, 3).map((subject) => (
                      <div
                        key={subject.code}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200"
                      >
                        <p className="font-black text-blue-700">
                          {subject.code}
                        </p>

                        <p className="text-slate-600 text-sm mt-1">
                          {subject.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link to={user ? "/subjects" : "/login"} className="btn-outline w-full mt-6">
                    View Semester
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="section-heading">
            <p>Role Based LMS</p>
            <h2>Student, Teacher & Admin Access</h2>
            <span>
              Each user role has a dedicated dashboard and controlled access for
              professional academic management.
            </span>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-8">
            <RoleCard
              icon="👨‍🎓"
              title="Student"
              text="Enroll subjects, view weekly syllabus, access learning resources, submit assignments, attempt quizzes, and view marks."
              link={user?.role === "student" ? "/student-dashboard" : "/login"}
            />

            <RoleCard
              icon="👨‍🏫"
              title="Teacher"
              text="Create resources, manage learning materials, create quizzes, view submissions, and mark student work."
              link={
                user?.role === "teacher" || user?.role === "admin"
                  ? "/teacher-dashboard"
                  : "/login"
              }
            />

            <RoleCard
              icon="🛠"
              title="Admin"
              text="Monitor subjects, resources, enrollments, submissions, quiz results, users, and platform analytics."
              link={user?.role === "admin" ? "/admin-dashboard" : "/login"}
            />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-slate-950 to-blue-900 rounded-3xl p-8 md:p-10 text-white shadow-xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-cyan-300 font-black">
                  🧠 Complete Academic Workflow
                </p>

                <h2 className="text-3xl md:text-4xl font-black mt-3">
                  Resources, Quizzes, Enrollments and Submissions
                </h2>

                <p className="text-blue-50 leading-8 mt-4">
                  BIT LMS provides a structured academic environment where
                  teachers manage learning content, students participate in
                  learning activities, and administrators monitor the full
                  platform.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <FeatureBadge text="Role-Based Access" />
                  <FeatureBadge text="Subject Resources" />
                  <FeatureBadge text="Quiz Results" />
                  <FeatureBadge text="Assignment Marking" />
                </div>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-3xl p-6">
                <h3 className="text-2xl font-black">Platform Modules</h3>

                <div className="mt-6 space-y-4">
                  <FlowItem number="01" title="Authentication and dashboards" />
                  <FlowItem number="02" title="Subject and resource management" />
                  <FlowItem number="03" title="Quiz creation and attempts" />
                  <FlowItem number="04" title="Assignment submission and marking" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="section-heading">
            <p>System Features</p>
            <h2>Professional LMS Capabilities</h2>
            <span>
              The system supports important academic workflows needed for a BIT
              learning environment.
            </span>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="🔐"
              title="Role Login System"
              text="Secure role-based login for students, teachers, and administrators."
            />

            <FeatureCard
              icon="📚"
              title="Subject Management"
              text="Semester-based subject structure with weekly academic topics."
            />

            <FeatureCard
              icon="📂"
              title="Resource Management"
              text="Teachers can upload or link academic resources for each subject."
            />

            <FeatureCard
              icon="🧠"
              title="Quiz System"
              text="Students can attempt quizzes and view automatically calculated results."
            />

            <FeatureCard
              icon="👨‍🎓"
              title="Enrollment Tracking"
              text="Student subject enrollments are tracked for dashboard analytics."
            />

            <FeatureCard
              icon="📝"
              title="Submissions"
              text="Students can submit assignment work and track marking status."
            />

            <FeatureCard
              icon="✅"
              title="Teacher Marking"
              text="Teachers can review submissions and update marks or feedback."
            />

            <FeatureCard
              icon="📊"
              title="Admin Analytics"
              text="Admin dashboard summarizes resources, submissions, enrollments, and quiz data."
            />
          </div>
        </div>
      </section>

      <section className="section-padding bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-cyan-300 font-black">BIT LMS</p>

          <h2 className="text-3xl md:text-5xl font-black mt-3">
            University of Moratuwa Learning Management System
          </h2>

          <p className="text-blue-50 leading-8 mt-5 max-w-3xl mx-auto">
            A professional academic platform developed for managing BIT learning
            activities, assessments, submissions, and academic progress.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link to={dashboardLink} className="hero-btn-primary">
                  Open Dashboard
                </Link>

                <Link to="/subjects" className="hero-btn-outline">
                  Explore Subjects
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hero-btn-primary">
                  Login
                </Link>

                <Link to="/register" className="hero-btn-outline">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white p-3 flex items-center justify-center shadow-xl">
              <img
                src={uomLogo}
                alt="University of Moratuwa Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h3 className="text-2xl font-black mt-4">
            BIT <span className="text-cyan-400">LMS</span>
          </h3>

          <p className="text-slate-400 mt-2">
            University of Moratuwa • Learning Management System
          </p>

          <p className="text-slate-400 mt-5 text-sm">
            Developed By:{" "}
            <span className="font-black text-white">Naleer Khan</span>
          </p>

          <p className="text-slate-500 mt-1 text-sm">
            Contact: 0703255917
          </p>

          <p className="text-slate-600 mt-5 text-xs">
            © 2026 BIT LMS. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

function FlowItem({ number, title }) {
  return (
    <div className="flex items-center gap-4 bg-white/10 border border-white/15 p-4 rounded-2xl">
      <span className="w-12 h-12 rounded-full bg-cyan-400 text-blue-950 flex items-center justify-center font-black shrink-0">
        {number}
      </span>

      <p className="font-bold">{title}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-100">
      <span className="text-slate-600 font-bold">{label}</span>
      <span className="text-blue-700 font-black">{value}</span>
    </div>
  );
}

function FeatureBadge({ text }) {
  return (
    <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold">
      {text}
    </span>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card text-left">
      <div className="text-5xl">{icon}</div>

      <h3 className="text-xl font-black mt-5">{title}</h3>

      <p className="text-slate-500 mt-3 leading-7">{text}</p>
    </div>
  );
}

function RoleCard({ icon, title, text, link }) {
  return (
    <div className="dashboard-card">
      <div className="text-5xl">{icon}</div>

      <h3 className="mt-5 text-2xl font-black">{title} Dashboard</h3>

      <p className="text-slate-500 leading-7 mt-3">{text}</p>

      <Link to={link} className="btn-outline w-full mt-8">
        Open Dashboard
      </Link>
    </div>
  );
}

export default Home;
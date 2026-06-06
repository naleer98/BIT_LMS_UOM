import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bitSemesters, getSubjectRoute } from "../data/bitData";
import API_BASE_URL from "../api";

function safeGetUser() {
  try {
    const storedUser = localStorage.getItem("bitLmsUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("bitLmsUser");
    localStorage.removeItem("bitLmsToken");
    return null;
  }
}

function Subjects() {
  const navigate = useNavigate();

  const [activeSemester, setActiveSemester] = useState("Semester 01");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrollingSubjectCode, setEnrollingSubjectCode] = useState("");

  const token = localStorage.getItem("bitLmsToken");
  const loggedInUser = safeGetUser();

  const activeData = bitSemesters.find(
    (item) => item.semester === activeSemester
  );

  const filteredSubjects = useMemo(() => {
    if (!activeData) return [];

    return activeData.subjects.filter((subject) => {
      const text = `${subject.code} ${subject.title}`.toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    });
  }, [activeData, searchTerm]);

  const saveEnrollmentAndOpen = async (subject) => {
    const subjectRoute = getSubjectRoute(subject.code);

    if (!token || !loggedInUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    // Teacher/Admin should only view lessons, not create student enrollment
    if (loggedInUser.role !== "student") {
      navigate(`/subjects/${subjectRoute}`);
      return;
    }

    try {
      setEnrollingSubjectCode(subject.code);

      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectCode: subject.code,
          subjectTitle: subject.title,
          subjectLevel: activeData?.level || "",
          subjectSemester: activeSemester,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Enrollment error:", data);
        alert(data.message || "Failed to save enrollment.");
        return;
      }

      navigate(`/subjects/${subjectRoute}`);
    } catch (error) {
      console.error("Enrollment save failed:", error);
      alert("Cannot connect to enrollment API.");
    } finally {
      setEnrollingSubjectCode("");
    }
  };

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <div className="section-heading">
          <p>BIT Subject Area</p>
          <h2>Level & Semester Subjects</h2>
          <span>
            Browse BIT subjects with weekly lesson structure for Semester 01,
            Semester 02, Semester 03, and Semester 04.
          </span>
        </div>

        <div className="mt-10 bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex flex-wrap gap-3">
              {bitSemesters.map((item) => (
                <button
                  key={item.semester}
                  type="button"
                  onClick={() => {
                    setActiveSemester(item.semester);
                    setSearchTerm("");
                  }}
                  className={`semester-tab ${
                    activeSemester === item.semester ? "active" : ""
                  }`}
                >
                  <span>{item.level}</span>
                  <strong>{item.semester}</strong>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search subject or code..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
          </div>

          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-blue-700 font-black">{activeData?.level}</p>
              <h3 className="text-3xl font-black">{activeSemester}</h3>
            </div>

            <p className="text-slate-500 font-semibold">
              Showing {filteredSubjects.length} subject(s)
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div key={subject.code} className="subject-card">
                <div className="flex items-start justify-between gap-4">
                  <span className="course-code">{subject.code}</span>
                  <span className="text-3xl">📘</span>
                </div>

                <h4 className="mt-5 text-xl font-black text-slate-900">
                  {subject.title}
                </h4>

                <p className="mt-3 text-slate-500 leading-7">
                  This subject includes weekly lessons, notes, assignments,
                  quizzes, and progress tracking.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-black">
                    {subject.weeks?.length || 0} Weeks
                  </span>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-black">
                    {activeData?.level}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-black">
                    {activeSemester}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className="btn-outline w-full"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => saveEnrollmentAndOpen(subject)}
                    className="btn-primary w-full"
                    disabled={enrollingSubjectCode === subject.code}
                  >
                    {enrollingSubjectCode === subject.code
                      ? "Opening..."
                      : loggedInUser?.role === "student"
                      ? "Enroll & View"
                      : "View Lessons"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="mt-8 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-5xl">🔍</p>
              <h4 className="text-xl font-black mt-4">No subjects found</h4>
              <p className="text-slate-500 mt-2">
                Try searching another subject code or title.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedSubject && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-8">
              <div className="flex justify-between gap-5 items-start">
                <div>
                  <p className="text-cyan-100 font-bold">
                    {selectedSubject.code}
                  </p>

                  <h3 className="text-3xl font-black mt-2">
                    {selectedSubject.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubject(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-blue-700 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8">
              <h4 className="text-xl font-black text-slate-900">
                Subject Weekly Structure
              </h4>

              <p className="text-slate-500 mt-2">
                Total weekly topics: {selectedSubject.weeks?.length || 0}
              </p>

              {selectedSubject.weeks?.length > 0 ? (
                <div className="mt-6 max-h-72 overflow-y-auto space-y-3 pr-2">
                  {selectedSubject.weeks.map((week, index) => (
                    <div
                      key={`${week}-${index}`}
                      className="p-4 rounded-2xl bg-slate-100 border border-slate-200"
                    >
                      <p className="font-bold text-slate-700">{week}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 p-6 rounded-2xl bg-yellow-50 border border-yellow-100">
                  <p className="font-bold text-yellow-700">
                    Weekly topics not added yet.
                  </p>
                  <p className="text-slate-600 mt-2">
                    Content can be added later by the teacher or admin.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => saveEnrollmentAndOpen(selectedSubject)}
                className="btn-primary w-full mt-8"
                disabled={enrollingSubjectCode === selectedSubject.code}
              >
                {enrollingSubjectCode === selectedSubject.code
                  ? "Opening..."
                  : loggedInUser?.role === "student"
                  ? "Enroll & Start Learning"
                  : "Open Lessons"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Subjects;

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { allSubjects, bitSemesters, getSubjectRoute } from "../data/bitData";
import API_BASE_URL from "../api";

const materialTypes = [
  "All",
  "Video Lesson",
  "PDF Notes",
  "Assignment",
  "Quiz",
  "Practical Activity",
  "ChatGPT Notes",
  "Formative Assessment",
  "Gemini Notes",
  "Moodle PDF",
  "My Short Note",
  "Other Notes",
  "Past Papers",
  "Summative",
];

const storageKeys = ["bitLmsQuizzes", "bitLmsQuizResults"];

function safeGetStorage(key, fallback = []) {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : fallback;
  } catch {
    return fallback;
  }
}

function calculatePercentage(score, totalQuestions) {
  if (!totalQuestions || Number(totalQuestions) <= 0) {
    return 0;
  }

  return Math.round((Number(score || 0) / Number(totalQuestions)) * 100);
}

function AdminDashboard() {
  const user = safeGetStorage("bitLmsUser", {
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
  });

  const token = localStorage.getItem("bitLmsToken");

  const [lessons, setLessons] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const [quizzes, setQuizzes] = useState(() =>
    safeGetStorage("bitLmsQuizzes", [])
  );

  const [quizResults, setQuizResults] = useState(() =>
    safeGetStorage("bitLmsQuizResults", [])
  );

  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingQuizResults, setLoadingQuizResults] = useState(false);

  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceSubject, setResourceSubject] = useState("All");
  const [resourceType, setResourceType] = useState("All");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingResources(true);

        const resourceResponse = await fetch(`${API_BASE_URL}/resources`);
        const resourceData = await resourceResponse.json();

        if (resourceResponse.ok && resourceData.success) {
          setLessons(resourceData.resources || []);
        } else {
          console.error(
            "Resources fetch error:",
            resourceData.message || "Failed to fetch resources"
          );
          setLessons([]);
        }
      } catch (error) {
        console.error("Fetch resources failed:", error);
        setLessons([]);
      } finally {
        setLoadingResources(false);
      }

      try {
        setLoadingQuizzes(true);

        const quizResponse = await fetch(`${API_BASE_URL}/quizzes`);
        const quizData = await quizResponse.json();

        if (quizResponse.ok) {
          const quizList = Array.isArray(quizData)
            ? quizData
            : Array.isArray(quizData.quizzes)
            ? quizData.quizzes
            : [];

          setQuizzes(quizList);
        } else {
          console.error(
            "Quizzes fetch error:",
            quizData.message || "Failed to fetch quizzes"
          );
        }
      } catch (error) {
        console.error("Fetch quizzes failed:", error);
      } finally {
        setLoadingQuizzes(false);
      }

      if (token) {
        try {
          setLoadingQuizResults(true);

          const resultResponse = await fetch(
            `${API_BASE_URL}/quizzes/results/all`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const resultData = await resultResponse.json();

          if (resultResponse.ok) {
            const resultsList = Array.isArray(resultData)
              ? resultData
              : Array.isArray(resultData.results)
              ? resultData.results
              : Array.isArray(resultData.quizResults)
              ? resultData.quizResults
              : [];

            setQuizResults(resultsList);
          } else {
            console.error(
              "Quiz results fetch error:",
              resultData.message || "Failed to fetch quiz results"
            );
          }
        } catch (error) {
          console.error("Fetch quiz results failed:", error);
        } finally {
          setLoadingQuizResults(false);
        }

        try {
          setLoadingEnrollments(true);

          const enrollmentResponse = await fetch(
            `${API_BASE_URL}/enrollments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const enrollmentData = await enrollmentResponse.json();

          if (enrollmentResponse.ok && enrollmentData.success) {
            setEnrollments(enrollmentData.enrollments || []);
          } else {
            console.error(
              "Enrollments fetch error:",
              enrollmentData.message || "Failed to fetch enrollments"
            );
            setEnrollments([]);
          }
        } catch (error) {
          console.error("Fetch enrollments failed:", error);
          setEnrollments([]);
        } finally {
          setLoadingEnrollments(false);
        }

        try {
          setLoadingSubmissions(true);

          const submissionResponse = await fetch(
            `${API_BASE_URL}/submissions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const submissionData = await submissionResponse.json();

          if (submissionResponse.ok && submissionData.success) {
            setSubmissions(submissionData.submissions || []);
          } else {
            console.error(
              "Submissions fetch error:",
              submissionData.message || "Failed to fetch submissions"
            );
            setSubmissions([]);
          }
        } catch (error) {
          console.error("Fetch submissions failed:", error);
          setSubmissions([]);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };

    loadDashboardData();
  }, [token]);

  const totalWeeklyTopics = allSubjects.reduce(
    (total, subject) => total + (subject.weeks?.length || 0),
    0
  );

  const markedSubmissions = submissions.filter(
    (submission) => submission.status === "Marked"
  );

  const pendingSubmissions = submissions.filter(
    (submission) => submission.status !== "Marked"
  );

  const normalizedQuizResults = useMemo(() => {
    return quizResults.map((result) => {
      const percentage =
        typeof result.percentage === "number"
          ? Math.round(result.percentage)
          : calculatePercentage(result.score, result.totalQuestions);

      return {
        ...result,
        percentage,
      };
    });
  }, [quizResults]);

  const passedQuizResults = normalizedQuizResults.filter(
    (result) => result.percentage >= 50
  );

  const averageQuizScore =
    normalizedQuizResults.length > 0
      ? Math.round(
          normalizedQuizResults.reduce(
            (total, result) => total + result.percentage,
            0
          ) / normalizedQuizResults.length
        )
      : 0;

  const subjectQuizStats = useMemo(() => {
    const stats = {};

    normalizedQuizResults.forEach((result) => {
      const subject = result.subjectCode || "Unknown";

      if (!stats[subject]) {
        stats[subject] = {
          attempts: 0,
          totalPercentage: 0,
          highestScore: 0,
        };
      }

      stats[subject].attempts += 1;
      stats[subject].totalPercentage += result.percentage;

      if (result.percentage > stats[subject].highestScore) {
        stats[subject].highestScore = result.percentage;
      }
    });

    return stats;
  }, [normalizedQuizResults]);

  const subjectEnrollmentStats = useMemo(() => {
    const stats = {};

    enrollments.forEach((enrollment) => {
      const subjectCode = enrollment.subjectCode || "Unknown";
      const subjectTitle = enrollment.subjectTitle || "Unknown Subject";

      if (!stats[subjectCode]) {
        stats[subjectCode] = {
          subjectTitle,
          count: 0,
        };
      }

      stats[subjectCode].count += 1;
    });

    return stats;
  }, [enrollments]);

  const filteredResources = useMemo(() => {
    return lessons.filter((lesson) => {
      const subjectMatch =
        resourceSubject === "All" || lesson.subjectCode === resourceSubject;

      const typeMatch = resourceType === "All" || lesson.type === resourceType;

      const searchText = `${lesson.subjectCode || ""} ${
        lesson.subjectTitle || ""
      } ${lesson.weekTopic || ""} ${lesson.title || ""} ${lesson.type || ""} ${
        lesson.description || ""
      } ${lesson.fileName || ""}`.toLowerCase();

      const searchMatch = searchText.includes(resourceSearch.toLowerCase());

      return subjectMatch && typeMatch && searchMatch;
    });
  }, [lessons, resourceSearch, resourceSubject, resourceType]);

  const dashboardCards = [
    {
      icon: "📚",
      title: "Total Subjects",
      value: allSubjects.length,
      text: "BIT subject modules",
    },
    {
      icon: "🗓",
      title: "Semesters",
      value: bitSemesters.length,
      text: "Semester structure",
    },
    {
      icon: "📘",
      title: "Weekly Topics",
      value: totalWeeklyTopics,
      text: "Syllabus topics added",
    },
    {
      icon: "🎥",
      title: "Resources",
      value: lessons.length,
      text: "MongoDB resources",
    },
    {
      icon: "👨‍🎓",
      title: "Enrollments",
      value: loadingEnrollments ? "..." : enrollments.length,
      text: "MongoDB student enrollments",
    },
    {
      icon: "📝",
      title: "Submissions",
      value: loadingSubmissions ? "..." : submissions.length,
      text: "MongoDB assignment submissions",
    },
    {
      icon: "✅",
      title: "Marked",
      value: loadingSubmissions ? "..." : markedSubmissions.length,
      text: "Checked submissions",
    },
    {
      icon: "⏳",
      title: "Pending",
      value: loadingSubmissions ? "..." : pendingSubmissions.length,
      text: "Awaiting review",
    },
    {
      icon: "🧠",
      title: "Total Quizzes",
      value: loadingQuizzes ? "..." : quizzes.length,
      text: "MongoDB quizzes",
    },
    {
      icon: "📊",
      title: "Quiz Attempts",
      value: loadingQuizResults ? "..." : normalizedQuizResults.length,
      text: "MongoDB student attempts",
    },
    {
      icon: "🏆",
      title: "Quiz Passed",
      value: passedQuizResults.length,
      text: "Passed attempts",
    },
    {
      icon: "⭐",
      title: "Avg Quiz Score",
      value: `${averageQuizScore}%`,
      text: "Average student score",
    },
  ];

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleDeleteResource = async (lessonId) => {
    if (!token) {
      window.alert("Please login again. Token missing.");
      return;
    }

    const confirmed = window.confirm("Delete this resource permanently?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/resources/${lessonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        window.alert(data.message || "Failed to delete resource");
        return;
      }

      setLessons((currentLessons) =>
        currentLessons.filter((lesson) => lesson._id !== lessonId)
      );

      window.alert("Resource deleted successfully!");
    } catch (error) {
      console.error("Delete resource error:", error);
      window.alert("Cannot connect to backend server.");
    }
  };

  const handleBackupData = () => {
    const backupData = {
      exportedAt: new Date().toLocaleString(),
      resources: lessons,
      submissions,
      enrollments,
      quizzes,
      quizResults: normalizedQuizResults,
    };

    const backupText = JSON.stringify(backupData, null, 2);

    navigator.clipboard
      .writeText(backupText)
      .then(() => {
        window.alert("Backup copied to clipboard successfully!");
      })
      .catch(() => {
        window.alert("Clipboard copy failed. Check console for backup data.");
        console.log("BIT LMS Backup Data:", backupData);
      });
  };

  const handleClearQuizData = () => {
    const confirmed = window.confirm(
      "Clear local quiz demo data only? MongoDB quiz data will not be deleted."
    );

    if (!confirmed) return;

    localStorage.removeItem("bitLmsQuizzes");
    localStorage.removeItem("bitLmsQuizResults");

    window.alert("Local quiz demo data cleared. MongoDB quiz data is safe.");
  };

  const handleClearLocalSubmissions = () => {
    const confirmed = window.confirm(
      "Clear old localStorage submissions only? MongoDB submissions will not be deleted."
    );

    if (!confirmed) return;

    localStorage.removeItem("bitLmsSubmissions");
    window.alert("Old localStorage submissions cleared. MongoDB data is safe.");
  };

  const handleClearLocalEnrollments = () => {
    const confirmed = window.confirm(
      "Clear old localStorage enrollments only? MongoDB enrollments will not be deleted."
    );

    if (!confirmed) return;

    localStorage.removeItem("bitLmsEnrollments");
    window.alert("Old localStorage enrollments cleared. MongoDB data is safe.");
  };

  const handleResetLocalDemoData = () => {
    const confirmed = window.confirm(
      "Reset local demo data? This clears local quizzes and local quiz results only. MongoDB resources/quizzes/results/enrollments/submissions will not be deleted."
    );

    if (!confirmed) return;

    storageKeys.forEach((key) => localStorage.removeItem(key));

    window.alert("Local demo data cleared!");
  };

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-3xl p-8 md:p-10 text-white shadow-xl">
          <p className="text-cyan-100 font-bold">🛠 Admin Dashboard</p>

          <h1 className="text-4xl md:text-5xl font-black mt-3">
            Welcome, {user.name}
          </h1>

          <p className="text-blue-50 mt-3">
            Email: {user.email} • Role: {user.role}
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="feature-card text-left">
              <div className="text-5xl">{card.icon}</div>

              <h3 className="text-xl font-black mt-5">{card.title}</h3>

              <p className="text-blue-700 text-3xl font-black mt-3">
                {card.value}
              </p>

              <p className="text-slate-500 mt-2">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Admin Data Tools</h3>

              <p className="text-slate-500 mt-1">
                Backup data, refresh MongoDB data, and clear old localStorage
                demo data.
              </p>
            </div>

            <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 font-black">
              MongoDB Connected
            </span>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <ToolButton
              icon="🔄"
              title="Refresh Data"
              text="Fetch latest MongoDB data."
              onClick={handleRefreshPage}
              color="cyan"
            />

            <ToolButton
              icon="📦"
              title="Backup All Data"
              text="Copy resources and reports."
              onClick={handleBackupData}
              color="blue"
            />

            <ToolButton
              icon="🧠"
              title="Clear Local Quiz"
              text="Remove local quiz demo data."
              onClick={handleClearQuizData}
              color="purple"
            />

            <ToolButton
              icon="📝"
              title="Clear Local Submit"
              text="Remove old local submissions."
              onClick={handleClearLocalSubmissions}
              color="green"
            />

            <ToolButton
              icon="👨‍🎓"
              title="Clear Local Enroll"
              text="Remove old local enrollments."
              onClick={handleClearLocalEnrollments}
              color="cyan"
            />

            <ToolButton
              icon="🧹"
              title="Reset Local Data"
              text="Clear local demo data only."
              onClick={handleResetLocalDemoData}
              color="red"
            />
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Student Enrollments</h3>

              <p className="text-slate-500 mt-1">
                MongoDB student subject enrollment records.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshPage}
              className="btn-outline"
            >
              Refresh Enrollments
            </button>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-black">Subject-wise Enrollments</h4>

              {loadingEnrollments ? (
                <EmptyState
                  icon="⏳"
                  title="Loading enrollments..."
                  text="Please wait while enrollments are fetched."
                />
              ) : Object.keys(subjectEnrollmentStats).length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="No enrollments yet"
                  text="When students open lessons, enrollments will appear here."
                />
              ) : (
                <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-slate-600">Subject</th>
                        <th className="p-4 text-slate-600">Title</th>
                        <th className="p-4 text-slate-600">Students</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(subjectEnrollmentStats).map(
                        ([subjectCode, stat]) => (
                          <tr
                            key={subjectCode}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="p-4">
                              <span className="course-code">{subjectCode}</span>
                            </td>

                            <td className="p-4 font-bold text-slate-700">
                              {stat.subjectTitle}
                            </td>

                            <td className="p-4 font-black text-blue-700">
                              {stat.count}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xl font-black">Recent Enrollments</h4>

              {loadingEnrollments ? (
                <EmptyState
                  icon="⏳"
                  title="Loading recent enrollments..."
                  text="Please wait."
                />
              ) : enrollments.length === 0 ? (
                <EmptyState
                  icon="👨‍🎓"
                  title="No student enrollments"
                  text="Enrollment records will show here."
                />
              ) : (
                <div className="mt-5 space-y-4">
                  {enrollments.slice(0, 6).map((enrollment, index) => (
                    <div
                      key={enrollment._id || index}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      <p className="text-blue-700 font-black">
                        {enrollment.subjectCode} • {enrollment.subjectTitle}
                      </p>

                      <h5 className="font-black mt-2">
                        {enrollment.studentName || "Student"}
                      </h5>

                      <p className="text-slate-500 mt-1">
                        {enrollment.studentEmail || ""}
                      </p>

                      <p className="text-xs text-slate-400 mt-3">
                        {enrollment.createdAt
                          ? new Date(enrollment.createdAt).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">All Learning Resources</h3>

              <p className="text-slate-500 mt-1">
                Admin can view, filter, open, refresh, and delete MongoDB
                learning resources.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefreshPage}
                className="btn-outline"
              >
                Refresh
              </button>

              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-black">
                Showing {filteredResources.length} / {lessons.length}
              </span>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-4">
            <input
              type="text"
              value={resourceSearch}
              onChange={(event) => setResourceSearch(event.target.value)}
              placeholder="Search resources..."
              className="form-input"
            />

            <select
              value={resourceSubject}
              onChange={(event) => setResourceSubject(event.target.value)}
              className="form-input"
            >
              <option value="All">All Subjects</option>

              {allSubjects.map((subject) => (
                <option key={subject.code} value={subject.code}>
                  {subject.code} - {subject.title}
                </option>
              ))}
            </select>

            <select
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value)}
              className="form-input"
            >
              {materialTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {loadingResources ? (
            <EmptyState
              icon="⏳"
              title="Loading resources..."
              text="Please wait while resources are fetched from MongoDB."
            />
          ) : filteredResources.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No resources found"
              text="Try changing subject, type, or search keyword."
            />
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-slate-600">Subject</th>
                    <th className="p-4 text-slate-600">Week / Topic</th>
                    <th className="p-4 text-slate-600">Title</th>
                    <th className="p-4 text-slate-600">Type</th>
                    <th className="p-4 text-slate-600">Created By</th>
                    <th className="p-4 text-slate-600">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResources.map((lesson) => (
                    <tr
                      key={lesson._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <p className="font-black text-blue-700">
                          {lesson.subjectCode}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {lesson.subjectTitle}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {lesson.subjectLevel} • {lesson.subjectSemester}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 font-black text-sm">
                          {lesson.weekTopic || "General Resource"}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-800">
                          {lesson.title}
                        </p>

                        {lesson.isUploadedFile && (
                          <p className="text-green-700 text-sm font-bold mt-1">
                            Uploaded: {lesson.fileName || "File"}
                          </p>
                        )}

                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                          {lesson.description}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-black text-sm">
                          {lesson.type}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600">
                        <p className="font-bold">{lesson.createdBy}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {lesson.createdAt
                            ? new Date(lesson.createdAt).toLocaleString()
                            : "Unknown"}
                        </p>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={lesson.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold hover:bg-blue-700 hover:text-white transition"
                          >
                            {lesson.isUploadedFile ? "Open File" : "Open"}
                          </a>

                          <Link
                            to={`/subjects/${lesson.subjectCode.replaceAll(
                              " ",
                              "-"
                            )}`}
                            className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-800 hover:text-white transition"
                          >
                            Subject
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteResource(lesson._id)}
                            className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Quiz Analytics</h3>

              <p className="text-slate-500 mt-1">
                MongoDB quizzes and student quiz attempts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefreshPage}
                className="btn-outline"
              >
                Refresh Quiz Data
              </button>

              <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-black">
                MongoDB Quiz
              </span>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-5 gap-5">
            <QuizStat
              title="Quizzes"
              value={loadingQuizzes ? "..." : quizzes.length}
              icon="🧠"
            />
            <QuizStat
              title="Attempts"
              value={loadingQuizResults ? "..." : normalizedQuizResults.length}
              icon="📊"
            />
            <QuizStat
              title="Passed"
              value={passedQuizResults.length}
              icon="🏆"
            />
            <QuizStat
              title="Failed"
              value={normalizedQuizResults.length - passedQuizResults.length}
              icon="📉"
            />
            <QuizStat title="Average" value={`${averageQuizScore}%`} icon="⭐" />
          </div>

          <div className="mt-10">
            <h4 className="text-xl font-black">Subject-wise Performance</h4>

            {Object.keys(subjectQuizStats).length === 0 ? (
              <EmptyState
                icon="📭"
                title="No subject quiz stats yet"
                text="Student quiz attempts will appear here after submission."
              />
            ) : (
              <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-slate-600">Subject</th>
                      <th className="p-4 text-slate-600">Attempts</th>
                      <th className="p-4 text-slate-600">Average</th>
                      <th className="p-4 text-slate-600">Highest</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(subjectQuizStats).map(
                      ([subjectCode, stat]) => (
                        <tr
                          key={subjectCode}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-4">
                            <span className="course-code">{subjectCode}</span>
                          </td>

                          <td className="p-4 font-bold text-slate-700">
                            {stat.attempts}
                          </td>

                          <td className="p-4 font-black text-blue-700">
                            {Math.round(
                              stat.totalPercentage / stat.attempts
                            )}
                            %
                          </td>

                          <td className="p-4 font-black text-green-700">
                            {stat.highestScore}%
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h4 className="text-xl font-black">Student Quiz Results</h4>

            {normalizedQuizResults.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No quiz results yet"
                text="When students submit quizzes, results will appear here."
              />
            ) : (
              <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-slate-600">Student</th>
                      <th className="p-4 text-slate-600">Subject</th>
                      <th className="p-4 text-slate-600">Quiz</th>
                      <th className="p-4 text-slate-600">Score</th>
                      <th className="p-4 text-slate-600">Percentage</th>
                      <th className="p-4 text-slate-600">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {normalizedQuizResults.map((result, index) => (
                      <tr
                        key={result._id || index}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <p className="font-black text-slate-800">
                            {result.student?.name ||
                              result.user?.name ||
                              result.studentName ||
                              result.createdBy ||
                              "Unknown Student"}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {result.student?.email ||
                              result.user?.email ||
                              result.studentEmail ||
                              ""}
                          </p>
                        </td>

                        <td className="p-4">
                          <span className="course-code">
                            {result.subjectCode || "N/A"}
                          </span>
                        </td>

                        <td className="p-4 text-slate-700 font-bold">
                          {result.quiz?.title ||
                            result.quizTitle ||
                            result.quizId?.title ||
                            "Quiz"}
                        </td>

                        <td className="p-4 font-black text-blue-700">
                          {result.score || 0}/{result.totalQuestions || 0}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full font-black text-sm ${
                              result.percentage >= 50
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {result.percentage}%
                          </span>
                        </td>

                        <td className="p-4 text-slate-500">
                          {result.createdAt
                            ? new Date(result.createdAt).toLocaleString()
                            : "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Semester Subject Overview</h3>

              <p className="text-slate-500 mt-1">
                View subjects, weekly topics, and semester structure from the
                central BIT data file.
              </p>
            </div>

            <Link to="/subjects" className="btn-primary">
              View Subjects
            </Link>
          </div>

          <div className="mt-8 space-y-8">
            {bitSemesters.map((semester) => (
              <div
                key={semester.semester}
                className="rounded-3xl border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-blue-700 font-black">
                      {semester.level}
                    </p>

                    <h4 className="text-2xl font-black">
                      {semester.semester}
                    </h4>
                  </div>

                  <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-black">
                    {semester.subjects.length} Subjects
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-slate-600">Code</th>
                        <th className="p-4 text-slate-600">Subject</th>
                        <th className="p-4 text-slate-600">Weekly Topics</th>
                        <th className="p-4 text-slate-600">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {semester.subjects.map((subject) => (
                        <tr
                          key={subject.code}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-4">
                            <span className="course-code">{subject.code}</span>
                          </td>

                          <td className="p-4 font-bold text-slate-800">
                            {subject.title}
                          </td>

                          <td className="p-4 text-slate-600">
                            {subject.weeks?.length || 0}
                          </td>

                          <td className="p-4">
                            <Link
                              to={`/subjects/${getSubjectRoute(subject.code)}`}
                              className="font-bold text-blue-700 hover:underline"
                            >
                              Open →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h3 className="text-2xl font-black">Recent Resources</h3>

            <p className="text-slate-500 mt-1">
              Latest MongoDB teacher-created learning materials.
            </p>

            {lessons.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No resources yet"
                text="Teacher-created resources will appear here."
              />
            ) : (
              <div className="mt-6 space-y-4">
                {lessons.slice(0, 5).map((lesson) => (
                  <div
                    key={lesson._id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <p className="text-blue-700 font-black">
                      {lesson.subjectCode} • {lesson.subjectTitle}
                    </p>

                    <h4 className="font-black mt-2">{lesson.title}</h4>

                    <p className="text-slate-500 mt-1">
                      {lesson.type} • {lesson.weekTopic || "General Resource"}
                    </p>

                    {lesson.isUploadedFile && (
                      <p className="text-green-700 text-sm font-bold mt-1">
                        Uploaded File: {lesson.fileName || "File"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h3 className="text-2xl font-black">Recent Submissions</h3>

            <p className="text-slate-500 mt-1">
              Latest MongoDB student assignment submissions.
            </p>

            {loadingSubmissions ? (
              <EmptyState
                icon="⏳"
                title="Loading submissions..."
                text="Fetching student submissions from MongoDB."
              />
            ) : submissions.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No submissions yet"
                text="Student assignment submissions will appear here."
              />
            ) : (
              <div className="mt-6 space-y-4">
                {submissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission._id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-blue-700 font-black">
                          {submission.subjectCode} • {submission.subjectTitle}
                        </p>

                        <h4 className="font-black mt-2">{submission.title}</h4>

                        <p className="text-slate-500 mt-1">
                          Student: {submission.studentName}
                        </p>

                        <p className="text-slate-400 text-sm mt-1">
                          {submission.studentEmail}
                        </p>

                        {submission.submissionLink && (
                          <a
                            href={submission.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex mt-3 font-bold text-blue-700 hover:underline"
                          >
                            Open Submission →
                          </a>
                        )}

                        <p className="text-xs text-slate-400 mt-3">
                          Submitted at:{" "}
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleString()
                            : "Unknown"}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full font-black text-sm ${
                          submission.status === "Marked"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {submission.status || "Submitted"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolButton({ icon, title, text, onClick, color }) {
  const colorClass = {
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    purple: "bg-purple-50 border-purple-100 text-purple-800",
    green: "bg-green-50 border-green-100 text-green-800",
    cyan: "bg-cyan-50 border-cyan-100 text-cyan-800",
    red: "bg-red-50 border-red-100 text-red-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-5 rounded-3xl border text-left hover:-translate-y-1 transition ${
        colorClass[color] || colorClass.blue
      }`}
    >
      <div className="text-4xl">{icon}</div>
      <h4 className="font-black mt-4">{title}</h4>
      <p className="text-slate-500 mt-2">{text}</p>
    </button>
  );
}

function QuizStat({ icon, title, value }) {
  return (
    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
      <div className="text-4xl">{icon}</div>
      <h4 className="font-black mt-4">{title}</h4>
      <p className="text-blue-700 text-3xl font-black mt-2">{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="mt-8 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center">
      <p className="text-5xl">{icon}</p>
      <h4 className="text-xl font-black mt-4">{title}</h4>
      <p className="text-slate-500 mt-2">{text}</p>
    </div>
  );
}

export default AdminDashboard;
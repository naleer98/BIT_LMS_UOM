import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../api";

function safeGetStorage(key, fallback = []) {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : fallback;
  } catch {
    return fallback;
  }
}

function calculatePercentage(score, totalQuestions) {
  if (!totalQuestions || Number(totalQuestions) <= 0) return 0;
  return Math.round((Number(score || 0) / Number(totalQuestions)) * 100);
}

function StudentDashboard() {
  const user = safeGetStorage("bitLmsUser", {
    name: "Student",
    email: "student@example.com",
    role: "student",
  });

  const token = localStorage.getItem("bitLmsToken");

  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [quizResults, setQuizResults] = useState([]);
  const [loadingQuizResults, setLoadingQuizResults] = useState(false);

  useEffect(() => {
    const fetchMyQuizResults = async () => {
      if (!token) {
        console.warn("Token missing. Cannot fetch quiz results.");
        return;
      }

      try {
        setLoadingQuizResults(true);

        const response = await fetch(`${API_BASE_URL}/quizzes/results/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const resultsList = Array.isArray(data)
            ? data
            : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.quizResults)
            ? data.quizResults
            : [];

          setQuizResults(resultsList);
        } else {
          console.error("My quiz results fetch error:", data.message);
          setQuizResults([]);
        }
      } catch (error) {
        console.error("Fetch my quiz results failed:", error);
        setQuizResults([]);
      } finally {
        setLoadingQuizResults(false);
      }
    };

    const fetchMyEnrollments = async () => {
      if (!token) {
        console.warn("Token missing. Cannot fetch enrollments.");
        return;
      }

      try {
        setLoadingEnrollments(true);

        const response = await fetch(`${API_BASE_URL}/enrollments/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setEnrollments(data.enrollments || []);
        } else {
          console.error("My enrollments fetch error:", data.message);
          setEnrollments([]);
        }
      } catch (error) {
        console.error("Fetch my enrollments failed:", error);
        setEnrollments([]);
      } finally {
        setLoadingEnrollments(false);
      }
    };

    const fetchMySubmissions = async () => {
      if (!token) {
        console.warn("Token missing. Cannot fetch submissions.");
        return;
      }

      try {
        setLoadingSubmissions(true);

        const response = await fetch(`${API_BASE_URL}/submissions/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmissions(data.submissions || []);
        } else {
          console.error("My submissions fetch error:", data.message);
          setSubmissions([]);
        }
      } catch (error) {
        console.error("Fetch my submissions failed:", error);
        setSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchMyQuizResults();
    fetchMyEnrollments();
    fetchMySubmissions();
  }, [token]);

  const myEnrollments = useMemo(() => {
    return enrollments;
  }, [enrollments]);

  const mySubmissions = useMemo(() => {
    return submissions;
  }, [submissions]);

  const markedSubmissions = mySubmissions.filter(
    (submission) => submission.status === "Marked"
  );

  const pendingSubmissions = mySubmissions.filter(
    (submission) => submission.status !== "Marked"
  );

  const normalizedQuizResults = useMemo(() => {
    return quizResults.map((result) => {
      const percentage =
        typeof result.percentage === "number"
          ? Math.round(result.percentage)
          : calculatePercentage(
              result.score || result.correctAnswers,
              result.totalQuestions
            );

      return {
        ...result,
        percentage,
      };
    });
  }, [quizResults]);

  const passedQuizResults = normalizedQuizResults.filter(
    (result) => result.status === "Passed" || result.percentage >= 50
  );

  const failedQuizResults = normalizedQuizResults.filter(
    (result) => result.status === "Failed" || result.percentage < 50
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

  const dashboardCards = [
    {
      icon: "📚",
      title: "My Subjects",
      value: loadingEnrollments ? "..." : myEnrollments.length,
    },
    {
      icon: "📝",
      title: "Submissions",
      value: loadingSubmissions ? "..." : mySubmissions.length,
    },
    {
      icon: "✅",
      title: "Marked",
      value: loadingSubmissions ? "..." : markedSubmissions.length,
    },
    {
      icon: "⏳",
      title: "Pending",
      value: loadingSubmissions ? "..." : pendingSubmissions.length,
    },
    {
      icon: "🧠",
      title: "Quiz Attempts",
      value: loadingQuizResults ? "..." : normalizedQuizResults.length,
    },
    {
      icon: "🏆",
      title: "Quiz Passed",
      value: passedQuizResults.length,
    },
    {
      icon: "📉",
      title: "Quiz Failed",
      value: failedQuizResults.length,
    },
    {
      icon: "📊",
      title: "Avg Score",
      value: `${averageQuizScore}%`,
    },
  ];

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-3xl p-8 md:p-10 text-white shadow-xl">
          <p className="text-cyan-100 font-bold">🎓 Student Dashboard</p>

          <h1 className="text-4xl md:text-5xl font-black mt-3">
            Welcome, {user.name}
          </h1>

          <p className="text-blue-50 mt-3">
            Email: {user.email} • Role: {user.role}
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="feature-card text-center">
              <div className="text-5xl">{card.icon}</div>

              <h3 className="text-xl font-black mt-5">{card.title}</h3>

              <p className="text-blue-700 text-3xl font-black mt-3">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">My Quiz Results</h3>

              <p className="text-slate-500 mt-1">
                Your submitted quiz attempts from MongoDB.
              </p>
            </div>

            <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-black">
              MongoDB Quiz Results
            </span>
          </div>

          {loadingQuizResults ? (
            <EmptyState
              icon="⏳"
              title="Loading quiz results..."
              text="Please wait while your quiz attempts are fetched."
            />
          ) : normalizedQuizResults.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No quiz attempts yet"
              text="Open a subject, attempt a quiz, and your result will appear here."
            />
          ) : (
            <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-slate-600">Subject</th>
                    <th className="p-4 text-slate-600">Quiz</th>
                    <th className="p-4 text-slate-600">Score</th>
                    <th className="p-4 text-slate-600">Percentage</th>
                    <th className="p-4 text-slate-600">Status</th>
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
                        <span className="course-code">
                          {result.subjectCode || "N/A"}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-slate-800">
                        {result.quizTitle ||
                          result.quiz?.title ||
                          result.quizId?.title ||
                          "Quiz"}
                      </td>

                      <td className="p-4 font-black text-blue-700">
                        {result.score ?? result.correctAnswers ?? 0}/
                        {result.totalQuestions || 0}
                      </td>

                      <td className="p-4 font-black text-slate-800">
                        {result.percentage}%
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full font-black text-sm ${
                            result.percentage >= 50
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {result.percentage >= 50 ? "Passed" : "Failed"}
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

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h3 className="text-2xl font-black">My Enrolled Subjects</h3>

            <p className="text-slate-500 mt-1">
              Subjects you have enrolled in.
            </p>

            {loadingEnrollments ? (
              <EmptyState
                icon="⏳"
                title="Loading enrolled subjects..."
                text="Please wait while your enrolled subjects are fetched."
              />
            ) : myEnrollments.length === 0 ? (
              <EmptyState
                icon="📚"
                title="No enrolled subjects"
                text="Go to Subjects page and open your subject modules."
              />
            ) : (
              <div className="mt-6 space-y-4">
                {myEnrollments.slice(0, 5).map((enrollment, index) => (
                  <div
                    key={enrollment._id || enrollment.id || index}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <p className="text-blue-700 font-black">
                      {enrollment.subjectCode}
                    </p>

                    <h4 className="font-black mt-2">
                      {enrollment.subjectTitle || "Subject"}
                    </h4>

                    <p className="text-slate-500 mt-1">
                      {enrollment.subjectLevel || "BIT"} •{" "}
                      {enrollment.subjectSemester || "Semester"}
                    </p>

                    <Link
                      to={`/subjects/${enrollment.subjectCode.replaceAll(
                        " ",
                        "-"
                      )}`}
                      className="inline-block mt-3 font-bold text-blue-700 hover:underline"
                    >
                      Open Subject →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">Recent Submissions</h3>

                <p className="text-slate-500 mt-1">
                  Your latest MongoDB assignment submissions.
                </p>
              </div>

              <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 font-black">
                MongoDB
              </span>
            </div>

            {loadingSubmissions ? (
              <EmptyState
                icon="⏳"
                title="Loading submissions..."
                text="Please wait while your submissions are fetched."
              />
            ) : mySubmissions.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No submissions yet"
                text="Submit an assignment from any subject page."
              />
            ) : (
              <div className="mt-6 space-y-4">
                {mySubmissions.slice(0, 5).map((submission, index) => (
                  <div
                    key={submission._id || index}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-blue-700 font-black">
                          {submission.subjectCode} •{" "}
                          {submission.subjectTitle || "Subject"}
                        </p>

                        <h4 className="font-black mt-2">
                          {submission.title || "Assignment"}
                        </h4>

                        {submission.note && (
                          <p className="text-slate-500 mt-2">
                            {submission.note}
                          </p>
                        )}

                        {submission.feedback && (
                          <p className="text-green-700 font-bold mt-2">
                            Feedback: {submission.feedback}
                          </p>
                        )}

                        {submission.submissionLink && (
                          <a
                            href={submission.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 font-bold text-blue-700 hover:underline"
                          >
                            Open Submission →
                          </a>
                        )}

                        <p className="text-slate-400 text-sm mt-3">
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
                        {submission.status || "Submitted"} •{" "}
                        {submission.marks || "Pending"}
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

function EmptyState({ icon, title, text }) {
  return (
    <div className="mt-8 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center">
      <p className="text-5xl">{icon}</p>
      <h4 className="text-xl font-black mt-4">{title}</h4>
      <p className="text-slate-500 mt-2">{text}</p>
    </div>
  );
}

export default StudentDashboard;
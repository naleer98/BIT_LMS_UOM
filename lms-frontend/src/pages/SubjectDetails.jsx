import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { allSubjects } from "../data/bitData";
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

function getBackendRootUrl() {
  return API_BASE_URL.replace("/api", "");
}

function SubjectDetails() {
  const { subjectCode } = useParams();

  const realSubjectCode = subjectCode.replaceAll("-", " ");

  const selectedSubject = useMemo(() => {
    return allSubjects.find((subject) => subject.code === realSubjectCode);
  }, [realSubjectCode]);

  const token = localStorage.getItem("bitLmsToken");
  const loggedInUser = safeGetUser();
  const isStudent = loggedInUser?.role === "student";

  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedResults, setSubmittedResults] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    note: "",
    submissionLink: "",
  });

  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjectResources = async () => {
      try {
        setLoadingResources(true);

        const response = await fetch(
          `${API_BASE_URL}/resources/subject/${subjectCode}`
        );

        const data = await response.json();

        if (response.ok) {
          const resourceList = Array.isArray(data)
            ? data
            : Array.isArray(data.resources)
            ? data.resources
            : [];

          setResources(resourceList);
        } else {
          console.error("Resources fetch error:", data.message);
          setResources([]);
        }
      } catch (error) {
        console.error("Resources fetch failed:", error);
        setResources([]);
      } finally {
        setLoadingResources(false);
      }
    };

    const fetchSubjectQuizzes = async () => {
      try {
        setLoadingQuizzes(true);

        const response = await fetch(
          `${API_BASE_URL}/quizzes/subject/${subjectCode}`
        );

        const data = await response.json();

        if (response.ok) {
          const quizList = Array.isArray(data)
            ? data
            : Array.isArray(data.quizzes)
            ? data.quizzes
            : [];

          setQuizzes(quizList);
        } else {
          console.error("Quizzes fetch error:", data.message);
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Quizzes fetch failed:", error);
        setQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    const fetchMySubmissions = async () => {
      if (!token || !isStudent) {
        setMySubmissions([]);
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
          const subjectSubmissions = (data.submissions || []).filter(
            (submission) => submission.subjectCode === realSubjectCode
          );

          setMySubmissions(subjectSubmissions);
        } else {
          console.error("My submissions fetch error:", data.message);
          setMySubmissions([]);
        }
      } catch (error) {
        console.error("Fetch my submissions failed:", error);
        setMySubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    if (subjectCode) {
      fetchSubjectResources();
      fetchSubjectQuizzes();
      fetchMySubmissions();
    }
  }, [subjectCode, realSubjectCode, token, isStudent]);

  const handleAnswerChange = (quizId, questionIndex, optionIndex) => {
    if (!isStudent) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        [questionIndex]: optionIndex,
      },
    }));
  };

  const isCorrectAnswer = (selectedAnswer, correctAnswer) => {
    return Number(selectedAnswer) === Number(correctAnswer);
  };

  const getQuestionText = (question) => {
    return question.question || question.questions || "Question not available";
  };

  const calculateScore = (quiz) => {
    let score = 0;

    quiz.questions?.forEach((question, index) => {
      const selectedOption = selectedAnswers[quiz._id]?.[index];

      if (isCorrectAnswer(selectedOption, question.correctAnswer)) {
        score += 1;
      }
    });

    return score;
  };

  const handleSubmitQuiz = async (quiz) => {
    if (!isStudent) {
      alert("Only students can submit quizzes.");
      return;
    }

    if (!token) {
      alert("Please login first to submit quiz.");
      return;
    }

    const questions = quiz.questions || [];
    const answeredQuestions = selectedAnswers[quiz._id] || {};
    const totalAnswered = Object.keys(answeredQuestions).length;

    if (questions.length === 0) {
      alert("This quiz has no questions.");
      return;
    }

    if (totalAnswered !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const score = calculateScore(quiz);
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const answers = questions.map((question, index) => ({
      questionIndex: index,
      questionText: getQuestionText(question),
      selectedAnswer: selectedAnswers[quiz._id][index],
      correctAnswer: question.correctAnswer,
      selectedOptionText:
        question.options?.[selectedAnswers[quiz._id][index]] || "",
      correctOptionText: question.options?.[question.correctAnswer] || "",
      isCorrect: isCorrectAnswer(
        selectedAnswers[quiz._id][index],
        question.correctAnswer
      ),
    }));

    const resultPayload = {
      quizId: quiz._id,
      quizTitle: quiz.title || "Untitled Quiz",
      subjectCode: quiz.subjectCode || realSubjectCode,
      subjectTitle:
        quiz.subjectTitle || selectedSubject?.title || realSubjectCode,
      studentId: loggedInUser?._id || loggedInUser?.id || loggedInUser?.email,
      studentName: loggedInUser?.name || "Student",
      studentEmail: loggedInUser?.email || "",
      score,
      totalQuestions,
      percentage,
      answers,
    };

    try {
      setSubmitLoading(true);

      const response = await fetch(`${API_BASE_URL}/quizzes/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resultPayload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedResults((prev) => ({
          ...prev,
          [quiz._id]: {
            score,
            totalQuestions,
            percentage,
          },
        }));

        alert(`Quiz submitted successfully! Score: ${score}/${totalQuestions}`);
      } else {
        console.error("Quiz submit backend error:", data);
        alert(data.message || "Failed to submit quiz result.");
      }
    } catch (error) {
      console.error("Quiz submit failed:", error);
      alert("Something went wrong while submitting quiz.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;

    setAssignmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAssignment = async () => {
    if (!isStudent) {
      alert("Only students can submit assignments.");
      return;
    }

    if (!token) {
      alert("Please login first to submit assignment.");
      return;
    }

    if (!assignmentForm.title.trim()) {
      alert("Please enter assignment title.");
      return;
    }

    if (!assignmentForm.note.trim() && !assignmentForm.submissionLink.trim()) {
      alert("Please enter note or submission link.");
      return;
    }

    const payload = {
      subjectCode: realSubjectCode,
      subjectTitle: selectedSubject?.title || realSubjectCode,
      title: assignmentForm.title.trim(),
      note: assignmentForm.note.trim(),
      submissionLink: assignmentForm.submissionLink.trim(),
    };

    try {
      setAssignmentSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to submit assignment.");
        return;
      }

      setMySubmissions((prev) => [data.submission, ...prev]);

      setAssignmentForm({
        title: "",
        note: "",
        submissionLink: "",
      });

      alert("Assignment submitted successfully!");
    } catch (error) {
      console.error("Assignment submit failed:", error);
      alert("Cannot connect to submissions API.");
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const getResourceUrl = (resource) => {
    const backendRootUrl = getBackendRootUrl();

    if (resource.fileUrl) {
      return `${backendRootUrl}${resource.fileUrl}`;
    }

    if (resource.resourceUrl) {
      return resource.resourceUrl;
    }

    if (resource.url) {
      return resource.url;
    }

    if (resource.link) {
      return resource.link;
    }

    return "#";
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <h1 style={styles.title}>
          {realSubjectCode} - {selectedSubject?.title || "Subject"}
        </h1>

        <p style={styles.subtitle}>
          {selectedSubject?.level || "BIT"} •{" "}
          {selectedSubject?.semester || "Semester"} • Study materials, quizzes,
          and assignments for this subject.
        </p>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📚 Resources</h2>

        {loadingResources ? (
          <p style={styles.mutedText}>Loading resources...</p>
        ) : resources.length === 0 ? (
          <p style={styles.mutedText}>No resources available yet.</p>
        ) : (
          <div style={styles.grid}>
            {resources.map((resource) => (
              <div key={resource._id} style={styles.card}>
                <h3 style={styles.cardTitle}>
                  {resource.title || "Untitled Resource"}
                </h3>

                <p style={styles.cardText}>
                  {resource.description || "No description available."}
                </p>

                <p style={styles.badge}>
                  {resource.type || resource.resourceType || "Resource"}
                </p>

                <a
                  href={getResourceUrl(resource)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.button}
                >
                  Open Resource
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {isStudent && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📤 Submit Assignment</h2>

          <div style={styles.assignmentWrapper}>
            <div style={styles.assignmentFormCard}>
              <h3 style={styles.cardTitle}>Submit your work</h3>

              <p style={styles.cardText}>
                Paste your Google Drive/GitHub/Moodle link or write a short note
                about your submission.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.label}>Assignment Title</label>
                <input
                  type="text"
                  name="title"
                  value={assignmentForm.title}
                  onChange={handleAssignmentChange}
                  placeholder="Example: Week 01 HTML Assignment"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Submission Link</label>
                <input
                  type="text"
                  name="submissionLink"
                  value={assignmentForm.submissionLink}
                  onChange={handleAssignmentChange}
                  placeholder="Paste Google Drive / GitHub / Moodle link"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Note</label>
                <textarea
                  name="note"
                  value={assignmentForm.note}
                  onChange={handleAssignmentChange}
                  placeholder="Write a short note for your teacher..."
                  style={styles.textarea}
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleSubmitAssignment}
                disabled={assignmentSubmitting}
                style={{
                  ...styles.submitButton,
                  opacity: assignmentSubmitting ? 0.6 : 1,
                  cursor: assignmentSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {assignmentSubmitting ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>

            <div style={styles.assignmentListCard}>
              <h3 style={styles.cardTitle}>My Submissions</h3>

              {loadingSubmissions ? (
                <p style={styles.mutedText}>Loading submissions...</p>
              ) : mySubmissions.length === 0 ? (
                <p style={styles.mutedText}>
                  No submissions yet for this subject.
                </p>
              ) : (
                <div style={styles.submissionList}>
                  {mySubmissions.map((submission) => (
                    <div key={submission._id} style={styles.submissionItem}>
                      <div>
                        <h4 style={styles.submissionTitle}>
                          {submission.title}
                        </h4>

                        <p style={styles.cardText}>
                          Status:{" "}
                          <strong>{submission.status || "Submitted"}</strong> •
                          Marks:{" "}
                          <strong>{submission.marks || "Pending"}</strong>
                        </p>

                        {submission.feedback && (
                          <p style={styles.cardText}>
                            Feedback: {submission.feedback}
                          </p>
                        )}

                        {submission.submissionLink && (
                          <a
                            href={submission.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.smallLink}
                          >
                            Open Submission →
                          </a>
                        )}

                        <p style={styles.dateText}>
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleString()
                            : "Recently submitted"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!isStudent && (
        <section style={styles.section}>
          <div style={styles.infoBox}>
            <h2 style={styles.infoTitle}>👨‍🏫 Teacher/Admin View</h2>
            <p style={styles.cardText}>
              Assignment submission and quiz attempt actions are available only
              for student accounts. You can review resources and quizzes from
              this subject page.
            </p>
          </div>
        </section>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📝 Quizzes</h2>

        {loadingQuizzes ? (
          <p style={styles.mutedText}>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p style={styles.mutedText}>No quizzes available yet.</p>
        ) : (
          <div style={styles.quizList}>
            {quizzes.map((quiz) => (
              <div key={quiz._id} style={styles.quizCard}>
                <div style={styles.quizHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>
                      {quiz.title || "Untitled Quiz"}
                    </h3>

                    <p style={styles.cardText}>
                      {quiz.description || "Answer all questions carefully."}
                    </p>

                    <p style={styles.cardText}>
                      Total Questions: {quiz.questions?.length || 0}
                    </p>
                  </div>

                  {submittedResults[quiz._id] && (
                    <div style={styles.scoreBox}>
                      Score: {submittedResults[quiz._id].score}/
                      {submittedResults[quiz._id].totalQuestions}
                    </div>
                  )}
                </div>

                {quiz.questions?.map((question, questionIndex) => (
                  <div key={questionIndex} style={styles.questionBox}>
                    <h4 style={styles.questionTitle}>
                      {questionIndex + 1}. {getQuestionText(question)}
                    </h4>

                    <div style={styles.optionsList}>
                      {question.options?.map((option, optionIndex) => (
                        <label key={optionIndex} style={styles.optionLabel}>
                          {isStudent && (
                            <input
                              type="radio"
                              name={`${quiz._id}-${questionIndex}`}
                              checked={
                                selectedAnswers[quiz._id]?.[questionIndex] ===
                                optionIndex
                              }
                              onChange={() =>
                                handleAnswerChange(
                                  quiz._id,
                                  questionIndex,
                                  optionIndex
                                )
                              }
                              disabled={Boolean(submittedResults[quiz._id])}
                            />
                          )}

                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {isStudent && (
                  <button
                    type="button"
                    onClick={() => handleSubmitQuiz(quiz)}
                    disabled={
                      submitLoading || Boolean(submittedResults[quiz._id])
                    }
                    style={{
                      ...styles.submitButton,
                      opacity:
                        submitLoading || submittedResults[quiz._id] ? 0.6 : 1,
                      cursor:
                        submitLoading || submittedResults[quiz._id]
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {submittedResults[quiz._id]
                      ? "Submitted"
                      : submitLoading
                      ? "Submitting..."
                      : "Submit Quiz"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  headerCard: {
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    color: "white",
    padding: "30px",
    borderRadius: "18px",
    marginBottom: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
  },
  subtitle: {
    marginTop: "10px",
    fontSize: "16px",
    opacity: 0.9,
  },
  section: {
    marginBottom: "35px",
  },
  sectionTitle: {
    fontSize: "24px",
    marginBottom: "18px",
    color: "#111827",
  },
  mutedText: {
    color: "#6b7280",
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },
  cardText: {
    color: "#4b5563",
    lineHeight: "1.5",
    marginTop: "8px",
  },
  badge: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "8px",
  },
  button: {
    display: "inline-block",
    marginTop: "15px",
    background: "#2563eb",
    color: "white",
    padding: "10px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
  },
  assignmentWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "22px",
  },
  assignmentFormCard: {
    background: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  assignmentListCard: {
    background: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  formGroup: {
    marginTop: "16px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
  },
  submissionList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "16px",
  },
  submissionItem: {
    background: "#f9fafb",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },
  submissionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "16px",
  },
  smallLink: {
    display: "inline-block",
    marginTop: "8px",
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none",
  },
  dateText: {
    color: "#9ca3af",
    fontSize: "12px",
    marginTop: "8px",
  },
  quizList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  quizCard: {
    background: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    alignItems: "center",
    marginBottom: "20px",
  },
  scoreBox: {
    background: "#dcfce7",
    color: "#166534",
    padding: "10px 15px",
    borderRadius: "12px",
    fontWeight: "800",
  },
  questionBox: {
    background: "#f9fafb",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "16px",
    border: "1px solid #e5e7eb",
  },
  questionTitle: {
    margin: "0 0 12px",
    color: "#111827",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  optionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
  },
  submitButton: {
    marginTop: "10px",
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "18px",
    padding: "22px",
  },
  infoTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#1e3a8a",
  },
};

export default SubjectDetails;
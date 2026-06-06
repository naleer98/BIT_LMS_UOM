import { useEffect, useMemo, useState } from "react";
import { allSubjects } from "../data/bitData";
import API_BASE_URL from "../api";

const lessonTypes = [
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

function safeGetStorage(key, fallback = null) {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : fallback;
  } catch {
    return fallback;
  }
}

function TeacherDashboard() {
  const user = safeGetStorage("bitLmsUser", {
    name: "Teacher",
    email: "teacher@example.com",
    role: "teacher",
  });

  const token = localStorage.getItem("bitLmsToken");

  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    subjectCode: "ITE 1123",
    weekTopic: "",
    title: "",
    type: "Video Lesson",
    resourceMode: "link",
    resourceUrl: "",
    resourceFile: null,
    description: "",
  });

  const [quizForm, setQuizForm] = useState({
    subjectCode: "ITE 1123",
    title: "",
    description: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "0",
  });

  const [quizQuestions, setQuizQuestions] = useState([]);

  const selectedLessonSubject = useMemo(() => {
    return allSubjects.find(
      (subject) => subject.code === lessonForm.subjectCode
    );
  }, [lessonForm.subjectCode]);

  const selectedQuizSubject = useMemo(() => {
    return allSubjects.find((subject) => subject.code === quizForm.subjectCode);
  }, [quizForm.subjectCode]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingResources(true);

        const response = await fetch(`${API_BASE_URL}/resources`);
        const data = await response.json();

        if (response.ok && data.success) {
          setLessons(data.resources || []);
        } else {
          console.error(data.message || "Failed to fetch resources");
          setLessons([]);
        }
      } catch (error) {
        console.error("Fetch resources error:", error);
        setLessons([]);
      } finally {
        setLoadingResources(false);
      }

      try {
        setLoadingQuizzes(true);

        const response = await fetch(`${API_BASE_URL}/quizzes`);
        const data = await response.json();

        if (response.ok && data.success) {
          setQuizzes(data.quizzes || []);
        } else {
          console.error(data.message || "Failed to fetch quizzes");
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Fetch quizzes error:", error);
        setQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }

      if (token) {
        try {
          setLoadingSubmissions(true);

          const response = await fetch(`${API_BASE_URL}/submissions`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setSubmissions(data.submissions || []);
          } else {
            console.error(data.message || "Failed to fetch submissions");
            setSubmissions([]);
          }
        } catch (error) {
          console.error("Fetch submissions error:", error);
          setSubmissions([]);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };

    loadInitialData();
  }, [token]);

  const fetchResources = async () => {
    try {
      setLoadingResources(true);

      const response = await fetch(`${API_BASE_URL}/resources`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to fetch resources");
        setLessons([]);
        return;
      }

      setLessons(data.resources || []);
    } catch (error) {
      console.error("Fetch resources error:", error);
      alert("Cannot connect to backend resources API.");
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);

      const response = await fetch(`${API_BASE_URL}/quizzes`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to fetch quizzes");
        setQuizzes([]);
        return;
      }

      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("Fetch quizzes error:", error);
      alert("Cannot connect to backend quizzes API.");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!token) {
      alert("Please login again. Token missing.");
      return;
    }

    try {
      setLoadingSubmissions(true);

      const response = await fetch(`${API_BASE_URL}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to fetch submissions");
        setSubmissions([]);
        return;
      }

      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Fetch submissions error:", error);
      alert("Cannot connect to submissions API.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleLessonChange = (event) => {
    const { name, value } = event.target;

    if (name === "subjectCode") {
      setLessonForm({
        ...lessonForm,
        subjectCode: value,
        weekTopic: "",
      });
      return;
    }

    if (name === "resourceMode") {
      setLessonForm({
        ...lessonForm,
        resourceMode: value,
        resourceUrl: "",
        resourceFile: null,
      });

      const fileInput = document.getElementById("resourceFileInput");
      if (fileInput) {
        fileInput.value = "";
      }

      return;
    }

    setLessonForm({
      ...lessonForm,
      [name]: value,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setLessonForm({
      ...lessonForm,
      resourceFile: file || null,
    });
  };

  const handleQuizChange = (event) => {
    const { name, value } = event.target;

    if (name === "subjectCode") {
      setQuizForm({
        ...quizForm,
        subjectCode: value,
      });
      setQuizQuestions([]);
      return;
    }

    setQuizForm({
      ...quizForm,
      [name]: value,
    });
  };

  const handleCreateLesson = async () => {
    if (!token) {
      alert("Please login again. Token missing.");
      return;
    }

    if (
      !lessonForm.weekTopic.trim() ||
      !lessonForm.title.trim() ||
      !lessonForm.description.trim()
    ) {
      alert("Please fill week/topic, title, and description.");
      return;
    }

    if (lessonForm.resourceMode === "link" && !lessonForm.resourceUrl.trim()) {
      alert("Please enter a resource link.");
      return;
    }

    if (lessonForm.resourceMode === "file" && !lessonForm.resourceFile) {
      alert("Please choose a file to upload.");
      return;
    }

    const selectedSubject = allSubjects.find(
      (subject) => subject.code === lessonForm.subjectCode
    );

    try {
      let response;

      if (lessonForm.resourceMode === "file") {
        const formData = new FormData();

        formData.append("subjectCode", lessonForm.subjectCode);
        formData.append("subjectTitle", selectedSubject?.title || "");
        formData.append("subjectLevel", selectedSubject?.level || "");
        formData.append("subjectSemester", selectedSubject?.semester || "");
        formData.append("weekTopic", lessonForm.weekTopic);
        formData.append("title", lessonForm.title);
        formData.append("type", lessonForm.type);
        formData.append("description", lessonForm.description);
        formData.append("resourceFile", lessonForm.resourceFile);

        response = await fetch(`${API_BASE_URL}/resources/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        const newResource = {
          subjectCode: lessonForm.subjectCode,
          subjectTitle: selectedSubject?.title || "",
          subjectLevel: selectedSubject?.level || "",
          subjectSemester: selectedSubject?.semester || "",
          weekTopic: lessonForm.weekTopic,
          title: lessonForm.title,
          type: lessonForm.type,
          resourceUrl: lessonForm.resourceUrl,
          description: lessonForm.description,
        };

        response = await fetch(`${API_BASE_URL}/resources`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newResource),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create resource");
        return;
      }

      setLessons([data.resource, ...lessons]);

      setLessonForm({
        subjectCode: "ITE 1123",
        weekTopic: "",
        title: "",
        type: "Video Lesson",
        resourceMode: "link",
        resourceUrl: "",
        resourceFile: null,
        description: "",
      });

      const fileInput = document.getElementById("resourceFileInput");
      if (fileInput) {
        fileInput.value = "";
      }

      alert("Resource created successfully!");
    } catch (error) {
      console.error("Create resource error:", error);
      alert("Cannot connect to backend server.");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!token) {
      alert("Please login again. Token missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );
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
        alert(data.message || "Failed to delete resource");
        return;
      }

      setLessons((currentLessons) =>
        currentLessons.filter((lesson) => lesson._id !== lessonId)
      );

      alert("Resource deleted successfully!");
    } catch (error) {
      console.error("Delete resource error:", error);
      alert("Cannot connect to backend server.");
    }
  };

  const handleAddQuestionToQuiz = () => {
    if (
      !quizForm.question.trim() ||
      !quizForm.optionA.trim() ||
      !quizForm.optionB.trim() ||
      !quizForm.optionC.trim() ||
      !quizForm.optionD.trim()
    ) {
      alert("Please fill question and all four options.");
      return;
    }

    const newQuestion = {
      question: quizForm.question.trim(),
      options: [
        quizForm.optionA.trim(),
        quizForm.optionB.trim(),
        quizForm.optionC.trim(),
        quizForm.optionD.trim(),
      ],
      correctAnswer: Number(quizForm.correctAnswer),
    };

    setQuizQuestions([...quizQuestions, newQuestion]);

    setQuizForm({
      ...quizForm,
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "0",
    });
  };

  const handleRemoveQuestionFromQuiz = (questionIndex) => {
    setQuizQuestions((currentQuestions) =>
      currentQuestions.filter((_, index) => index !== questionIndex)
    );
  };

  const handleCreateQuiz = async () => {
    if (!token) {
      alert("Please login again. Token missing.");
      return;
    }

    if (!quizForm.title.trim()) {
      alert("Please enter quiz title.");
      return;
    }

    if (quizQuestions.length === 0) {
      alert("Please add at least one question before creating quiz.");
      return;
    }

    const selectedSubject = allSubjects.find(
      (subject) => subject.code === quizForm.subjectCode
    );

    const newQuiz = {
      title: quizForm.title.trim(),
      description: quizForm.description.trim(),
      subjectCode: quizForm.subjectCode,
      subjectTitle: selectedSubject?.title || quizForm.subjectCode,
      subjectLevel: selectedSubject?.level || "",
      subjectSemester: selectedSubject?.semester || "",
      questions: quizQuestions,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newQuiz),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create quiz");
        return;
      }

      setQuizzes([data.quiz, ...quizzes]);

      setQuizForm({
        subjectCode: "ITE 1123",
        title: "",
        description: "",
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "0",
      });

      setQuizQuestions([]);

      alert("Quiz created successfully!");
    } catch (error) {
      console.error("Create quiz error:", error);
      alert("Cannot connect to backend server.");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!token) {
      alert("Please login again. Token missing.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to delete quiz");
        return;
      }

      setQuizzes((currentQuizzes) =>
        currentQuizzes.filter((quiz) => quiz._id !== quizId)
      );

      alert("Quiz deleted successfully!");
    } catch (error) {
      console.error("Delete quiz error:", error);
      alert("Cannot connect to backend server.");
    }
  };

  const handleMarkSubmission = async (submissionId, marks) => {
    if (!token) {
      alert("Please login again. Token missing.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/submissions/${submissionId}/mark`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            marks,
            feedback: marks === "Pending" ? "" : `Marked as ${marks}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to mark submission.");
        return;
      }

      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((submission) =>
          submission._id === submissionId ? data.submission : submission
        )
      );

      alert("Submission marked successfully!");
    } catch (error) {
      console.error("Mark submission error:", error);
      alert("Cannot connect to submissions API.");
    }
  };

  const getQuizQuestions = (quiz) => {
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      return quiz.questions;
    }

    if (quiz.question) {
      const options = Array.isArray(quiz.options)
        ? quiz.options
        : [
            quiz.options?.A,
            quiz.options?.B,
            quiz.options?.C,
            quiz.options?.D,
          ].filter(Boolean);

      let correctAnswer = quiz.correctAnswer;

      if (typeof correctAnswer === "string") {
        const map = {
          A: 0,
          B: 1,
          C: 2,
          D: 3,
        };

        correctAnswer =
          map[correctAnswer.toUpperCase()] !== undefined
            ? map[correctAnswer.toUpperCase()]
            : Number(correctAnswer);
      }

      return [
        {
          question: quiz.question,
          options,
          correctAnswer: Number(correctAnswer),
        },
      ];
    }

    return [];
  };

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-3xl p-8 md:p-10 text-white shadow-xl">
          <p className="text-cyan-100 font-bold">👨‍🏫 Teacher Dashboard</p>

          <h1 className="text-4xl md:text-5xl font-black mt-3">
            Welcome, {user.name}
          </h1>

          <p className="text-blue-50 mt-3">
            Email: {user.email} • Role: {user.role}
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            icon="📘"
            title="Total Subjects"
            text={`${allSubjects.length} BIT subjects available`}
          />

          <Card
            icon="🎥"
            title="Created Resources"
            text={`${lessons.length} resources saved in MongoDB`}
          />

          <Card
            icon="🧠"
            title="Created Quizzes"
            text={`${quizzes.length} quizzes saved in MongoDB`}
          />

          <Card
            icon="📝"
            title="Submissions"
            text={
              loadingSubmissions
                ? "Loading submissions..."
                : `${submissions.length} MongoDB student submissions`
            }
          />
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h3 className="text-2xl font-black">Create New Resource</h3>

            <p className="text-slate-500 mt-2 leading-7">
              Add weekly resources. You can paste a link or upload a local file
              such as PDF, image, Word, or PowerPoint.
            </p>

            <form className="mt-6 space-y-5">
              <div>
                <label className="form-label">Subject</label>
                <select
                  name="subjectCode"
                  value={lessonForm.subjectCode}
                  onChange={handleLessonChange}
                  className="form-input"
                >
                  {allSubjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.title} ({subject.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Week / Topic</label>
                <select
                  name="weekTopic"
                  value={lessonForm.weekTopic}
                  onChange={handleLessonChange}
                  className="form-input"
                >
                  <option value="">Select week / topic</option>

                  {selectedLessonSubject?.weeks?.length > 0 ? (
                    selectedLessonSubject.weeks.map((week, index) => (
                      <option key={`${week}-${index}`} value={week}>
                        {week}
                      </option>
                    ))
                  ) : (
                    <option value="General Resource">General Resource</option>
                  )}
                </select>
              </div>

              <div>
                <label className="form-label">Resource Type</label>
                <select
                  name="type"
                  value={lessonForm.type}
                  onChange={handleLessonChange}
                  className="form-input"
                >
                  {lessonTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Resource Title</label>
                <input
                  type="text"
                  name="title"
                  value={lessonForm.title}
                  onChange={handleLessonChange}
                  className="form-input"
                  placeholder="Example: Week 01 Python PDF Notes"
                />
              </div>

              <div>
                <label className="form-label">Resource Mode</label>
                <select
                  name="resourceMode"
                  value={lessonForm.resourceMode}
                  onChange={handleLessonChange}
                  className="form-input"
                >
                  <option value="link">Paste Link</option>
                  <option value="file">Upload Local File</option>
                </select>
              </div>

              {lessonForm.resourceMode === "link" ? (
                <div>
                  <label className="form-label">Resource Link</label>
                  <input
                    type="text"
                    name="resourceUrl"
                    value={lessonForm.resourceUrl}
                    onChange={handleLessonChange}
                    className="form-input"
                    placeholder="YouTube / Google Drive / Moodle / PDF link"
                  />
                </div>
              ) : (
                <div>
                  <label className="form-label">Upload File</label>
                  <input
                    id="resourceFileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="form-input"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                  />

                  {lessonForm.resourceFile && (
                    <p className="text-sm text-slate-500 mt-2">
                      Selected:{" "}
                      <span className="font-bold text-blue-700">
                        {lessonForm.resourceFile.name}
                      </span>
                    </p>
                  )}

                  <p className="text-xs text-slate-400 mt-2">
                    Allowed: PDF, images, Word, PowerPoint. Max size: 10MB.
                  </p>
                </div>
              )}

              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={lessonForm.description}
                  onChange={handleLessonChange}
                  className="form-input min-h-28 resize-none"
                  placeholder="Short resource description..."
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleCreateLesson}
                className="btn-primary w-full"
              >
                Create Resource
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black">Created Resources</h3>
                <p className="text-slate-500 mt-1">
                  Total resources: {lessons.length}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchResources}
                className="btn-outline"
              >
                Refresh
              </button>
            </div>

            {loadingResources ? (
              <EmptyState
                icon="⏳"
                title="Loading resources..."
                text="Fetching resources from MongoDB."
              />
            ) : lessons.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No resources yet"
                text="Create your first resource using the form."
              />
            ) : (
              <div className="mt-8 space-y-5">
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="lesson-card">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                      <div>
                        <p className="text-blue-700 font-black">
                          {lesson.subjectCode} • {lesson.subjectTitle}
                        </p>

                        <p className="text-slate-400 text-sm mt-1">
                          {lesson.subjectLevel} • {lesson.subjectSemester}
                        </p>

                        <p className="mt-3 inline-flex px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 font-black text-sm">
                          {lesson.weekTopic || "General Resource"}
                        </p>

                        <h4 className="text-xl font-black mt-3">
                          {lesson.title}
                        </h4>

                        <p className="text-slate-500 mt-2">
                          {lesson.type} • Created by {lesson.createdBy}
                        </p>

                        {lesson.isUploadedFile && (
                          <p className="text-sm text-green-700 font-bold mt-2">
                            Uploaded File: {lesson.fileName || "File"}
                          </p>
                        )}

                        <p className="text-slate-600 leading-7 mt-3">
                          {lesson.description}
                        </p>

                        <a
                          href={lesson.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex mt-4 font-bold text-blue-700 hover:underline"
                        >
                          {lesson.isUploadedFile
                            ? "Open Uploaded File →"
                            : "Open Resource →"}
                        </a>

                        <p className="text-xs text-slate-400 mt-3">
                          Created at:{" "}
                          {lesson.createdAt
                            ? new Date(lesson.createdAt).toLocaleString()
                            : "Unknown"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h3 className="text-2xl font-black">Create Quiz</h3>

            <p className="text-slate-500 mt-2 leading-7">
              Create one quiz with multiple MCQ questions. Students can attempt
              this quiz from the subject page.
            </p>

            <form className="mt-6 space-y-5">
              <div>
                <label className="form-label">Subject</label>
                <select
                  name="subjectCode"
                  value={quizForm.subjectCode}
                  onChange={handleQuizChange}
                  className="form-input"
                >
                  {allSubjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.title} ({subject.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="font-black text-blue-700">
                  Selected Subject: {selectedQuizSubject?.title}
                </p>
                <p className="text-slate-500 mt-1">
                  {selectedQuizSubject?.level} • {selectedQuizSubject?.semester}
                </p>
              </div>

              <div>
                <label className="form-label">Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  value={quizForm.title}
                  onChange={handleQuizChange}
                  className="form-input"
                  placeholder="Example: HTML Basics Quiz"
                />
              </div>

              <div>
                <label className="form-label">Quiz Description</label>
                <textarea
                  name="description"
                  value={quizForm.description}
                  onChange={handleQuizChange}
                  className="form-input min-h-20 resize-none"
                  placeholder="Short quiz description..."
                ></textarea>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h4 className="font-black text-slate-800">
                  Add Question to Quiz
                </h4>
                <p className="text-slate-500 mt-1 text-sm">
                  Add one question at a time, then click Create Quiz.
                </p>
              </div>

              <div>
                <label className="form-label">Question</label>
                <textarea
                  name="question"
                  value={quizForm.question}
                  onChange={handleQuizChange}
                  className="form-input min-h-24 resize-none"
                  placeholder="Example: What is HTML?"
                ></textarea>
              </div>

              <div>
                <label className="form-label">Option A</label>
                <input
                  type="text"
                  name="optionA"
                  value={quizForm.optionA}
                  onChange={handleQuizChange}
                  className="form-input"
                  placeholder="Option A"
                />
              </div>

              <div>
                <label className="form-label">Option B</label>
                <input
                  type="text"
                  name="optionB"
                  value={quizForm.optionB}
                  onChange={handleQuizChange}
                  className="form-input"
                  placeholder="Option B"
                />
              </div>

              <div>
                <label className="form-label">Option C</label>
                <input
                  type="text"
                  name="optionC"
                  value={quizForm.optionC}
                  onChange={handleQuizChange}
                  className="form-input"
                  placeholder="Option C"
                />
              </div>

              <div>
                <label className="form-label">Option D</label>
                <input
                  type="text"
                  name="optionD"
                  value={quizForm.optionD}
                  onChange={handleQuizChange}
                  className="form-input"
                  placeholder="Option D"
                />
              </div>

              <div>
                <label className="form-label">Correct Answer</label>
                <select
                  name="correctAnswer"
                  value={quizForm.correctAnswer}
                  onChange={handleQuizChange}
                  className="form-input"
                >
                  <option value="0">Option A</option>
                  <option value="1">Option B</option>
                  <option value="2">Option C</option>
                  <option value="3">Option D</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddQuestionToQuiz}
                className="btn-outline w-full"
              >
                Add Question
              </button>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="font-black text-slate-700">
                  Added Questions: {quizQuestions.length}
                </p>

                {quizQuestions.length === 0 ? (
                  <p className="text-slate-500 text-sm mt-2">
                    No questions added yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {quizQuestions.map((question, index) => (
                      <div
                        key={`${question.question}-${index}`}
                        className="p-3 rounded-2xl bg-white border border-slate-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-800">
                              {index + 1}. {question.question}
                            </p>
                            <p className="text-green-700 font-bold text-sm mt-1">
                              Correct: Option{" "}
                              {["A", "B", "C", "D"][question.correctAnswer]}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionFromQuiz(index)}
                            className="text-red-600 font-bold text-sm hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCreateQuiz}
                className="btn-primary w-full"
              >
                Create Quiz
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black">Created Quizzes</h3>
                <p className="text-slate-500 mt-1">
                  Total quizzes: {quizzes.length}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchQuizzes}
                className="btn-outline"
              >
                Refresh
              </button>
            </div>

            {loadingQuizzes ? (
              <EmptyState
                icon="⏳"
                title="Loading quizzes..."
                text="Fetching quizzes from MongoDB."
              />
            ) : quizzes.length === 0 ? (
              <EmptyState
                icon="🧠"
                title="No quizzes yet"
                text="Create your first quiz using the form."
              />
            ) : (
              <div className="mt-8 space-y-5">
                {quizzes.map((quiz) => {
                  const questions = getQuizQuestions(quiz);

                  return (
                    <div key={quiz._id} className="lesson-card">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="w-full">
                          <p className="text-blue-700 font-black">
                            {quiz.subjectCode} • {quiz.subjectTitle}
                          </p>

                          <p className="text-slate-400 text-sm mt-1">
                            {quiz.subjectLevel} • {quiz.subjectSemester}
                          </p>

                          <h4 className="text-xl font-black mt-2">
                            {quiz.title || "Untitled Quiz"}
                          </h4>

                          <p className="text-slate-500 mt-1">
                            {quiz.description || "No description"}
                          </p>

                          <p className="mt-4 inline-flex px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-black text-sm">
                            {questions.length} Questions
                          </p>

                          <div className="mt-5 space-y-5">
                            {questions.map((question, questionIndex) => (
                              <div
                                key={`${question.question}-${questionIndex}`}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-200"
                              >
                                <h5 className="font-black text-slate-800">
                                  {questionIndex + 1}. {question.question}
                                </h5>

                                <div className="mt-4 grid md:grid-cols-2 gap-3">
                                  {question.options?.map((option, optionIndex) => (
                                    <Option
                                      key={`${option}-${optionIndex}`}
                                      label={["A", "B", "C", "D"][optionIndex]}
                                      text={option}
                                    />
                                  ))}
                                </div>

                                <p className="mt-4 text-green-700 font-black">
                                  Correct Answer: Option{" "}
                                  {
                                    ["A", "B", "C", "D"][
                                      Number(question.correctAnswer)
                                    ]
                                  }
                                </p>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-slate-400 mt-3">
                            Created by {quiz.createdBy || "Unknown"} •{" "}
                            {quiz.createdAt
                              ? new Date(quiz.createdAt).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black">Student Submissions</h3>
              <p className="text-slate-500 mt-1">
                Total submissions: {submissions.length}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchSubmissions}
                className="btn-outline"
              >
                Refresh
              </button>

              <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 font-black">
                MongoDB
              </span>
            </div>
          </div>

          {loadingSubmissions ? (
            <EmptyState
              icon="⏳"
              title="Loading submissions..."
              text="Fetching student submissions from MongoDB."
            />
          ) : submissions.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No submissions yet"
              text="Student assignment submissions will appear here."
            />
          ) : (
            <div className="mt-8 space-y-5">
              {submissions.map((submission) => (
                <div key={submission._id} className="lesson-card">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <p className="text-blue-700 font-black">
                        {submission.subjectCode} • {submission.subjectTitle}
                      </p>

                      <h4 className="text-xl font-black mt-2">
                        {submission.title}
                      </h4>

                      <p className="text-slate-500 mt-2">
                        Student: {submission.studentName} • Status:{" "}
                        {submission.status || "Submitted"}
                      </p>

                      {submission.studentEmail && (
                        <p className="text-slate-400 text-sm mt-1">
                          Email: {submission.studentEmail}
                        </p>
                      )}

                      {submission.note && (
                        <p className="text-slate-600 leading-7 mt-3">
                          {submission.note}
                        </p>
                      )}

                      {submission.feedback && (
                        <p className="text-green-700 font-bold mt-3">
                          Feedback: {submission.feedback}
                        </p>
                      )}

                      {submission.submissionLink && (
                        <a
                          href={submission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex mt-4 font-bold text-blue-700 hover:underline"
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

                    <div className="min-w-48">
                      <label className="form-label">Marks</label>

                      <select
                        className="form-input"
                        value={submission.marks || "Pending"}
                        onChange={(event) =>
                          handleMarkSubmission(
                            submission._id,
                            event.target.value
                          )
                        }
                      >
                        <option>Pending</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Average</option>
                        <option>Need Improvement</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="feature-card text-left">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-xl font-black mt-5">{title}</h3>
      <p className="text-slate-500 mt-3">{text}</p>
    </div>
  );
}

function Option({ label, text }) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-slate-200">
      <p className="font-bold text-slate-700">
        {label}. {text}
      </p>
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

export default TeacherDashboard;
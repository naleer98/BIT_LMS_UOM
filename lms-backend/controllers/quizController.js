const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      subjectCode,
      subjectTitle,
      subjectLevel,
      subjectSemester,
      question,
      questions,
      options,
      correctAnswer,
    } = req.body;

    if (!subjectCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide subject code",
      });
    }

    let quizData = {
      subjectCode,
      subjectTitle: subjectTitle || subjectCode,
      subjectLevel: subjectLevel || "",
      subjectSemester: subjectSemester || "",
      createdBy: req.user?.name || "Admin",
      createdByEmail: req.user?.email || "",
    };

    // New format: full quiz with many questions
    if (Array.isArray(questions) && questions.length > 0) {
      quizData = {
        ...quizData,
        title: title || "Untitled Quiz",
        description: description || "",
        questions,
      };
    }
    // Old format: single question
    else if (question && options && correctAnswer !== undefined) {
      let finalOptions = [];

      if (Array.isArray(options)) {
        finalOptions = options;
      } else {
        finalOptions = [options.A, options.B, options.C, options.D].filter(
          Boolean
        );
      }

      let finalCorrectAnswer = correctAnswer;

      if (typeof correctAnswer === "string") {
        const answerMap = {
          A: 0,
          B: 1,
          C: 2,
          D: 3,
        };

        finalCorrectAnswer =
          answerMap[correctAnswer.toUpperCase()] !== undefined
            ? answerMap[correctAnswer.toUpperCase()]
            : Number(correctAnswer);
      }

      quizData = {
        ...quizData,
        title: title || `${subjectCode} Quiz`,
        description: description || "",
        questions: [
          {
            question,
            options: finalOptions,
            correctAnswer: Number(finalCorrectAnswer),
          },
        ],
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Please fill all quiz fields",
      });
    }

    const quiz = await Quiz.create(quizData);

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating quiz",
      error: error.message,
    });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quizzes",
      error: error.message,
    });
  }
};

const getQuizzesBySubject = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const realCode = subjectCode.replaceAll("-", " ");

    const quizzes = await Quiz.find({ subjectCode: realCode }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get subject quizzes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching subject quizzes",
      error: error.message,
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await quiz.deleteOne();

    return res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting quiz",
      error: error.message,
    });
  }
};

const submitQuizResult = async (req, res) => {
  try {
    const {
      quizId,
      quizTitle,
      subjectCode,
      subjectTitle,
      studentId,
      studentName,
      studentEmail,
      score,
      correctAnswers,
      totalQuestions,
      percentage,
      answers,
    } = req.body;

    if (!quizId || !subjectCode || totalQuestions === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide quiz result details",
      });
    }

    const finalScore =
      score !== undefined ? Number(score) : Number(correctAnswers || 0);

    const finalTotalQuestions = Number(totalQuestions || 0);

    const finalPercentage =
      percentage !== undefined
        ? Number(percentage)
        : finalTotalQuestions > 0
        ? Math.round((finalScore / finalTotalQuestions) * 100)
        : 0;

    const result = await QuizResult.create({
      quizId,
      quizTitle: quizTitle || "Untitled Quiz",

      studentId:
        req.user?._id ||
        req.user?.id ||
        studentId ||
        req.user?.email ||
        studentEmail ||
        "unknown-student",

      studentName: req.user?.name || studentName || "Student",
      studentEmail: req.user?.email || studentEmail || "",

      subjectCode,
      subjectTitle: subjectTitle || subjectCode,

      score: finalScore,
      correctAnswers: finalScore,
      totalQuestions: finalTotalQuestions,
      percentage: finalPercentage,

      answers: Array.isArray(answers) ? answers : [],

      status: finalPercentage >= 50 ? "Passed" : "Failed",
    });

    return res.status(201).json({
      success: true,
      message: "Quiz result saved successfully",
      result,
    });
  } catch (error) {
    console.error("Submit quiz result error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while saving quiz result",
      error: error.message,
    });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Get quiz results error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quiz results",
      error: error.message,
    });
  }
};

const getMyQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({
      studentEmail: req.user.email,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Get my quiz results error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching my quiz results",
      error: error.message,
    });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizzesBySubject,
  deleteQuiz,
  submitQuizResult,
  getQuizResults,
  getMyQuizResults,
};
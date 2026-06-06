const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },

    quizTitle: {
      type: String,
      default: "Untitled Quiz",
    },

    studentId: {
      type: String,
      default: "unknown-student",
    },

    studentName: {
      type: String,
      default: "Student",
    },

    studentEmail: {
      type: String,
      default: "",
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },

    subjectTitle: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Passed", "Failed"],
      default: "Failed",
    },

    answers: [
      {
        questionIndex: Number,
        questionText: String,
        selectedAnswer: Number,
        correctAnswer: Number,
        selectedOptionText: String,
        correctOptionText: String,
        isCorrect: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
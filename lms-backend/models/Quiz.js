const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },

    subjectTitle: {
      type: String,
      required: true,
      trim: true,
    },

    subjectLevel: {
      type: String,
      default: "",
    },

    subjectSemester: {
      type: String,
      default: "",
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      A: {
        type: String,
        required: true,
        trim: true,
      },
      B: {
        type: String,
        required: true,
        trim: true,
      },
      C: {
        type: String,
        required: true,
        trim: true,
      },
      D: {
        type: String,
        required: true,
        trim: true,
      },
    },

    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    createdByEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);
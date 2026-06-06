const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      default: "",
    },

    studentName: {
      type: String,
      required: true,
    },

    studentEmail: {
      type: String,
      required: true,
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },

    subjectTitle: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    submissionLink: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Submitted", "Marked"],
      default: "Submitted",
    },

    marks: {
      type: String,
      default: "Pending",
    },

    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
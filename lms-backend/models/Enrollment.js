const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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

    subjectLevel: {
      type: String,
      default: "",
    },

    subjectSemester: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index(
  { studentEmail: 1, subjectCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
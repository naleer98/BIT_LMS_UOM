const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
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
      trim: true,
    },

    subjectSemester: {
      type: String,
      default: "",
      trim: true,
    },

    weekTopic: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    resourceUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    fileType: {
      type: String,
      default: "",
      trim: true,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    isUploadedFile: {
      type: Boolean,
      default: false,
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    cloudinaryResourceType: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    createdByEmail: {
      type: String,
      required: true,
      trim: true,
    },

    createdByRole: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
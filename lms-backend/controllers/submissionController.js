const Submission = require("../models/Submission");

const createSubmission = async (req, res) => {
  try {
    const { subjectCode, subjectTitle, title, note, submissionLink } = req.body;

    if (!subjectCode || !subjectTitle || !title) {
      return res.status(400).json({
        success: false,
        message: "Please provide submission details",
      });
    }

    const submission = await Submission.create({
      studentId: req.user._id || req.user.id || req.user.email,
      studentName: req.user.name,
      studentEmail: req.user.email,
      subjectCode,
      subjectTitle,
      title,
      note,
      submissionLink,
      status: "Submitted",
      marks: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Submission created successfully",
      submission,
    });
  } catch (error) {
    console.error("Create submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating submission",
      error: error.message,
    });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
      error: error.message,
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      studentEmail: req.user.email,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get my submissions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching my submissions",
      error: error.message,
    });
  }
};

const markSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    submission.marks = marks || submission.marks;
    submission.feedback = feedback || submission.feedback;
    submission.status = "Marked";

    await submission.save();

    return res.json({
      success: true,
      message: "Submission marked successfully",
      submission,
    });
  } catch (error) {
    console.error("Mark submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while marking submission",
      error: error.message,
    });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    await submission.deleteOne();

    return res.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting submission",
      error: error.message,
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getMySubmissions,
  markSubmission,
  deleteSubmission,
};
const Enrollment = require("../models/Enrollment");

const createEnrollment = async (req, res) => {
  try {
    const { subjectCode, subjectTitle, subjectLevel, subjectSemester } =
      req.body;

    if (!subjectCode || !subjectTitle) {
      return res.status(400).json({
        success: false,
        message: "Please provide enrollment details",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      studentEmail: req.user.email,
      subjectCode,
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled",
        enrollment: existingEnrollment,
      });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id || req.user.id || req.user.email,
      studentName: req.user.name,
      studentEmail: req.user.email,
      subjectCode,
      subjectTitle,
      subjectLevel,
      subjectSemester,
    });

    return res.status(201).json({
      success: true,
      message: "Enrollment saved successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Create enrollment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while saving enrollment",
      error: error.message,
    });
  }
};

const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching enrollments",
      error: error.message,
    });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      studentEmail: req.user.email,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Get my enrollments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching my enrollments",
      error: error.message,
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    await enrollment.deleteOne();

    return res.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Delete enrollment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting enrollment",
      error: error.message,
    });
  }
};

module.exports = {
  createEnrollment,
  getEnrollments,
  getMyEnrollments,
  deleteEnrollment,
};
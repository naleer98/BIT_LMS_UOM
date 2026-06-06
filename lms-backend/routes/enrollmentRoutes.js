const express = require("express");

const {
  createEnrollment,
  getEnrollments,
  getMyEnrollments,
  deleteEnrollment,
} = require("../controllers/enrollmentController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, allowRoles("student"), createEnrollment);

router.get("/", protect, allowRoles("admin"), getEnrollments);

router.get("/me", protect, allowRoles("student"), getMyEnrollments);

router.delete("/:id", protect, allowRoles("admin"), deleteEnrollment);

module.exports = router;
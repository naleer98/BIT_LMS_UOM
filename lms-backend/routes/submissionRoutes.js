const express = require("express");

const {
  createSubmission,
  getSubmissions,
  getMySubmissions,
  markSubmission,
  deleteSubmission,
} = require("../controllers/submissionController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, allowRoles("student"), createSubmission);

router.get("/", protect, allowRoles("teacher", "admin"), getSubmissions);

router.get("/me", protect, allowRoles("student"), getMySubmissions);

router.put(
  "/:id/mark",
  protect,
  allowRoles("teacher", "admin"),
  markSubmission
);

router.delete("/:id", protect, allowRoles("teacher", "admin"), deleteSubmission);

module.exports = router;
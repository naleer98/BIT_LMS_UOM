const express = require("express");

const {
  createQuiz,
  getQuizzes,
  getQuizzesBySubject,
  deleteQuiz,
  submitQuizResult,
  getQuizResults,
  getMyQuizResults,
} = require("../controllers/quizController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getQuizzes);
router.get("/subject/:subjectCode", getQuizzesBySubject);

router.post("/", protect, allowRoles("teacher", "admin"), createQuiz);

router.delete("/:id", protect, allowRoles("teacher", "admin"), deleteQuiz);

router.post("/results", protect, allowRoles("student"), submitQuizResult);

router.get(
  "/results/all",
  protect,
  allowRoles("teacher", "admin"),
  getQuizResults
);

router.get("/results/me", protect, allowRoles("student"), getMyQuizResults);

module.exports = router;
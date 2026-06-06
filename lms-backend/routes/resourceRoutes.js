const express = require("express");
const {
  getResources,
  createResource,
  uploadResource,
  getResourcesBySubject,
  deleteResource,
} = require("../controllers/resourceController");

const { protect, allowRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getResources);
router.get("/subject/:subjectCode", getResourcesBySubject);

router.post("/", protect, allowRoles("teacher", "admin"), createResource);

router.post(
  "/upload",
  protect,
  allowRoles("teacher", "admin"),
  upload.single("resourceFile"),
  uploadResource
);

router.delete("/:id", protect, allowRoles("teacher", "admin"), deleteResource);

module.exports = router;
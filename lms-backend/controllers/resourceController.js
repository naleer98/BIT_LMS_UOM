const Resource = require("../models/Resource");
const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const safeFileName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "bit-lms/resources",
        resource_type: "auto",
        public_id: `${Date.now()}-${safeFileName}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const createResource = async (req, res) => {
  try {
    const {
      subjectCode,
      subjectTitle,
      subjectLevel,
      subjectSemester,
      weekTopic,
      title,
      type,
      resourceUrl,
      description,
    } = req.body;

    if (
      !subjectCode ||
      !subjectTitle ||
      !weekTopic ||
      !title ||
      !type ||
      !resourceUrl ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required resource fields",
      });
    }

    const resource = await Resource.create({
      subjectCode: subjectCode.trim(),
      subjectTitle: subjectTitle.trim(),
      subjectLevel: subjectLevel || "",
      subjectSemester: subjectSemester || "",
      weekTopic: weekTopic.trim(),
      title: title.trim(),
      type: type.trim(),
      resourceUrl: resourceUrl.trim(),
      description: description.trim(),
      isUploadedFile: false,
      createdBy: req.user.name,
      createdByEmail: req.user.email,
      createdByRole: req.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    console.error("Create resource error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating resource",
    });
  }
};

const uploadResource = async (req, res) => {
  try {
    const {
      subjectCode,
      subjectTitle,
      subjectLevel,
      subjectSemester,
      weekTopic,
      title,
      type,
      description,
    } = req.body;

    if (
      !subjectCode ||
      !subjectTitle ||
      !weekTopic ||
      !title ||
      !type ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required resource fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const uploadedFile = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const resource = await Resource.create({
      subjectCode: subjectCode.trim(),
      subjectTitle: subjectTitle.trim(),
      subjectLevel: subjectLevel || "",
      subjectSemester: subjectSemester || "",
      weekTopic: weekTopic.trim(),
      title: title.trim(),
      type: type.trim(),
      resourceUrl: uploadedFile.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      isUploadedFile: true,
      cloudinaryPublicId: uploadedFile.public_id,
      cloudinaryResourceType: uploadedFile.resource_type || "raw",
      description: description.trim(),
      createdBy: req.user.name,
      createdByEmail: req.user.email,
      createdByRole: req.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "File resource uploaded successfully",
      resource,
    });
  } catch (error) {
    console.error("Upload resource error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error while uploading resource",
    });
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Get resources error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching resources",
    });
  }
};

const getResourcesBySubject = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const realCode = subjectCode.replaceAll("-", " ");

    const resources = await Resource.find({
      subjectCode: realCode,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Get subject resources error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching subject resources",
    });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (resource.isUploadedFile && resource.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
          resource_type: resource.cloudinaryResourceType || "raw",
        });
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary delete warning:",
          cloudinaryError.message
        );
      }
    }

    await resource.deleteOne();

    return res.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete resource error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting resource",
    });
  }
};

module.exports = {
  createResource,
  uploadResource,
  getResources,
  getResourcesBySubject,
  deleteResource,
};
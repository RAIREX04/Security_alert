const { success } = require('../utils/api-response');
const { buildFileUrl } = require('../services/upload.service');

function uploadSingle(kind) {
  return async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan',
      });
    }

    return success(res, {
      fileName: req.file.filename,
      fileUrl: buildFileUrl(req, req.file),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      kind,
    }, 'Upload berhasil', 201);
  };
}

module.exports = {
  uploadProfilePhoto: uploadSingle('profile_photo'),
  uploadReportPhoto: uploadSingle('report_photo'),
  uploadReportCompletionPhoto: uploadSingle('completion_photo'),
};

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function buildFileUrl(req, file) {
  const configuredBase = process.env.PUBLIC_ASSET_BASE_URL?.trim();
  const forwardedProto = (req.get('x-forwarded-proto') || '').split(',')[0].trim();
  const forwardedHost = (req.get('x-forwarded-host') || '').split(',')[0].trim();
  const host = forwardedHost || req.get('host');
  const protocol = forwardedProto || req.protocol;
  const requestBase = `${protocol}://${host}/uploads`;
  const base = configuredBase || requestBase;

  return `${base.replace(/\/+$/, '')}/${file.filename}`;
}

module.exports = { upload, buildFileUrl, uploadDir };

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'leadnurse/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: (req) => `avatar_${req.user.id}_${Date.now()}`,
  },
});

const complianceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'leadnurse/compliance',
    resource_type: 'auto',
    public_id: (req) => `compliance_${req.params.id || req.user.id}_${Date.now()}`,
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for avatars'));
    }
    cb(null, true);
  },
});

const documentUpload = multer({
  storage: complianceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only images and PDF files are allowed for compliance documents'));
    }
    cb(null, true);
  },
});

module.exports = { avatarUpload, documentUpload };

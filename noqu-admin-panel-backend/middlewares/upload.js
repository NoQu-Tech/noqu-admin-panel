const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for Multer to upload files directly to public_html/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the absolute path to public_html/uploads
    const uploadPath = path.join(__dirname, '../../public_html/uploads');
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp and fieldname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`; // Random string for uniqueness
    const extension = path.extname(file.originalname); // Keep original file extension
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`); // Example: sections[][image]-1234567890.png
  },
  
});

// Multer configuration for specific use cases

// 1. Upload single file for 'thumbnail'
const uploadThumbnail = multer({ storage }).single('thumbnail');

// 2. Upload multiple files for 'sections[][image]'
const uploadSections = multer({ storage }).array('sections[][image]', 10);

// 3. Upload multiple fields (both thumbnail and section images)
const uploadFields = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, and .jpeg formats are allowed!'), false);
    }
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'sections[][image]', maxCount: 10 },
]);

const uploadEditNews = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, and .jpeg formats are allowed!'), false);
    }
  }
}).any(); // Accepts all fields — you'll filter by name in your controller

const agreementStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/home/noqu/agreements/CP-Agreements';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cpId = req.body.cpId;
    const ext = path.extname(file.originalname);
    const fullName = (req.body.full_name || 'user').replace(/\s+/g, '-');
    const company = (req.body.company_name || 'company').replace(/\s+/g, '-');
    const timestamp = Date.now();
    const filename = `${cpId}_${company}_${fullName}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

const uploadAgreement = multer({
  storage: agreementStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  }
}).fields([
  { name: 'agreement', maxCount: 1 },
  { name: 'cpId', maxCount: 1 },
  { name: 'full_name', maxCount: 1 },
  { name: 'company_name', maxCount: 1 },
]);

// Export the configured middlewares
module.exports = {
  uploadThumbnail,
  uploadSections,
  uploadFields,
  uploadEditNews,
  uploadAgreement,
};

const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

let jobs = [];
let applications = [];

// Middleware auth
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.post('/upload', authenticateToken, (req, res) => {
  const { title, description, location, company } = req.body;
  const newJob = { id: jobs.length + 1, title, description, location, company };
  jobs.push(newJob);
  res.status(201).json({ message: 'Job berhasil ditambahkan.', job: newJob });
});

router.post('/apply', upload.single('resume'), (req, res) => {
  const { jobId, name, email } = req.body;
  const resumePath = req.file ? req.file.path : null;
  if (!jobId || !name || !email || !resumePath) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }
  const application = { id: applications.length + 1, jobId, name, email, resumePath };
  applications.push(application);
  res.status(201).json({ message: 'Lamaran berhasil dikirim.', application });
});

router.get('/all', authenticateToken, (req, res) => {
  res.json({ jobs });
});

router.get('/applications', authenticateToken, (req, res) => {
  res.json({ applications });
});

module.exports = router;

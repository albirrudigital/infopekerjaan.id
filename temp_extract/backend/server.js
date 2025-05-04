require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const jobRoutes = require('./src/routes/jobRoutes');
const authRoutes = require('./src/routes/authRoutes');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Backend API InfoPekerjaan with Admin Login running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Serve static files from the current directory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));
// Serve uploaded MP3s
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cloudinary Configuration
// It automatically picks up CLOUDINARY_URL from the .env file!

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mp3_player_uploads', // The folder in your Cloudinary account
        resource_type: 'video', // Cloudinary uses 'video' for all audio and video files
        allowed_formats: ['mp3', 'wav', 'ogg', 'mpeg']
    }
});

const upload = multer({ storage: storage });

// In-memory array to simulate a database. 
// For a production app, use SQLite or MongoDB.
let savedPlaylist = [];

// API: Get the current playlist
app.get('/api/playlist', (req, res) => {
    res.json(savedPlaylist);
});

// API: Upload MP3 files
app.post('/api/upload', upload.array('files'), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const newSongs = req.files.map(file => ({
            id: file.filename, // Cloudinary public_id
            name: file.originalname,
            url: file.path // Cloudinary URL
        }));

        // Add to our "database"
        savedPlaylist = [...savedPlaylist, ...newSongs];

        res.json({ message: 'Upload successful', songs: newSongs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('You can now upload and play MP3 files persistently!');
});

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Serve static files from the current directory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));
// Serve uploaded MP3s
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Replace spaces with underscores to avoid URL issues
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.mp3')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

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
            id: file.filename,
            name: file.originalname,
            url: `/uploads/${file.filename}`
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

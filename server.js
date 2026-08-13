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
// It automatically picks up CLOUDINARY_URL from the .env file if available.
// Explicitly initialize config to ensure environment variables are read.
cloudinary.config(true);

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mp3_player_uploads', // The folder in your Cloudinary account
        resource_type: 'video', // Cloudinary uses 'video' for all audio and video files
        allowed_formats: ['mp3', 'wav', 'ogg', 'mpeg'],
        // Use the original filename (without extension) as the Cloudinary public_id
        public_id: (req, file) => file.originalname.split('.').slice(0, -1).join('.')
    }
});

const upload = multer({ storage: storage });

// API: Get the current playlist
app.get('/api/playlist', async (req, res) => {
    try {
        // Fetch list of files directly from Cloudinary
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'mp3_player_uploads/',
            resource_type: 'video', // Cloudinary classifies audio as 'video'
            max_results: 100 // Adjust if you have more than 100 songs
        });

        // Map Cloudinary results to the format the frontend expects
        const songs = result.resources.map(file => ({
            id: file.public_id,
            name: file.filename, // Note: existing files will have random names
            url: file.secure_url
        }));

        res.json(songs);
    } catch (error) {
        console.error('Error fetching from Cloudinary:', error);
        res.status(500).json({ error: 'Failed to fetch playlist from Cloudinary' });
    }
});

// API: Upload MP3 files
app.post('/api/upload', (req, res) => {
    upload.array('files')(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            // Return JSON error response instead of Express's default HTML
            return res.status(500).json({ error: err.message || 'File upload failed.' });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const newSongs = req.files.map(file => ({
                id: file.filename, // Cloudinary public_id
                name: file.originalname,
                url: file.path // Cloudinary URL
            }));

            res.json({ message: 'Upload successful', songs: newSongs });
        } catch (error) {
            console.error('Error processing upload:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('You can now upload and play MP3 files persistently!');
});

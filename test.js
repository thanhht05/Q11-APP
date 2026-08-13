const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
cloudinary.config(true);

const app = express();
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mp3_player_uploads',
        resource_type: 'video'
    }
});

const upload = multer({ storage: storage });

app.post('/test', (req, res, next) => {
  upload.array('files')(req, res, (err) => {
    if (err) {
      console.error('MULTER ERROR:', err);
      return res.status(500).json({ error: err.message || err });
    }
    res.json({ message: 'Success' });
  });
});

const server = app.listen(3001, () => {
  const { exec } = require('child_process');
  exec('curl.exe -X POST http://localhost:3001/test -F "files=@test.mp3;type=audio/mpeg"', (err, stdout, stderr) => {
    console.log(stdout);
    server.close();
    process.exit(0);
  });
});

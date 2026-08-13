// UI Elements
const fileInput = document.getElementById('fileInput');
const fileBtn = document.getElementById('fileBtn');
const songTitle = document.getElementById('songTitle');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const progressBar = document.getElementById('progressBar');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const volumeBar = document.getElementById('volumeBar');
const muteBtn = document.getElementById('muteBtn');
const playlistEl = document.getElementById('playlist');
const playlistCount = document.getElementById('playlistCount');

// State
let playlist = []; // Array of File objects
let currentSongIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0: Off, 1: Repeat One, 2: Repeat Playlist

// Audio Object
const audio = new Audio();

// --- Event Listeners ---

// File Selection
fileBtn.addEventListener('click', () => fileInput.click());

async function handleFiles(newFiles) {
    const validFiles = newFiles.filter(file => file.type.startsWith('audio/') || file.name.endsWith('.mp3'));
    if (validFiles.length === 0) return;

    // Show uploading state (simple implementation)
    const originalText = songTitle.textContent;
    songTitle.textContent = "Uploading...";

    const formData = new FormData();
    validFiles.forEach(file => formData.append('files', file));

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        
        // Add new songs to playlist
        playlist = [...playlist, ...data.songs];
        updatePlaylistUI();
        
        // If this is the first upload and nothing is playing, load the first new song
        if (currentSongIndex === -1 && playlist.length > 0) {
            loadSong(0);
        } else {
            songTitle.textContent = originalText;
        }
    } catch (error) {
        console.error('Error uploading:', error);
        songTitle.textContent = "Upload Error!";
        setTimeout(() => songTitle.textContent = originalText, 3000);
    }
}

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    handleFiles(files);
});

// Drag and Drop support
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.classList.add('drag-active');
});

document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    document.body.classList.remove('drag-active');
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    document.body.classList.remove('drag-active');
    
    if (e.dataTransfer.items) {
        const files = [];
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === 'file') {
                const file = e.dataTransfer.items[i].getAsFile();
                files.push(file);
            }
        }
        handleFiles(files);
    } else {
        handleFiles(Array.from(e.dataTransfer.files));
    }
});

// Controls
playPauseBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

repeatBtn.addEventListener('click', toggleRepeat);
shuffleBtn.addEventListener('click', toggleShuffle);

// Progress Bar
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(audio.duration);
    progressBar.max = audio.duration;
});

progressBar.addEventListener('input', (e) => {
    if (playlist.length === 0) return;
    const seekTime = e.target.value;
    audio.currentTime = seekTime;
    currentTimeEl.textContent = formatTime(seekTime);
});

// Volume
volumeBar.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    audio.volume = vol;
    updateMuteIcon(vol);
});

muteBtn.addEventListener('click', () => {
    if (audio.volume > 0) {
        audio.dataset.savedVolume = audio.volume;
        audio.volume = 0;
        volumeBar.value = 0;
    } else {
        const savedVol = audio.dataset.savedVolume || 1;
        audio.volume = savedVol;
        volumeBar.value = savedVol * 100;
    }
    updateMuteIcon(audio.volume);
});

// Audio Ended Event
audio.addEventListener('ended', handleSongEnded);

// --- Functions ---

function loadSong(index) {
    if (index < 0 || index >= playlist.length) return;
    currentSongIndex = index;
    
    const song = playlist[currentSongIndex];
    
    audio.src = song.url;
    songTitle.textContent = song.name;
    
    updatePlaylistActiveItem();
}

function playSong() {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    audio.pause();
}

function playNext() {
    if (playlist.length === 0) return;
    
    if (isShuffle) {
        let nextIndex = currentSongIndex;
        while (nextIndex === currentSongIndex && playlist.length > 1) {
            nextIndex = Math.floor(Math.random() * playlist.length);
        }
        loadSong(nextIndex);
    } else {
        let nextIndex = currentSongIndex + 1;
        if (nextIndex >= playlist.length) {
            nextIndex = 0; // Wrap around
        }
        loadSong(nextIndex);
    }
    if (isPlaying) playSong();
}

function playPrev() {
    if (playlist.length === 0) return;
    
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) {
        prevIndex = playlist.length - 1;
    }
    loadSong(prevIndex);
    if (isPlaying) playSong();
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    
    // Update UI
    if (repeatMode === 0) {
        repeatBtn.classList.remove('active');
        repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
    } else if (repeatMode === 1) {
        repeatBtn.classList.add('active');
        repeatBtn.innerHTML = '<i class="fas fa-repeat"></i><span style="position:absolute; font-size: 8px; margin-top: 2px;">1</span>';
    } else {
        repeatBtn.classList.add('active');
        repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    if (isShuffle) {
        shuffleBtn.classList.add('active');
    } else {
        shuffleBtn.classList.remove('active');
    }
}

function handleSongEnded() {
    if (repeatMode === 1) {
        // Repeat One
        audio.currentTime = 0;
        playSong();
    } else if (isShuffle) {
        // Shuffle
        playNext();
    } else if (repeatMode === 0) {
        // Repeat Off
        if (currentSongIndex < playlist.length - 1) {
            playNext();
        } else {
            // End of playlist
            pauseSong();
            audio.currentTime = 0;
            updateProgress();
        }
    } else if (repeatMode === 2) {
        // Repeat Playlist
        playNext();
    }
}

function updateProgress() {
    const { currentTime, duration } = audio;
    if (isNaN(duration)) return;
    
    progressBar.value = currentTime;
    currentTimeEl.textContent = formatTime(currentTime);
    
    // Gradient effect on slider
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.background = `linear-gradient(to right, var(--slider-thumb) ${progressPercent}%, var(--slider-track) ${progressPercent}%)`;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateMuteIcon(vol) {
    if (vol === 0) {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (vol < 0.5) {
        muteBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    
    // Gradient effect on volume slider
    volumeBar.style.background = `linear-gradient(to right, var(--slider-thumb) ${vol * 100}%, var(--slider-track) ${vol * 100}%)`;
}

function updatePlaylistUI() {
    playlistCount.textContent = playlist.length;
    
    if (playlist.length === 0) {
        playlistEl.innerHTML = '<li class="empty-state">No files selected. Click \'Open\' to add MP3 files.</li>';
        return;
    }
    
    playlistEl.innerHTML = '';
    playlist.forEach((file, index) => {
        const li = document.createElement('li');
        if (index === currentSongIndex) li.classList.add('playing');
        
        li.innerHTML = `
            <span class="song-idx">${index + 1}</span>
            <span class="song-name" title="${file.name}">${file.name}</span>
            ${index === currentSongIndex && isPlaying ? '<i class="fas fa-volume-up" style="color: var(--primary-color); font-size: 0.8rem;"></i>' : ''}
        `;
        
        li.addEventListener('click', () => {
            loadSong(index);
            playSong();
        });
        
        playlistEl.appendChild(li);
    });
}

function updatePlaylistActiveItem() {
    updatePlaylistUI(); // Re-render to update classes and icons
}

// Initialize volume slider gradient
volumeBar.style.background = `linear-gradient(to right, var(--slider-thumb) 100%, var(--slider-track) 100%)`;

// Fetch existing playlist on load
async function fetchPlaylist() {
    try {
        const response = await fetch('/api/playlist');
        if (response.ok) {
            playlist = await response.json();
            updatePlaylistUI();
            if (playlist.length > 0) {
                loadSong(0);
            }
        }
    } catch (error) {
        console.error('Error fetching playlist:', error);
    }
}

// Call on startup
fetchPlaylist();

// ==================== PREMIUM SONG DATABASE ====================
const premiumSongs = [
    {
        id: 1,
        title: "Neon Reverie",
        artist: "Aurora Beats",
        duration: "3:52",
        durationSec: 232,
        cover: "https://picsum.photos/id/104/400/400",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 2,
        title: "Stellar Drift",
        artist: "Cosmic Echo",
        duration: "4:21",
        durationSec: 261,
        cover: "https://picsum.photos/id/169/400/400",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        id: 3,
        title: "Velvet Thunder",
        artist: "Neon Pulse",
        duration: "3:18",
        durationSec: 198,
        cover: "https://picsum.photos/id/155/400/400",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

// ==================== DOM ELEMENTS ====================
const audioElem = document.getElementById('premiumAudio');
const premiumCover = document.getElementById('premiumCover');
const premiumTitle = document.getElementById('premiumTitle');
const premiumArtist = document.getElementById('premiumArtist');
const footerTitle = document.getElementById('footerTitle');
const footerArtist = document.getElementById('footerArtist');
const footerThumb = document.getElementById('footerThumb');
const footerPlayPause = document.getElementById('footerPlayPause');
const footerPrev = document.getElementById('footerPrev');
const footerNext = document.getElementById('footerNext');
const footerProgress = document.getElementById('footerProgress');
const footerCurrentTimeSpan = document.getElementById('footerCurrentTime');
const footerDurationSpan = document.getElementById('footerDuration');
const footerVolume = document.getElementById('footerVolume');
const playlistContainer = document.getElementById('playlistPremiumList');
const trackCountBadge = document.getElementById('trackCountBadge');

// ==================== GLOBAL VARIABLES ====================
let currentTrackIndex = 0;
let isPlaying = false;

// ==================== HELPER FUNCTIONS ====================
// Format seconds to MM:SS
function formatTime(secs) {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Update play/pause icon in footer
function updateFooterPlayIcon() {
    const icon = isPlaying ? 'fa-pause' : 'fa-play';
    footerPlayPause.querySelector('i').className = `fas ${icon}`;
    
    // Control visualizer animation
    const waves = document.querySelectorAll('.visualizer span');
    if (isPlaying) {
        waves.forEach(w => w.style.animationPlayState = 'running');
    } else {
        waves.forEach(w => w.style.animationPlayState = 'paused');
    }
}

// Highlight active track in playlist
function highlightActiveTrack(activeIdx) {
    const items = document.querySelectorAll('.track-item');
    items.forEach((item, idx) => {
        if (idx === activeIdx) {
            item.classList.add('active-track');
        } else {
            item.classList.remove('active-track');
        }
    });
}

// Add ripple animation to album cover
function animateAlbumCover() {
    premiumCover.classList.add('ripple-effect');
    setTimeout(() => premiumCover.classList.remove('ripple-effect'), 300);
}

// ==================== CORE MUSIC FUNCTIONS ====================
// Load and display a track
function loadPremiumTrack(index) {
    const song = premiumSongs[index];
    if (!song) return;
    
    // Set audio source
    audioElem.src = song.audioSrc;
    audioElem.load();
    
    // Update UI elements
    premiumTitle.innerText = song.title;
    premiumArtist.innerText = song.artist;
    premiumCover.src = song.cover;
    footerTitle.innerText = song.title;
    footerArtist.innerText = song.artist;
    footerThumb.src = song.cover;
    
    // Update playlist highlight
    highlightActiveTrack(index);
    
    // Reset progress bar
    footerProgress.value = 0;
    footerCurrentTimeSpan.innerText = "0:00";
    
    // Set duration when metadata loads
    audioElem.onloadedmetadata = () => {
        if (audioElem.duration && !isNaN(audioElem.duration)) {
            footerDurationSpan.innerText = formatTime(audioElem.duration);
            footerProgress.max = audioElem.duration;
        } else {
            footerDurationSpan.innerText = song.duration;
            footerProgress.max = song.durationSec || 232;
        }
    };
    
    // If was playing, auto-play the new track
    if (isPlaying) {
        audioElem.play().catch(e => console.log("Auto-play prevented:", e));
    }
    
    // Animate album cover change
    animateAlbumCover();
}

// Toggle play/pause
function togglePlayPauseFooter() {
    if (isPlaying) {
        audioElem.pause();
        isPlaying = false;
    } else {
        audioElem.play()
            .then(() => {
                isPlaying = true;
            })
            .catch(e => console.log("Playback error:", e));
    }
    updateFooterPlayIcon();
}

// Play next track
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % premiumSongs.length;
    loadPremiumTrack(currentTrackIndex);
    
    if (isPlaying) {
        audioElem.play().catch(e => console.log(e));
    } else {
        // Auto-start playback when changing tracks (premium UX)
        audioElem.play()
            .then(() => {
                isPlaying = true;
                updateFooterPlayIcon();
            })
            .catch(() => {});
    }
    isPlaying = true;
    updateFooterPlayIcon();
}

// Play previous track
function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + premiumSongs.length) % premiumSongs.length;
    loadPremiumTrack(currentTrackIndex);
    
    if (isPlaying) {
        audioElem.play().catch(e => console.log(e));
    } else {
        audioElem.play()
            .then(() => {
                isPlaying = true;
                updateFooterPlayIcon();
            })
            .catch(() => {});
    }
    isPlaying = true;
    updateFooterPlayIcon();
}

// Update progress bar from audio timeupdate
function updateProgressFromFooter() {
    if (audioElem.duration && !isNaN(audioElem.duration) && isFinite(audioElem.duration)) {
        const current = audioElem.currentTime;
        footerProgress.value = current;
        footerCurrentTimeSpan.innerText = formatTime(current);
    }
}

// Seek to position when progress bar is changed
function seekFooter() {
    const val = parseFloat(footerProgress.value);
    if (!isNaN(val) && audioElem.duration) {
        audioElem.currentTime = val;
    }
}

// Set volume from slider
function setVolumeFooter() {
    audioElem.volume = footerVolume.value;
}

// Handle song end - auto play next
function onAudioEnd() {
    nextTrack();
}

// ==================== PLAYLIST RENDERING ====================
function renderPremiumPlaylist() {
    playlistContainer.innerHTML = '';
    
    premiumSongs.forEach((song, idx) => {
        const li = document.createElement('li');
        li.className = 'track-item';
        if (idx === currentTrackIndex) li.classList.add('active-track');
        
        li.innerHTML = `
            <img class="track-thumb" src="${song.cover}" alt="thumb">
            <div class="track-details">
                <div class="track-title">${song.title}</div>
                <div class="track-artist">${song.artist}</div>
            </div>
            <div class="track-duration">${song.duration}</div>
        `;
        
        li.addEventListener('click', () => {
            if (currentTrackIndex !== idx) {
                currentTrackIndex = idx;
                loadPremiumTrack(currentTrackIndex);
                
                // Auto-play when clicking new track
                audioElem.play()
                    .then(() => {
                        isPlaying = true;
                        updateFooterPlayIcon();
                    })
                    .catch(() => {});
                isPlaying = true;
                updateFooterPlayIcon();
            } else {
                // Same track: toggle play/pause
                togglePlayPauseFooter();
            }
        });
        
        playlistContainer.appendChild(li);
    });
    
    trackCountBadge.innerText = `${premiumSongs.length} tracks`;
}

// ==================== EVENT LISTENERS ====================
function bindPremiumEvents() {
    footerPlayPause.addEventListener('click', togglePlayPauseFooter);
    footerNext.addEventListener('click', nextTrack);
    footerPrev.addEventListener('click', prevTrack);
    footerProgress.addEventListener('input', seekFooter);
    footerVolume.addEventListener('input', setVolumeFooter);
    
    audioElem.addEventListener('timeupdate', updateProgressFromFooter);
    audioElem.addEventListener('ended', onAudioEnd);
    audioElem.addEventListener('play', () => {
        isPlaying = true;
        updateFooterPlayIcon();
    });
    audioElem.addEventListener('pause', () => {
        isPlaying = false;
        updateFooterPlayIcon();
    });
    
    // Set initial volume
    audioElem.volume = footerVolume.value;
}

// ==================== INITIALIZATION ====================
function initPremium() {
    renderPremiumPlaylist();
    loadPremiumTrack(0);
    bindPremiumEvents();
    updateFooterPlayIcon();
    
    // Set initial duration text as fallback
    footerDurationSpan.innerText = premiumSongs[0].duration;
}

// Start the application
initPremium();
export class Player {
  constructor({ audio, lyrics, data, theme, storage, slideshows, playlist }) {
    this.audio = audio;
    this.lyrics = lyrics;
    this.data = data;
    this.theme = theme;
    this.storage = storage;
    this.slideshows = slideshows;
    this.playlistManager = playlist;

    // Quản lý trạng thái chung
    this.state = {
      isPlaying: false,
      isShuffle: false,
      loopMode: 0,
      currentSong: null,
      currentPlaylist: [],
      likedSongs: this.storage.get("likedSongs", []),
    };

    this.elements = {
      playerContainer: document.querySelector(".music-player"),
      coverImage: document.querySelector(".cover-image"),
      songTitleText: document.querySelector(".song-title-text"),
      artistNameText: document.querySelector(".artist-name-text"),
      settingBtn: document.querySelector(".setting-btn"),
      lyricBtn: document.querySelector(".lyric-btn"),
      shuffleBtn: document.querySelector(".shuffle-btn"),
      backwardBtn: document.querySelector(".backward-btn"),
      playBtn: document.querySelector(".play-btn"),
      forwardBtn: document.querySelector(".forward-btn"),
      repeatBtn: document.querySelector(".repeat-btn"),
      likeBtn: document.querySelector(".like-btn"),
      volumeSlider: document.querySelector(".volume-slider"),
      progressContainer: document.querySelector(".progress-bar-container"),
      progressFill: document.querySelector(".progress-fill"),
      currentTimeText: document.querySelector(".current-time-text"),
      durationText: document.querySelector(".duration-text"),
      lyricsWrapper: document.querySelector(".lyrics-wrapper"),
      lyricsBox: document.querySelector(".lyrics-box-container"),
      playlistWrapper: document.querySelector(".playlist-wrapper"),
      playlistContainer: document.querySelector(".playlist-container"),
      playlistList: document.querySelector(".playlist-list"),
      playlistHeaderText: document.querySelector(".playlist-header-text"),
      modal: document.querySelector(".modal"),
      closeBtn: document.querySelector(".close-btn"),
      themeSection: document.querySelector(".theme-section"),
      playlistSlideshowTrack: document.querySelector(".slideshow-track"),
      volumeControl: document.querySelector(".volume-control-container"),
    };

    this.init();

    // Cập nhật icon khi play
    this.audio.on("play", () => {
      this.state.isPlaying = true;
      this.updatePlayBtnUI();
      console.log("play");
    });

    // Cập nhật icon khi pause
    this.audio.on("pause", () => {
      this.state.isPlaying = false;
      this.updatePlayBtnUI();
      console.log("pause");
    });
  }

  init() {
    this.theme.render();
    this.playlistManager.renderSlides();
    this.renderPlaylist();
    this.updateSongInfoUI();
  }

  // Cập nhật nút play/pause nếu trạng thái audio thay đổi, không phụ thuộc vào việc nhấn nút
  updatePlayBtnUI() {
    const isPlaying = this.state.isPlaying;
    const btn = this.elements.playBtn;
    btn.classList.toggle("playing", isPlaying);
    btn.innerHTML = isPlaying
      ? '<i class="fa-solid fa-pause"></i>'
      : '<i class="fa-solid fa-play icon-play"></i>';
  }

  playSong(song = this.state.currentSong) {
    if (!song) return;

    this.state.currentSong = song;
    // this.state.isPlaying = true;

    this.audio.play(song.songPath);
    this.lyrics.load(song.lyric);

    this.updateSongInfoUI();
  }

  pauseSong() {
    this.audio.pause();
    // this.state.isPlaying = false;
  }

  togglePlay() {
    if (this.audio.isPlaying()) {
      this.pauseSong();
    } else {
      this.playSong();
    }
  }

  nextSong() {
    // TODO: dùng playlistManager.getNextSong()
  }

  prevSong() {
    // TODO: dùng playlistManager.getPrevSong()
  }

  setVolume(value) {
    this.audio.setVolume(value);
  }

  updateSongInfoUI() {
    const song = this.state.currentSong;
    if (!song) return;
    this.elements.coverImage.src = song.songImgPath;
    this.elements.songTitleText.textContent = song.name;
    this.elements.artistNameText.textContent = song.artist;
  }

  renderPlaylist() {
    const songs = this.playlistManager.getCurrentPlaylist();
    this.state.currentPlaylist = songs;
    this.state.currentSong = songs[0];
  }

  toggleModal() {
    this.elements.modal.classList.toggle("show");
  }

  toggleLike() {
    const current = this.state.currentSong;
    if (!current) return;

    const liked = this.state.likedSongs;
    const index = liked.findIndex((s) => s.id === current.id);

    if (index >= 0) {
      liked.splice(index, 1);
    } else {
      liked.push(current);
    }

    this.storage.set("likedSongs", liked);
    this.state.likedSongs = liked;
  }

  toggleShuffle() {
    this.state.isShuffle = !this.state.isShuffle;
  }

  toggleRepeat() {
    this.state.loopMode = (this.state.loopMode + 1) % 3;
  }
}

// ─────────────────────────────── END PLAYER ───────────────────────────────
// ==================================================================

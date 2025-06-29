export class Player {
  constructor({ audio, lyrics, data, theme, storage, slideshow, playlist }) {
    this.audio = audio;
    this.lyrics = lyrics;
    this.data = data;
    this.theme = theme;
    this.storage = storage;
    this.slideshow = slideshow;
    this.playlistManager = playlist;

    // Quản lý trạng thái chung
    this.state = {
      isPlaying: false, // Trạng thái phát
      isShuffle: false, // Trạng thái trộn
      isAutoSlideshow: false, // Trajgn thái auto play slideshow
      loopMode: 0, // Trạng thái lặp 0: none, 1: single, 2: all
      currentSong: null, // Thông tin bài hát hiện tại
      currentPlaylist: [], // Thông tin playlist hiện tại
      likedSongs: this.storage.get("likedSongs", []), // Danh sách những bài hát đã thích
    };

    // Lấy DOM elements
    this.elements = {
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
      progressHandle: document.querySelector(".progress-handle"),
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
      slideshow: document.querySelector(".slideshow"),
      playlistSlideshowTrack: document.querySelector(".slideshow-track"),
      playlistItems: document.querySelectorAll(".slide-item"),
      volumeControl: document.querySelector(".volume-control-container"),
    };

    this.init();
  }

  init() {
    // Tạo mẫu họn theme
    this.theme.render();
    this.playlistManager.renderSlides();
    this.renderPlaylist();
    this.updateSongInfoUI();
    this.elements.progressFill.style.width = `0%`;
    this.setupProgressListener();
  }

  setupProgressListener() {
    const { audio, elements } = this;

    // Khi tải xong audio, cập nhật thời lượng bài hát
    audio.on("loadedmetadata", () => {
      const duration = this.audio.audio.duration;
      const formattedDuration = this.formatTime(duration);

      if (formattedDuration && formattedDuration !== "00:00") {
        this.elements.durationText.innerHTML = formattedDuration;
      }
    });

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

    // Cập nhật progress khi phát
    this.audio.on("timeupdate", () => {
      this.updateProgress();
    });

    elements.progressContainer.addEventListener("click", (e) => {
      const percent = e.offsetX / elements.progressContainer.clientWidth;
      audio.currentTime = percent * audio.duration;
    });
  }

  // Cập nhật trạng thái phát
  // Cập nhật nút play/pause nếu trạng thái audio thay đổi, không phụ thuộc vào việc nhấn nút
  updatePlayBtnUI() {
    const isPlaying = this.state.isPlaying;
    const btn = this.elements.playBtn;
    btn.classList.toggle("playing", isPlaying);
    btn.innerHTML = isPlaying
      ? '<i class="fa-solid fa-pause"></i>'
      : '<i class="fa-solid fa-play icon-play"></i>';
  }

  // Play
  playSong(song = this.state.currentSong) {
    if (!song) return;

    this.state.currentSong = song;
    this.audio.play(song.songPath);
    this.lyrics.load(song.lyric);

    this.updateSongInfoUI();
  }
  // Pause
  pauseSong() {
    this.audio.pause();
    // this.state.isPlaying = false;
  }
  // Phát tiếp tục
  nextSong() {
    // TODO: dùng playlistManager.getNextSong()
  }
  // Phát bài trước
  prevSong() {
    // TODO: dùng playlistManager.getPrevSong()
  }
  // Thay đổi âm lượng
  setVolume(value) {
    this.audio.setVolume(value);
  }
  // Cập nhật tên bài hát, tác giả, ảnh cover
  updateSongInfoUI() {
    const song = this.state.currentSong;
    if (!song) return;
    this.elements.coverImage.src = song.songImgPath;
    this.elements.songTitleText.textContent = song.name;
    this.elements.artistNameText.textContent = song.artist;
  }
  // Tạo playlist
  renderPlaylist() {
    const songs = this.playlistManager.getCurrentPlaylist();
    this.state.currentPlaylist = songs;
    this.state.currentSong = songs[0];
  }
  // Ẩn hiện modal
  toggleModal() {
    this.elements.modal.classList.toggle("show");
    this.elements.slideshow.dataset.autoplay =
      this.elements.modal.classList.contains("show");
  }
  // Chuyển đổi và cập nhật trạng thái liked
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

    // TODO cập nhật storage
    // this.storage.set("likedSongs", liked);
    this.state.likedSongs = liked;
  }
  // Chuyển đổi trạng thái trộn
  toggleShuffle() {
    this.state.isShuffle = !this.state.isShuffle;
  }
  // Chuyển đổi trạng thái loop 0: none 1: single 2: active
  toggleRepeat() {
    this.state.loopMode = (this.state.loopMode + 1) % 3;
  }
  // Cập nhật thanh progress
  updateProgress() {
    const current = this.audio.audio.currentTime;
    const duration = this.audio.audio.duration;
    const formattedCurrent = this.formatTime(current);
    const percent = (current / duration) * 100;
    // Thay đổi style, cập nhật chiều rộng theo phần trăm
    this.elements.progressFill.style.width = `${percent}%`;
    // NẾu thời gian hiện tại hợp lệ, cập nhật hiển trị
    if (formattedCurrent) {
      this.elements.currentTimeText.innerHTML = formattedCurrent;
    }
  }
  // Xử lý khi kéo nút tua
  progressHandle(e) {
    const container = this.elements.progressContainer;
    const audio = this.audio.audio;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    // Tính phần trăm tua
    const percent = Math.min(Math.max(clickX / width, 0), 1);
    // Thời lượng bài hát
    const duration = audio.duration;
    // Nếu thời lượng không hợp lệ, trả về và không làm gì cả
    if (!duration || isNaN(duration) || !isFinite(duration)) {
      return;
    }
    // Cập nhật thời gian tại thời điểm tua
    const newTime = duration * percent;
    // Kiểm tra nếu thời gian hợp lệ thì cập nhật
    if (!isNaN(newTime) && isFinite(newTime)) {
      audio.currentTime = newTime;
    }
  }
  // Định dạng 00:00 cho thời gian
  formatTime(sec) {
    // Kiểm tra number và không phải vô hạn
    if (typeof sec !== "number" || isNaN(sec) || !isFinite(sec)) {
      return "00:00";
    }
    // Phút
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    // Giây
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    // Trả về thời gian theo định dạng 00:00
    return `${minutes}:${seconds}`;
  }
}

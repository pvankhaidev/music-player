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
      loopMode: 0, // Trạng thái lặp 0: none, 1: single, 2: all
      currentSong: null, // Thông tin bài hát hiện tại
      currentPlaylist: [], // Thông tin playlist hiện tại
      currentPlaylistId: 0, // Id playlist hiện tại
      likedSongIds: [], // Danh sách những bài hát đã thích
      themeName: "sand",
    };

    this.storageState = {
      currentSong: null, // Thông tin bài hát hiện tại
      currentPlaylist: [], // Thông tin playlist hiện tại
      currentPlaylistId: 0, // Id playlist hiện tại
      likedSongIds: [], // Danh sách những bài hát đã thích
      themeName: "",
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
    // Đọc dữ liệu storage
    this.loadStateFromStorage();

    // Tạo mẫu theme
    this.theme.render();

    // Render theme đã được sử dụng lần trước, lưu trong storage
    this.theme.apply(this.state.themeName);

    // Render tất cả playlist, bao gồm "tất cả", "yêu thích" & các playlist trong playerData.js
    this.playlistManager.renderAllSlides(this.state.likedSongIds);

    // Load playlist được phát trước đó, lưu trong storage
    if (this.state.currentPlaylistId && this.state.currentPlaylistId > 0) {
      this.playlistManager.applyPlaylist(this.state.currentPlaylistId);
    } else {
      // Nếu không có thì load playlist đầu tiên, mặc định là tất cả bài hát
      const first = this.playlistManager.playlists[0];
      if (first) {
        this.playlistManager.applyPlaylist(first.id);
      }
    }

    // Tạo và hiển thị playlist
    this.renderPlaylist();

    // Hiển thị tên playlist
    this.renderPlaylistName();

    // Cập nhật thông tin bài hát
    this.updateSongInfoUI();

    // Cập nhật thanh progress đưa về ban đầu
    this.elements.progressFill.style.width = `0%`;

    // Thiết lập các event của audio
    this.setupAudioListener();

    // Thiết lập playlist slideshow
    this.slideshow.slideItems =
      this.elements.slideshow.querySelectorAll(".slide-item");
    this.slideshow.init();
  }

  // Đọc trạng thái lưu trong storage
  loadStateFromStorage() {
    const stored = this.storage.getObject("music_player_data", null);
    if (stored) {
      this.storageState = stored;
      // Đồng bộ sang state chính
      this.state.currentSong = stored.currentSong;
      this.state.currentPlaylist = stored.currentPlaylist;
      this.state.currentPlaylistId = stored.currentPlaylistId;
      this.state.likedSongIds = stored.likedSongIds || [];
      this.state.themeName = stored.themeName || "sand";
    }
  }

  // Lưu trạng thái vào storage
  saveStateToStorage() {
    // Đồng bộ storageState với state trước khi lưu
    this.storageState.currentSong = this.state.currentSong;
    this.storageState.currentPlaylist = this.playlistManager.currentPlaylist;
    this.storageState.currentPlaylistId = this.state.currentPlaylistId;
    this.storageState.likedSongIds = this.state.likedSongIds;
    this.storageState.themeName = this.state.themeName;

    this.storage.setObject("music_player_data", this.storageState);
  }

  setupAudioListener() {
    const { audio, elements } = this;

    // Khi tải xong audio, cập nhật thời lượng bài hát
    audio.on("loadedmetadata", () => {
      const duration = this.audio.audio.duration;
      const formattedDuration = this.formatTime(duration);

      if (formattedDuration && formattedDuration !== "00:00") {
        this.elements.durationText.innerHTML = formattedDuration;
      }

      // Kiểm tra và cập nhật icon like sau khi load xong bài hiện tại
      const { isLiked, index } = this.isCurrentSongLiked();
      this.updateLikeButton(this.elements.likeBtn, isLiked);
    });

    // Cập nhật icon khi play
    this.audio.on("play", () => {
      this.state.isPlaying = true;
      this.updatePlayBtnUI();
      this.saveStateToStorage();
    });

    // Cập nhật icon khi pause
    this.audio.on("pause", () => {
      this.state.isPlaying = false;
      this.updatePlayBtnUI();
      this.saveStateToStorage();
    });

    // Cập nhật progress khi phát
    this.audio.on("timeupdate", () => {
      this.updateProgress();
    });

    elements.progressContainer.addEventListener("pointerup", (e) => {
      const percent = e.offsetX / elements.progressContainer.clientWidth;
      audio.currentTime = percent * audio.duration;
    });

    // Repeat, tùy theo trạng thái repeat
    this.audio.on("ended", () => {
      const loopMode = this.state.loopMode;
      if (loopMode === 1) {
        // Lặp 1
        this.audio.audio.currentTime = 0;
        this.playSong();
      } else {
        if (loopMode === 2) {
          // Lặp tất cả
          this.nextSong();
        } else {
          // Lặp đến cuối danh sách rồi dừng
          if (
            this.state.currentPlaylist.indexOf(this.state.currentSong) !==
            this.state.currentPlaylist.length - 1
          ) {
            this.nextSong();
          }
        }
      }
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
  playSong(song = this.state.currentSong, clickState = "") {
    if (!song) return;

    this.state.currentSong = song;
    this.audio.play(song.songPath);
    this.lyrics.load(song.lyric);
    this.updateSongInfoUI();
    this.updatePlaylistDisp(clickState);
    this.saveStateToStorage();
  }

  // Pause
  pauseSong() {
    this.audio.pause();
  }

  // Phát tiếp tục
  nextSong() {
    const song = this.state.currentSong;
    const playlist = this.state.currentPlaylist;
    const index = playlist.indexOf(song);
    if (index >= 0) {
      const nextIndex = (index + 1) % playlist.length;
      this.state.currentSong = playlist[nextIndex];
    }
    this.playSong();
  }

  // Phát bài trước
  prevSong() {
    const song = this.state.currentSong;
    const playlist = this.state.currentPlaylist;
    const index = playlist.indexOf(song);
    if (index >= 0) {
      const prevIndex = (index + playlist.length - 1) % playlist.length;
      this.state.currentSong = playlist[prevIndex];
    }
    this.playSong();
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

  // Cập nhật hiển thị playlist
  updatePlaylistDisp(clickState) {
    const songEls = Array.from(
      this.elements.playlistList.querySelectorAll("li")
    );
    songEls.forEach((el) => {
      el.classList.remove("active");
      if (Number(el.dataset.id) === this.state.currentSong.id) {
        el.classList.add("active");
        // Nếu là click thì không cuộn
        if (clickState !== "1") {
          el.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    });
  }

  // Xáo trộn playlist
  shufflePlaylist() {
    // Tạo bản sao của playlist hiện tại
    let tempPlaylist = this.state.currentPlaylist.slice();

    // Tạo mảng mới
    let newPlaylist = [];

    // Lấy bài đang phát hiện tại
    const song = this.state.currentSong;

    // Tìm vị trí bài đó trong playlist
    const orgIndex = tempPlaylist.indexOf(song);
    if (orgIndex < 0) return;

    // Xóa bài đang phát ra khỏi mảng tạm
    tempPlaylist.splice(orgIndex, 1);

    // Xáo trộn phần còn lại
    this.shuffleArray(tempPlaylist);

    // Đưa bài đang phát lên đầu danh sách mới
    newPlaylist.push(song);

    // Nối thêm phần còn lại
    newPlaylist = newPlaylist.concat(tempPlaylist);

    // Cập nhật lại playlist
    this.state.currentPlaylist = newPlaylist;

    // Lưu vào storage
    this.saveStateToStorage();
  }

  // Hàm xáo trộn mảng
  shuffleArray(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }

  // Tạo playlist
  renderPlaylist() {
    // Kiểm tra trạng thái trộn
    if (this.state.isShuffle) {
      this.shufflePlaylist();
      this.playlistManager.renderSongList(
        this.state.currentPlaylist,
        this.state.currentSong?.id ?? -1
      );
    } else {
      const songs = this.playlistManager.getCurrentPlaylist().slice();
      this.state.currentPlaylist = songs;

      const currentId = this.state.currentSong?.id ?? songs[0]?.id ?? null;

      this.state.currentSong =
        songs.find((s) => s.id === currentId) ?? songs[0];

      this.playlistManager.renderSongList(
        songs,
        this.state.currentSong?.id ?? -1
      );
    }

    this.saveStateToStorage();
  }

  // Hiển thị tên danh sách khi load, đọc từ storage
  renderPlaylistName() {
    const playlistHeaderText = this.elements.playlistHeaderText;

    if (this.state.currentPlaylistId === 1000001) {
      playlistHeaderText.innerHTML = "Yêu thích";
    } else if (this.state.currentPlaylistId === 1000002) {
      playlistHeaderText.innerHTML = "Tất cả bài hát";
    } else {
      const index = this.playlistManager.playlists.findIndex((playlist) => {
        return playlist.id === this.state.currentPlaylistId;
      });
      if (index >= 0) {
        playlistHeaderText.innerHTML =
          this.playlistManager.playlists[index].name;
      } else {
        playlistHeaderText.innerHTML = "Playlist";
      }
    }
  }

  // Ẩn hiện modal
  toggleModal() {
    this.elements.modal.classList.toggle("show");
    this.elements.slideshow.dataset.autoplay =
      this.elements.modal.classList.contains("show");
  }

  // Chuyển đổi và cập nhật trạng thái liked
  toggleLike() {
    // Kiểm tra bài hát hiện tại có được yêu thích chưa
    const { isLiked, index } = this.isCurrentSongLiked() || {
      isLiked: false,
      index: -1,
    };
    // Lấy danh sách yêu thích hiện tại
    const likedId = this.state.likedSongIds || [];

    if (isLiked && index >= 0) {
      // Nếu đã thích, thì bỏ id ra khỏi mảng
      likedId.splice(index, 1);
    } else {
      // Nếu chưa thích, thêm id vào mảng
      likedId.push(this.state.currentSong.id);
    }

    this.state.likedSongIds = likedId;

    this.saveStateToStorage();

    this.playlistManager.renderAllSlides(this.state.likedSongIds);
  }

  // Chuyển đổi trạng thái trộn
  toggleShuffle() {
    this.state.isShuffle = !this.state.isShuffle;
    this.renderPlaylist();
    this.saveStateToStorage();
  }

  // Chuyển đổi trạng thái loop 0: none 1: single 2: active
  setRepeatState(value) {
    this.state.loopMode = value;
    this.saveStateToStorage();
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

  // Cập nhật trạng thái liked của bài hiện tại
  isCurrentSongLiked() {
    const current = this.state.currentSong;
    if (!current) return null;

    const liked = this.state.likedSongIds || [];
    const index = liked.findIndex((id) => id === current.id);
    const isLiked = index !== -1;
    return { isLiked, index };
  }

  // Cập nhật icon nút like
  updateLikeButton(el, isLiked) {
    el.classList.toggle("active", isLiked);
    el.innerHTML = isLiked
      ? '<i class="fa-solid fa-heart"></i>'
      : '<i class="fa-regular fa-heart"></i>';
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

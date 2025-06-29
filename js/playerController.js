export class PlayerControl {
  constructor({ player }) {
    this.player = player;
    this.initEvents();
  }

  initEvents() {
    const elements = this.player.elements;

    // Play/Pause
    elements.playBtn.addEventListener("click", () => this.togglePlay());

    // Yêu thích
    elements.likeBtn.addEventListener("click", () =>
      this.toggleLike(
        elements.likeBtn,
        '<i class="fa-solid fa-heart"></i>',
        '<i class="fa-regular fa-heart"></i>'
      )
    );

    // Lặp lại
    elements.repeatBtn.addEventListener("click", () =>
      this.toggleRepeat(elements.repeatBtn)
    );

    // Trộn
    elements.shuffleBtn.addEventListener("click", () =>
      this.toggleShuffle(elements.shuffleBtn)
    );

    // Lyrics
    elements.lyricBtn.addEventListener("click", () =>
      this.toggleLyric(
        elements.lyricBtn,
        '<i class="fa-solid fa-closed-captioning"></i>',
        '<i class="fa-regular fa-closed-captioning"></i>'
      )
    );

    // Volume slider
    elements.volumeSlider.addEventListener("input", (e) =>
      this.setVolume(e.target.value, elements.volumeControl.querySelector("i"))
    );

    // Click icon volume để tắt tiếng / bật lại
    elements.volumeControl
      .querySelector("i")
      .addEventListener("click", () =>
        this.toggleMute(
          elements.volumeControl.querySelector("i"),
          elements.volumeSlider
        )
      );

    // Mở modal cài đặt
    elements.settingBtn.addEventListener("click", () =>
      this.player.toggleModal()
    );

    // Đóng modal khi click nút đóng
    elements.closeBtn.addEventListener("click", () =>
      this.player.toggleModal()
    );

    // Đóng modal khi click ra ngoài vùng nội dung
    elements.modal.addEventListener("click", (e) => {
      if (e.target === elements.modal) {
        this.player.toggleModal();
      }
    });

    // Khi nhấn vào progress
    elements.progressContainer.addEventListener("click", (e) => {
      this.progressHandle(e);
    });

    // Xử lý khi kéo nút trên progress
    let isDragging = false;

    elements.progressHandle.addEventListener("mousedown", (e) => {
      isDragging = true;
      document.body.style.userSelect = "none"; // tránh bôi đen
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      this.progressHandle(e); // Cập nhật thời gian theo vị trí chuột
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = ""; // khôi phục cho phép bôi đen
      }
    });

    // Nhấn nút forward
    elements.forwardBtn.addEventListener("click", this.nextSong);

    // Nhấn nút backward
    elements.backwardBtn.addEventListener("click", this.prevSong);
  }

  nextSong() {
    this.player.nextSong();
  }
  prevSong() {
    this.player.prevSong();
  }

  togglePlay() {
    const isPlaying = this.player.state.isPlaying;

    if (isPlaying) {
      this.player.pauseSong();
    } else {
      this.player.playSong();
    }
  }

  toggleLike(el, iconActive, iconNone) {
    const current = this.player.state.currentSong;
    if (!current) return;

    const liked = this.player.state.likedSongs;
    const index = liked.findIndex((s) => s.id === current.id);
    const isLiked = index === -1;

    if (isLiked) {
      liked.push(current);
    } else {
      liked.splice(index, 1);
    }

    this.player.storage.set("likedSongs", liked);
    this.player.state.likedSongs = liked;

    el.classList.toggle("active", isLiked);
    el.innerHTML = isLiked ? iconActive : iconNone;
  }

  toggleRepeat(el) {
    const next = (this.player.state.loopMode + 1) % 3;
    this.player.state.loopMode = next;

    el.classList.remove("inactive", "single", "active");
    if (next === 0) el.classList.add("inactive");
    if (next === 1) el.classList.add("single");
    if (next === 2) el.classList.add("active");
  }

  toggleShuffle(el) {
    const isShuffle = !this.player.state.isShuffle;
    this.player.state.isShuffle = isShuffle;

    el.classList.toggle("inactive", !isShuffle);
  }

  toggleLyric(el, iconActive, iconNone) {
    const { lyricsWrapper, playlistWrapper } = this.player.elements;
    const isVisible = el.classList.toggle("active");

    el.innerHTML = isVisible ? iconActive : iconNone;

    lyricsWrapper.classList.toggle("active", isVisible);
    playlistWrapper.classList.toggle("active", !isVisible);
  }

  setVolume(value, iconEl) {
    const vol = parseInt(value, 10);
    this.player.setVolume(vol);

    if (!iconEl) return;
    if (vol === 0) {
      iconEl.className = "fa-solid fa-volume-off icon-volume";
    } else if (vol <= 50) {
      iconEl.className = "fa-solid fa-volume-low icon-volume";
    } else {
      iconEl.className = "fa-solid fa-volume-high icon-volume";
    }
  }

  toggleMute(iconEl, sliderEl) {
    const isMuted = iconEl.classList.contains("fa-volume-off");

    if (isMuted) {
      iconEl.className = "fa-solid fa-volume-high icon-volume";
      sliderEl.value = 70;
    } else {
      iconEl.className = "fa-solid fa-volume-off icon-volume";
      sliderEl.value = 0;
    }

    this.setVolume(sliderEl.value, iconEl);
  }

  progressHandle(e) {
    this.player.progressHandle(e);
  }
}

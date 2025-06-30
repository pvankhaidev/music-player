export class PlayerControl {
  constructor({ player }) {
    this.player = player;
    this.initEvents();
  }

  initEvents() {
    const elements = this.player.elements;

    // Play/Pause
    elements.playBtn.addEventListener("pointerup", () => this.togglePlay());

    // Yêu thích
    elements.likeBtn.addEventListener("pointerup", () =>
      this.toggleLike(elements.likeBtn)
    );

    // Lặp lại
    elements.repeatBtn.addEventListener("pointerup", () =>
      this.toggleRepeat(elements.repeatBtn)
    );

    // Trộn
    elements.shuffleBtn.addEventListener("pointerup", () =>
      this.toggleShuffle(elements.shuffleBtn)
    );

    // Lyrics
    elements.lyricBtn.addEventListener("pointerup", () =>
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
      .addEventListener("pointerup", () =>
        this.toggleMute(
          elements.volumeControl.querySelector("i"),
          elements.volumeSlider
        )
      );

    // Mở modal cài đặt
    elements.settingBtn.addEventListener("pointerup", () =>
      this.player.toggleModal()
    );

    // Đóng modal khi click nút đóng
    elements.closeBtn.addEventListener("pointerup", () =>
      this.player.toggleModal()
    );

    // Đóng modal khi click ra ngoài vùng nội dung
    elements.modal.addEventListener("pointerup", (e) => {
      if (e.target === elements.modal) {
        this.player.toggleModal();
      }
    });

    // Khi nhấn vào progress
    elements.progressContainer.addEventListener("pointerup", (e) => {
      this.player.progressHandle(e);
    });

    // Xử lý khi kéo nút trên progress
    let isDragging = false;

    elements.progressHandle.addEventListener("pointerdown", (e) => {
      isDragging = true;
      document.body.style.userSelect = "none"; // tránh bôi đen
    });

    document.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      this.player.progressHandle(e); // Cập nhật thời gian theo vị trí chuột
    });

    document.addEventListener("pointerup", () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = ""; // khôi phục cho phép bôi đen
      }
    });

    // Nhấn nút forward
    elements.forwardBtn.addEventListener("pointerup", () => {
      this.player.nextSong();
    });

    // Nhấn nút backward
    elements.backwardBtn.addEventListener("pointerup", () => {
      this.player.prevSong();
    });
  }

  togglePlay() {
    const isPlaying = this.player.state.isPlaying;

    if (isPlaying) {
      this.player.pauseSong();
    } else {
      this.player.playSong();
    }
  }

  toggleLike(el) {
    const likedStatus = this.player.isCurrentSongLiked();

    if (likedStatus !== null) {
      // Trước khi toggle, trạng thái hiện tại
      const { isLiked } = likedStatus;

      // Thực hiện toggle trạng thái trong player
      this.player.toggleLike();

      // Sau khi toggle, trạng thái mới sẽ là ngược lại
      const newLiked = !isLiked;
      this.player.updateLikeButton(el, newLiked);
    }
  }

  toggleRepeat(el) {
    const next = (this.player.state.loopMode + 1) % 3;
    this.player.setRepeatState(next);

    el.classList.remove("inactive", "single", "active");
    if (next === 0) el.classList.add("inactive");
    if (next === 1) el.classList.add("single");
    if (next === 2) el.classList.add("active");
  }

  toggleShuffle(el) {
    const isShuffle = !this.player.state.isShuffle;
    el.classList.toggle("inactive", !isShuffle);
    this.player.toggleShuffle();
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
}

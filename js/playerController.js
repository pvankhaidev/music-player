// PlayerControl.js
// Quản lý hành vi tương tác UI, điều khiển Player mà không can thiệp trực tiếp vào Audio hoặc DOM ngoài

export class PlayerControl {
  constructor({ player }) {
    this.player = player;
    this.initEvents();
  }

  initEvents() {
    const $ = this.player.elements;

    // Play/Pause
    $.playBtn.addEventListener("click", () =>
      this.togglePlay(
        $.playBtn,
        '<i class="fa-solid fa-pause"></i>',
        '<i class="fa-solid fa-play icon-play"></i>'
      )
    );

    // Yêu thích
    $.likeBtn.addEventListener("click", () =>
      this.toggleLike(
        $.likeBtn,
        '<i class="fa-solid fa-heart"></i>',
        '<i class="fa-regular fa-heart"></i>'
      )
    );

    // Lặp lại
    $.repeatBtn.addEventListener("click", () => this.toggleRepeat($.repeatBtn));

    // Trộn
    $.shuffleBtn.addEventListener("click", () =>
      this.toggleShuffle($.shuffleBtn)
    );

    // Lyrics
    $.lyricBtn.addEventListener("click", () =>
      this.toggleLyric(
        $.lyricBtn,
        '<i class="fa-solid fa-closed-captioning"></i>',
        '<i class="fa-regular fa-closed-captioning"></i>'
      )
    );

    // Volume slider
    $.volumeSlider.addEventListener("input", (e) =>
      this.setVolume(e.target.value, $.volumeControl.querySelector("i"))
    );

    // Click icon volume để tắt tiếng / bật lại
    $.volumeControl
      .querySelector("i")
      .addEventListener("click", () =>
        this.toggleMute($.volumeControl.querySelector("i"), $.volumeSlider)
      );

    // Mở modal cài đặt
    $.settingBtn.addEventListener("click", () => this.player.toggleModal());

    // Đóng modal khi click nút đóng
    $.closeBtn.addEventListener("click", () => this.player.toggleModal());

    // Đóng modal khi click ra ngoài vùng nội dung
    $.modal.addEventListener("click", (e) => {
      if (e.target === $.modal) {
        this.player.toggleModal();
      }
    });
  }

  togglePlay(el, iconPause, iconPlay) {
    const isPlaying = this.player.state.isPlaying;

    if (isPlaying) {
      this.player.pauseSong();
    } else {
      this.player.playSong();
    }

    // el.innerHTML = !isPlaying ? iconPause : iconPlay;
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

    el.classList.remove("inactive", "active", "single");
    if (next === 0) el.classList.add("inactive");
    if (next === 1) el.classList.add("active");
    if (next === 2) el.classList.add("single");
  }

  toggleShuffle(el) {
    const isNowOn = !this.player.state.isShuffle;
    this.player.state.isShuffle = isNowOn;

    el.classList.toggle("inactive", !isNowOn);
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

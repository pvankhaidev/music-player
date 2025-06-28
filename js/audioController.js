export class AudioController {
  constructor() {
    this.audio = new Audio(); // Thẻ audio HTML
    this.currentSrc = null; // Lưu đường dẫn bài hiện tại
  }

  // ===== Phát nhạc =====
  play(src = null) {
    // Phát mới
    if (src && src !== this.currentSrc) {
      this.audio.src = src;
      this.currentSrc = src;
    }

    // Phát tiếp tục nếu đã bị pause trước đó
    if (this.audio.paused) {
      return this.audio.play();
    }
  }

  // ===== Tạm dừng phát nhạc =====
  pause() {
    this.audio.pause();
  }

  // ===== Thiết lập âm lượng =====
  setVolume(volume) {
    this.audio.volume = Math.min(Math.max(volume / 100, 0), 1);
  }

  // ===== Kiểm tra trạng thái phát =====
  isPlaying() {
    return !this.audio.paused;
  }

  // ===== Lắng nghe sự kiện từ audio element và thực hiện hàm callback =====
  on(event, callback) {
    this.audio.addEventListener(event, callback);
  }
}

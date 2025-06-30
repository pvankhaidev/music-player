export class LyricsManager {
  constructor() {
    this.subs = [];
    this.currentIndex = -1;
    this.onChangeCallback = null;
  }

  // Nạp danh sách lời bài hát
  load(subs) {
    this.subs = subs || [];
    this.currentIndex = -1;
  }

  // Hàm gọi liên tục khi audio đang phát
  sync(currentTime) {
    if (!this.subs.length) return;

    const index = this.subs.findIndex(
      (line, i) =>
        currentTime >= line.timeStart &&
        currentTime <= line.timeEnd &&
        i !== this.currentIndex
    );

    if (index !== -1) {
      this.currentIndex = index;
      if (this.onChangeCallback) {
        this.onChangeCallback(this.subs[index], index);
      }
    }
  }

  // Lấy dòng hiện tại
  getCurrentLine() {
    return this.subs[this.currentIndex] || null;
  }

  // Đăng ký callback khi lời thay đổi
  onChange(callback) {
    this.onChangeCallback = callback;
  }

  // Reset trạng thái (khi đổi bài hát)
  reset() {
    this.subs = [];
    this.currentIndex = -1;
    this.onChangeCallback = null;
  }
}

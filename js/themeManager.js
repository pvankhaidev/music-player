export class ThemeManager {
  constructor(themeList) {
    // Lấy Object chứa các theme từ data
    // ※ Chú ý: obj chứ không phải array nên khi xủ lý nên dùng entries
    this.themes = themeList;
    // DOM element để render các mẫu chọn theme
    this.container = document.querySelector(".theme-section");
  }

  // Trả về toàn bộ theme object
  getAll() {
    return this.themes;
  }

  // Áp dụng theme theo tên
  apply(themeName) {
    // Thử tìm xem có theme nào trùng với tên không
    const theme = this.themes[themeName];
    // Nếu không có trả về
    if (!theme) return;

    // Nếu có thì thay đổi biến css với dữ liệu theme
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (key.startsWith("--")) {
        root.style.setProperty(key, value);
      }
    });
  }

  // Render các mẫu chọn theme
  render() {
    // Nếu không tìm thấy container
    if (!this.container) return;
    // Nếu có thì làm trống
    this.container.innerHTML = "";

    // Lặp qua toàn bộ obj theme bằng entries và forEach
    // Render mẫu chọn với dữ liệu đại diện trong theme
    Object.entries(this.themes).forEach(([name, theme]) => {
      const btn = document.createElement("div");
      btn.className = "theme-sample";
      btn.textContent = theme.name || name;
      btn.dataset.theme = name;

      // Tạo mẫu với màu nền và màu chữ chính
      btn.style.background = theme["--bg-gradient-main"];
      btn.style.color = theme["--color-secondary"];

      btn.addEventListener("pointerup", () => {
        this.apply(name);
        window.player.state.themeName = name;
        window.player.saveStateToStorage();
      });

      this.container.appendChild(btn);
    });
  }
}

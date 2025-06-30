import { AudioController } from "./audioController.js";
import { LyricsManager } from "./lyricsManager.js";
import { PlayerData } from "./playerData.js";
import { ThemeManager } from "./themeManager.js";
import { Storage } from "./storage.js";
import { Slideshow } from "./slideshow.js";
import { Player } from "./player.js";
import { PlaylistManager } from "./playlistManager.js";
import { PlayerControl } from "./playerController.js";

window.addEventListener("DOMContentLoaded", () => {
  // Điều khiển Audio
  const audioController = new AudioController();
  // Xử lý lyrics
  const lyricsManager = new LyricsManager();
  // Lưu trữ và xử lý dữ liệu bài hát, playlist, theme
  const playerData = new PlayerData();
  // Lưu trữ và thao tác với local storage
  const storage = new Storage();
  // Xử lý slideshow hiển thị playlist
  const slideshow = new Slideshow({
    transitionTime: 0.5,
    autoPlayInterval: 3000,
  });
  // Xử lý theme
  const themeManager = new ThemeManager(playerData.getAllThemes());
  // Xử lý playlist
  const playlistManager = new PlaylistManager(
    playerData.getAllPlaylists(),
    playerData.getAllSongs()
  );
  // Quản lý trạng thái chính, giao diện, phát nhạc và điều khiển cơ bản
  // Cầu nối giao tiếp trung gian giữa các js, đặc biệt là audioController playerControler
  const player = new Player({
    audio: audioController,
    lyrics: lyricsManager,
    data: playerData,
    theme: themeManager,
    storage,
    slideshow: slideshow,
    playlist: playlistManager,
  });
  // Gắn các điều khiển UI (PlayerControl) sau khi Player đã sẵn sàng
  const playerControl = new PlayerControl({
    player,
    audio: audioController,
    lyrics: lyricsManager,
    storage,
  });
  // Tạo biến global để dễ truy cập
  window.player = player;
});

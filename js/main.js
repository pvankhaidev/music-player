import { AudioController } from "./audioController.js";
import { LyricsEngine } from "./lyricsEngine.js";
import { PlayerData } from "./playerData.js";
import { ThemeManager } from "./themeManager.js";
import { Storage } from "./storage.js";
import { Slideshow } from "./slideshow.js";
import { Player } from "./player.js";
import { PlaylistManager } from "./playlistManager.js";
import { PlayerControl } from "./playerController.js";

window.addEventListener("DOMContentLoaded", () => {
  // ==== Khởi tạo các module độc lập ====
  // Điều khiển Audio
  const audioController = new AudioController();
  // Xử lý lyrics
  const lyricsEngine = new LyricsEngine();
  // Lưu trữ và xử lý dữ liệu bài hát, playlist, theme
  const playerData = new PlayerData();
  // Lưu trữ và thao tác với local storage
  const storage = new Storage();
  // Xử lý theme
  const themeManager = new ThemeManager(playerData.getAllThemes());
  // Xử lý playlist
  const playlistManager = new PlaylistManager(
    playerData.getAllPlaylists(),
    playerData.getAllSongs()
  );
  // Xử lý slideshow hiển thị playlist
  const slideshow = new Slideshow({
    transitionTime: 0.5,
    autoPlayInterval: 3000,
  });
  // Quản lý trạng thái chính, giao diện, phát nhạc và điều khiển cơ bản
  // Cầu nối giao tiếp trung gian giữa các js, đặc biệt là audioController playerControler
  const player = new Player({
    audio: audioController,
    lyrics: lyricsEngine,
    data: playerData,
    theme: themeManager,
    storage,
    slideshows: slideshow,
    playlist: playlistManager,
  });

  // Gắn các điều khiển UI (PlayerControl) sau khi Player đã sẵn sàng
  const playerControl = new PlayerControl({
    player,
    audio: audioController,
    lyrics: lyricsEngine,
    storage,
  });

  // Chuẩn bị biến global để debug
  window.audioController = audioController;
  window.lyricsEngine = lyricsEngine;
  window.playerData = playerData;
  window.themeManager = themeManager;
  window.slideshow = slideshow;
  window.playlistManager = playlistManager;
  window.player = player;
  window.control = playerControl;
});

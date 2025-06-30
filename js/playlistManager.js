export class PlaylistManager {
  constructor(playlists, songs) {
    this.playlists = playlists;
    this.songs = songs;
    this.trackContainer = document.querySelector(".slideshow-track");
    this.listContainer = document.querySelector(".playlist-list");
    this.headerElement = document.querySelector(".playlist-header-text");

    this.currentPlaylist = [];
  }

  renderSlides() {
    this.trackContainer.innerHTML = "";

    // TODO tạo playlisy yêu thích và playlist tất cả

    this.playlists.forEach((pl) => {
      const slide = document.createElement("div");
      slide.classList.add("slide-item");
      slide.classList.add("playlist-slide-item");
      slide.style.backgroundImage = `url('${pl.imgPath}')`;
      slide.textContent = pl.name;
      slide.dataset.id = pl.id;

      // Click vào slide thì áp dụng playlist
      slide.addEventListener("pointerup", () => this.applyPlaylist(pl.id));

      this.trackContainer.appendChild(slide);
    });
  }

  applyPlaylist(id) {
    const playlist = this.playlists.find((pl) => pl.id === id);
    if (!playlist) return;

    const songs = playlist.songIds
      .map((id) => this.songs.find((s) => s.id === id))
      .filter(Boolean);

    this.currentPlaylist = songs;
    // Cập nhật playlist trong player.js
    if (window.player) {
      window.player.state.currentPlaylist = songs;
      window.player.state.isShuffle = false;
    }

    this.headerElement.textContent = playlist.name;

    this.renderSongList(this.currentPlaylist);

    // Tự động phát bài đầu tiên
    if (songs.length > 0) {
      window.player?.playSong(songs[0]);
    }

    // Khi nhấn chọn playlist xong thì tắt modal đi
    document.querySelector(".modal").classList.remove("show");
  }

  renderSongList(playlist, activeId = -1) {
    this.listContainer.innerHTML = "";

    playlist.forEach((song, index) => {
      const li = document.createElement("li");
      li.classList.add("song-name", "song-name-item");
      // if (index === 0) li.classList.add("active");
      li.dataset.id = song.id;
      // Sự kiện nhấn vào bài hát trong playlist
      li.addEventListener("pointerup", () => {
        // Phát bài hát đã chọn
        window.player?.playSong(song);

        // Khi nhấn phát bài hát đã chọn, cập nhật lại trạng thái active của các bài hát trong danh sách
        const songItems = Array.from(
          this.listContainer.querySelectorAll(".song-name-item")
        );
        const activeItem = songItems.find((item) =>
          item.classList.contains("active")
        );
        activeItem.classList.remove("active");
        li.classList.add("active");
      });

      const title = document.createElement("span");
      title.className = "song-title";
      title.textContent = `${index + 1}. ${song.name}`;

      const duration = document.createElement("span");
      duration.className = "song-duration";
      duration.textContent = song.time;

      li.appendChild(title);
      li.appendChild(duration);
      this.listContainer.appendChild(li);
    });
    this.setActive(activeId);
  }
  // Chỉ định bài hát được active
  setActive(id) {
    const songs = Array.from(this.listContainer.querySelectorAll("li"));
    let isActived = false;
    songs.forEach((song) => {
      if (Number(song.dataset.id) === id) {
        song.classList.add("active");
        isActived = true;
      }
    });

    if (!isActived) {
      songs[0].classList.add("active");
    }
  }

  getCurrentPlaylist() {
    return this.currentPlaylist;
  }
}

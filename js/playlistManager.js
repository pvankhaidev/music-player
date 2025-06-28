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

    this.playlists.forEach((pl) => {
      const slide = document.createElement("div");
      slide.classList.add("slide-item");
      slide.style.backgroundImage = `url('${pl.imgPath}')`;
      slide.textContent = pl.name;
      slide.dataset.id = pl.id;

      // Click vào slide thì áp dụng playlist
      slide.addEventListener("click", () => this.applyPlaylist(pl.id));

      this.trackContainer.appendChild(slide);
    });

    // Mặc định chọn playlist đầu tiên
    if (this.playlists.length > 0) {
      this.applyPlaylist(this.playlists[0].id);
    }
  }

  applyPlaylist(id) {
    const playlist = this.playlists.find((pl) => pl.id === id);
    if (!playlist) return;

    const songs = playlist.songIds
      .map((id) => this.songs.find((s) => s.id === id))
      .filter(Boolean);

    this.currentPlaylist = songs;

    this.headerElement.textContent = playlist.name;

    this.renderSongList();

    // Tự động phát bài đầu tiên
    if (songs.length > 0) {
      window.player?.playSong(songs[0]);
    }
  }

  renderSongList() {
    this.listContainer.innerHTML = "";

    this.currentPlaylist.forEach((song, index) => {
      const li = document.createElement("li");
      li.classList.add("song-name", "song-name-item");
      if (index === 0) li.classList.add("active");
      li.dataset.id = song.id;

      li.addEventListener("click", () => {
        window.player?.playSong(song);
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
  }

  getCurrentPlaylist() {
    return this.currentPlaylist;
  }
}

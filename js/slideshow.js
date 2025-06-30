// slideshow.js
export class Slideshow {
  constructor(options = {}) {
    // Lấy các phần tử DOM cần thiết
    this.container = document.querySelector(".slideshow");
    this.track = this.container.querySelector(".slideshow-track");
    this.slideItems = this.container.querySelectorAll(".slide-item");
    this.paginationDots = [];
    this.prevBtn = this.container.querySelector(".prev");
    this.nextBtn = this.container.querySelector(".next");

    // Lấy config từ options truyền vào
    this.transitionTime = options.transitionTime || 0.3;
    this.autoPlayInterval = options.autoPlayInterval || 3000;
  }

  init() {
    this.setupDOM(); // Tạo pagination và gán style ban đầu
    this.bindEvents(); // Gắn sự kiện click, hover
    this.setupAutoPlay(); // Thiết lập tự chạy slideshow
  }

  setupDOM() {
    const slideCount = this.slideItems.length;
    this.track.style.transition = `transform ${this.transitionTime}s ease`;

    // Tạo các chấm pagination
    const pagination = document.createElement("div");
    pagination.className = "slideshow-pagination";

    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement("span");
      dot.className = "pagination-dot";
      if (i === 0) dot.classList.add("active"); // dot đầu tiên active
      pagination.appendChild(dot);
    }

    this.container.appendChild(pagination);
    this.paginationDots = pagination.querySelectorAll(".pagination-dot");
  }

  bindEvents() {
    // Gắn sự kiện cho nút prev và next
    this.prevBtn?.addEventListener("pointerup", () => this.handleSlide("prev"));
    this.nextBtn?.addEventListener("pointerup", () => this.handleSlide("next"));

    // Dừng autoplay khi hover chuột
    this.container.addEventListener("pointerenter", () => {
      this.container.dataset.autoplay = "false";
    });

    // Tiếp tục autoplay khi rời chuột
    this.container.addEventListener("pointerleave", () => {
      this.container.dataset.autoplay = "true";
    });

    this.container.dataset.autoplay = "true";
  }

  setupAutoPlay() {
    // Tự động click nút "next" sau mỗi khoảng thời gian
    setInterval(() => {
      if (this.container.dataset.autoplay === "true") {
        this.nextBtn?.dispatchEvent(new Event("pointerup"));
      }
    }, this.autoPlayInterval);
  }

  handleSlide(direction) {
    const track = this.track;
    const slideItems = this.container.querySelectorAll(".slide-item");
    const paginationDots = this.paginationDots;
    const length = paginationDots.length;

    if (track.dataset.animating === "true") return; // Đang chạy animation thì bỏ qua

    const activeDot = this.container.querySelector(".pagination-dot.active");
    const index = Array.from(paginationDots).indexOf(activeDot);
    const nextIndex = (index + 1) % length;
    const prevIndex = (index + length - 1) % length;
    const lastItem = slideItems[length - 1].cloneNode(true);
    const firstItem = slideItems[0].cloneNode(true);

    activeDot.classList.remove("active");

    // ==== XỬ LÝ KHI BẤM NEXT ====
    if (direction === "next") {
      paginationDots[nextIndex].classList.add("active");
      track.dataset.animating = "true";

      // Nếu từ cuối quay về đầu
      if (nextIndex === 0) {
        track.appendChild(firstItem);
        track.style.transition = `transform ${this.transitionTime}s ease`;
        track.style.transform = `translateX(-${length * 100}%)`;

        // Khi animation kết thúc, reset về trạng thái ban đầu
        track.addEventListener(
          "transitionend",
          function handler() {
            track.removeEventListener("transitionend", handler);
            track.style.transition = "none";

            requestAnimationFrame(() => {
              track.style.transform = `translateX(0%)`;
              track.removeChild(firstItem);
              requestAnimationFrame(() => {
                track.style.transition = `transform ${this.transitionTime}s ease`;
                track.dataset.animating = "false";
              });
            });
          }.bind(this),
          { once: true }
        );
      } else {
        // Chuyển slide bình thường
        track.style.transition = `transform ${this.transitionTime}s ease`;
        track.style.transform = `translateX(-${nextIndex * 100}%)`;

        track.addEventListener(
          "transitionend",
          function handler() {
            track.removeEventListener("transitionend", handler);
            track.dataset.animating = "false";
          },
          { once: true }
        );
      }

      // ==== XỬ LÝ KHI BẤM PREV ====
    } else if (direction === "prev") {
      paginationDots[prevIndex].classList.add("active");
      track.dataset.animating = "true";

      // Nếu từ đầu quay về cuối
      if (prevIndex === length - 1) {
        track.insertBefore(lastItem, track.firstChild);
        track.style.transition = "none";
        track.style.transform = `translateX(-100%)`;

        // Buộc trình duyệt reflow để nhận transform mới
        void track.offsetWidth;

        track.style.transition = `transform ${this.transitionTime}s ease`;
        track.style.transform = `translateX(0%)`;

        track.addEventListener(
          "transitionend",
          function handler() {
            track.removeEventListener("transitionend", handler);
            track.style.transition = "none";

            requestAnimationFrame(() => {
              track.removeChild(lastItem);
              track.style.transform = `translateX(-${(length - 1) * 100}%)`;

              requestAnimationFrame(() => {
                track.style.transition = `transform ${this.transitionTime}s ease`;
                track.dataset.animating = "false";
              });
            });
          },
          { once: true }
        );
      } else {
        // Chuyển slide bình thường
        track.style.transition = `transform ${this.transitionTime}s ease`;
        track.style.transform = `translateX(-${prevIndex * 100}%)`;

        track.addEventListener(
          "transitionend",
          function handler() {
            track.removeEventListener("transitionend", handler);
            track.dataset.animating = "false";
          },
          { once: true }
        );
      }
    }
  }
}

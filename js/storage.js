export class Storage {
  // Mặc định là localStorage, hoặc tùy ý truyền vào
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  // Lưu dữ liệu vào storage với setItem
  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Xử lý lỗi ngoại lệ
      console.warn("Không thể lưu:", e);
    }
  }

  // Đọc dữ liệu từ storage với getItem
  get(key, defaultValue = null) {
    try {
      const raw = this.storage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      // Xử lý lỗi ngoại lệ
      console.warn("Không thể đọc:", e);
      // Tả về null
      return defaultValue;
    }
  }

  // Lưu một object vào 1 key (giúp rõ ý)
  setObject(key, obj) {
    this.set(key, obj);
  }

  // Lấy một object từ key, nếu không có trả về defaultValue (mặc định là {})
  getObject(key, defaultValue = {}) {
    return this.get(key, defaultValue);
  }

  // Xóa dữ liệu khỏi storage với removeItem và key
  remove(key) {
    this.storage.removeItem(key);
  }

  // Xóa toàn bộ dữ liệu trong storage, nguy hiểm
  clearAll() {
    this.storage.clear();
  }
}

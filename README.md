# Hướng Dẫn Thiết Lập Và Deploy Game "Làm Sạch Đại Dương"

## 1. Cấu Trúc Thư Mục
Dự án đã được tạo thành công tại `C:\Users\dangq\.gemini\antigravity\scratch\game-nhat-rac` với cấu trúc sau:
```text
game-nhat-rac/
│
├── index.html        # Giao diện chính của Game (Home, Lobby, Game, Leaderboard)
├── style.css         # Chứa toàn bộ CSS cực đẹp với hiệu ứng neon, 3D, animation biển
├── script.js         # Xử lý logic Firebase, mảng câu hỏi, và animation ngàm gắp
└── assets/           # Chứa toàn bộ hình ảnh bạn cung cấp
    ├── bangxephang.png
    ├── nhanvat.png
    ├── rac1.png -> rac5.png
    └── ca1.png -> ca10.png
```
*(Ghi chú: Tôi đã đổi tên các file assets trong thư mục thành viết thường không dấu để đảm bảo tương thích tốt nhất trên môi trường Web).*

---

## 2. Hướng Dẫn Cài Đặt Firebase (Realtime Database)

Vì game có tính năng tạo phòng và đồng bộ điểm thời gian thực, bạn cần thiết lập Firebase:

### Bước 1: Tạo dự án Firebase
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Đăng nhập bằng tài khoản Google và nhấn **"Create a project"** (Tạo dự án).
3. Đặt tên dự án (ví dụ: `game-nhat-rac`), bỏ qua Google Analytics và nhấn **Create Project**.

### Bước 2: Kích hoạt Realtime Database
1. Ở menu bên trái, chọn **Build** -> **Realtime Database**.
2. Nhấn **Create Database**. Chọn server gần nhất (ví dụ: Singapore) và chọn **Start in test mode** -> **Enable**.
3. Chuyển sang tab **Rules**, thay đổi rules thành như sau và nhấn **Publish**:
```json
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```
*(Lưu ý: Đây là rule công khai để test. Trong thực tế, bạn có thể thiết lập rule bảo mật hơn).*

### Bước 3: Lấy Firebase Config
1. Quay lại trang chủ của Firebase (biểu tượng ngôi nhà góc trái).
2. Nhấn vào biểu tượng **Web (</>)** để thêm ứng dụng web.
3. Đặt tên app (vd: `WebGame`) và nhấn **Register app**.
4. Firebase sẽ cấp cho bạn một đoạn `firebaseConfig`. Nó trông giống như thế này:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB-xxxxxxx",
  authDomain: "xxxx.firebaseapp.com",
  databaseURL: "https://xxxx-default-rtdb.firebaseio.com",
  projectId: "xxxx",
  storageBucket: "xxxx.appspot.com",
  messagingSenderId: "12345678",
  appId: "1:xxx:web:xxx"
};
```
5. **Mở file `script.js`** trong thư mục dự án của bạn và **thay thế đoạn `firebaseConfig` giả ở dòng số 6** bằng đoạn config bạn vừa nhận được. Đặc biệt phải có trường `databaseURL`.

---

## 3. Hướng Dẫn Deploy (Đưa Game Lên Mạng)
Cách nhanh nhất và hoàn toàn miễn phí là sử dụng **Vercel** hoặc **Netlify**.

### Cách dùng Vercel:
1. Đăng ký tài khoản tại [vercel.com](https://vercel.com).
2. Tải và cài đặt **Node.js**. Sau đó mở Terminal / Command Prompt và chạy lệnh:
   ```bash
   npm i -g vercel
   ```
3. Mở Terminal tại thư mục `game-nhat-rac` và gõ lệnh:
   ```bash
   vercel
   ```
4. Đăng nhập nếu có yêu cầu. Cứ nhấn `Enter` liên tục cho tất cả các câu hỏi mặc định.
5. Vercel sẽ trả về cho bạn một đường link `.vercel.app`. Giáo viên và học sinh chỉ cần vào link này để chơi chung với nhau!

---

Chúc bạn có những trải nghiệm tuyệt vời với tựa game ý nghĩa này!

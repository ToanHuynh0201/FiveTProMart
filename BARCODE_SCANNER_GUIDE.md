# Hướng dẫn sử dụng tính năng Quét mã vạch

## 🎯 Tổng quan

Tính năng quét mã vạch đã được tích hợp vào trang Bán hàng để giúp nhập liệu nhanh chóng và chính xác hơn.

## ✨ Tính năng mới

### 1. **Nút Quét mã vạch**

-   Nút camera icon ở bên phải thanh tìm kiếm
-   Click vào để mở modal quét mã vạch
-   Hoặc nhấn phím tắt: `Ctrl + B`

### 2. **Modal Quét mã vạch**

-   **2 chế độ:**
    -   📷 **Camera**: Sắp có (đang phát triển)
    -   ⌨️ **Nhập thủ công**: Sẵn sàng sử dụng

### 3. **Chế độ Nhập thủ công**

-   Nhập mã vạch vào ô input
-   Click "Tìm kiếm" hoặc nhấn Enter
-   Hệ thống sẽ tự động tìm và thêm sản phẩm vào giỏ hàng

### 4. **Mã vạch Demo**

Modal cung cấp danh sách mã vạch demo để test:

-   **8934567890123** - Bánh snack bắp cải trộn
-   **8934567890124** - Bánh snack củ cải trộn
-   **8934567890125** - Củ cải vàng
-   **8934567890126** - Củ cải xanh
-   **8934567890127** - Nước ngọt Coca Cola
-   **8934567890128** - Nước suối Lavie
-   **8934567890129** - Mì gói Hảo Hảo

## 🚀 Cách sử dụng

### Phương án 1: Dùng mã vạch demo

1. Vào trang **Bán hàng**
2. Click vào nút 📷 (camera) hoặc nhấn `Ctrl + B`
3. Click vào bất kỳ mã vạch demo nào trong danh sách
4. Sản phẩm sẽ tự động được thêm vào giỏ hàng!

### Phương án 2: Nhập thủ công

1. Mở modal quét mã vạch
2. Nhập mã vạch vào ô input (ví dụ: 8934567890123)
3. Click "Tìm kiếm" hoặc nhấn Enter
4. Sản phẩm sẽ được thêm vào giỏ

### Phương án 3: Dùng máy quét mã vạch (Khi có thiết bị)

1. Focus vào ô tìm kiếm trên trang Bán hàng
2. Quét mã vạch bằng máy quét
3. Mã vạch sẽ tự động nhập vào
4. Nếu tìm thấy exact match, sản phẩm sẽ tự động thêm vào giỏ

## 💡 Lợi ích

### Tự động phát hiện mã vạch

-   Khi nhập chính xác mã vạch và chỉ có 1 kết quả
-   Hệ thống tự động thêm sản phẩm vào giỏ hàng
-   Hiển thị thông báo thành công

### Tốc độ cao

-   Không cần click nhiều lần
-   Phù hợp cho bán hàng tại quầy
-   Giảm thiểu sai sót

### Thân thiện với người dùng

-   Giao diện đẹp, dễ sử dụng
-   Có tooltip hướng dẫn
-   Phím tắt nhanh (Ctrl+B)

## 🎨 Giao diện

### Search Bar cải tiến

```
[➕ Thêm] [🔍 Tìm kiếm hoặc quét mã vạch (Ctrl+B)... 📷]
```

### Modal Quét mã vạch

```
╔══════════════════════════════════════╗
║  📷 Quét mã vạch                  ✕  ║
╠══════════════════════════════════════╣
║  [📷 Camera] [⌨️ Nhập thủ công]      ║
║                                      ║
║  Nhập mã vạch:                       ║
║  [________________]                  ║
║  [✓ Tìm kiếm]                        ║
║                                      ║
║  Mã vạch demo (Click để test): 🟣   ║
║  ┌──────────────────────────────┐   ║
║  │ Bánh snack bắp cải trộn      │   ║
║  │ 8934567890123            ✓   │   ║
║  ├──────────────────────────────┤   ║
║  │ Bánh snack củ cải trộn       │   ║
║  │ 8934567890124            ✓   │   ║
║  └──────────────────────────────┘   ║
║                                      ║
║  💡 Mẹo: Khi có máy quét mã vạch,   ║
║  chỉ cần focus vào ô input và quét  ║
╚══════════════════════════════════════╝
```

## 📊 Demo cho báo cáo

### Kịch bản demo

1. **Mở trang Bán hàng**
2. **Nhấn Ctrl+B** để mở modal nhanh
3. **Click vào mã demo đầu tiên**: "Bánh snack bắp cải trộn"
4. **Quan sát**:
    - Modal tự đóng
    - Sản phẩm xuất hiện trong giỏ hàng
    - Thông báo "Quét thành công!" hiện ra
5. **Lặp lại** với các sản phẩm khác để thấy tốc độ nhập liệu

### Điểm nhấn khi demo

-   ⚡ **Nhanh**: Click 1 lần, sản phẩm vào giỏ
-   🎯 **Chính xác**: Tìm đúng sản phẩm qua mã vạch
-   🎨 **Đẹp**: Giao diện hiện đại, mượt mà
-   🔥 **Tiện lợi**: Phím tắt Ctrl+B, tooltip hướng dẫn
-   🚀 **Sẵn sàng**: Có thể dùng với máy quét mã vạch thật

## 🔮 Tương lai

### Tính năng sẽ phát triển

-   [ ] Quét bằng camera (WebRTC)
-   [ ] Hỗ trợ QR code
-   [ ] Lịch sử mã vạch đã quét
-   [ ] Quét nhiều mã cùng lúc
-   [ ] Tích hợp với máy in hóa đơn

## 🎓 Kết luận

Tính năng quét mã vạch giúp:

-   ✅ Tăng tốc độ bán hàng
-   ✅ Giảm sai sót nhập liệu
-   ✅ Nâng cao trải nghiệm người dùng
-   ✅ Chuẩn bị cho việc sử dụng máy quét thật

---

**Lưu ý**: Hiện tại đang sử dụng mock data, khi tích hợp API thật, chỉ cần đổi service là có thể sử dụng ngay!

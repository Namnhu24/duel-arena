# Cập nhật Yu-Gi-Oh! Simulator

- Sửa ID hình ảnh Prank-Kids Dropsies sang passcode 557251 và cập nhật mô tả hiệu ứng.
- Bổ sung bộ bài HERO với Elemental HERO, Masked HERO, Vision HERO và Xtra HERO cùng một số Spell hỗ trợ.
- Monster Reborn mở popup để người chơi chọn quái thú từ Mộ của hai bên thay vì tự chọn lá có ATK cao nhất.
- Prank-Kids Dropsies mở popup để chọn Prank-Kids từ tay hoặc Deck, sau đó mới hồi 1000 LP và Triệu hồi Đặc biệt ở tư thế Phòng thủ.
- Elemental HERO Honest Neos mở popup chọn HERO trên sân để tăng 2500 ATK.
- Luôn hiển thị bài trên tay của người chơi; bài trên tay đối thủ chỉ hiện mặt sau và số lượng.
- Thêm thanh trạng thái hiển thị đối thủ đang chơi/đang chờ và phase hiện tại.

Lưu ý: Đây là game mô phỏng đang phát triển, chưa phải engine luật Yu-Gi-Oh! đầy đủ. Các hiệu ứng HERO mới có dữ liệu tên/ảnh/thuộc tính/mô tả; không phải mọi hiệu ứng đã được mô phỏng tự động.

## Bản vá 2026-10-16 — LP CPU, hiệu ứng và Ma pháp Môi trường
- CPU không còn chủ động tấn công quái thú Tư thế Tấn công có ATK cao hơn nếu không có mục tiêu an toàn; không có quái thú để tấn công không tự gây mất LP.
- Khi CPU chiến đấu với quái thú ở Tư thế Phòng thủ, so sánh với DEF và không gây sát thương LP thông thường.
- Kích hoạt Ma pháp Môi trường mới sẽ đưa lá Môi trường cũ của cùng người chơi xuống Mộ trước khi đặt lá mới vào vùng Môi trường.
- Hiệu ứng Spell/Monster có callback được xử lý trên bản sao trạng thái rồi ghi kết quả trở lại React state, tránh trường hợp chỉ hiện log nhưng thay đổi bài/LP/ATK/DEF không được cập nhật.
- Lưu ý: cơ chế thực thi chung đã được sửa, nhưng các lá chỉ có mô tả chữ mà chưa có callback riêng trong `cardDatabase.ts` vẫn cần được lập trình hiệu ứng riêng; bản vá này không tuyên bố mọi lá trong cơ sở dữ liệu đã mô phỏng đầy đủ luật chính thức.

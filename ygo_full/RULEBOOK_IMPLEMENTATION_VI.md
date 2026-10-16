# Rule Book – quy tắc được bổ sung cho Deck Builder

Tài liệu tham chiếu dựa trên các bài hướng dẫn Yu-Gi-Oh! Việt Nam được người dùng cung cấp (Phần 5–9). Đây là checklist triển khai, không phải tuyên bố rằng game đã trở thành simulator đầy đủ luật Master Duel.

## 1. Cost và gửi bài bằng hiệu ứng
- Cost được trả khi kích hoạt/khởi động hiệu ứng và không được hoàn trả chỉ vì activation/effect bị negate.
- “Discard/Pay/Tribute/Detach” trong phần trước dấu chấm phẩy thường là cost; nội dung sau dấu chấm phẩy là xử lý khi resolve. Cần đọc text cụ thể, không suy luận chỉ dựa vào dấu câu trong mọi trường hợp.
- Gửi bài xuống GY bằng cost khác với gửi xuống GY bởi effect; các hiệu ứng “if sent by card effect” không kích hoạt chỉ vì trả cost.

## 2. Các loại negate (không được gộp chung)
- **Negate effect:** hiệu ứng resolve nhưng không áp dụng; không tự động phủ nhận activation.
- **Negate activation:** activation được coi như chưa thành công; xử lý riêng việc gửi Spell/Trap xuống GY sau Chain.
- **Negate Summon:** ngăn một Summon xảy ra thành công; khác với negate hiệu ứng đã resolve để triệu hồi quái thú.
- **Negate attack:** ngăn trận chiến tiếp tục sau khi attack đã được tuyên bố; quái thú vẫn đã tuyên bố attack trong lượt đó.
- Phá hủy lá bài không tự động negate effect; nếu effect đã được kích hoạt thì nó vẫn có thể resolve trừ khi bị negate hoặc text/ruling quy định khác.

## 3. “Once per turn”
- **Soft OPT:** giới hạn theo từng bản sao/instance trên sân hoặc khu vực áp dụng; bản sao khác có thể dùng nếu text không đặt giới hạn theo tên.
- **Hard OPT:** text như “You can only use this effect of [name] once per turn” thường giới hạn theo tên lá bài và hiệu ứng, kể cả nhiều bản sao.
- Phân biệt “use” với “activate”: một activation bị negate có thể vẫn tiêu hao giới hạn “use”; giới hạn “activate” được xử lý theo wording cụ thể.
- Mỗi effect riêng trên cùng một lá bài có thể có giới hạn riêng hoặc chung; phải đọc toàn bộ text.

## 4. “If” và “When”
- Optional “When ...: you can” có thể miss timing nếu điều kiện kích hoạt không còn là sự kiện cuối cùng xảy ra.
- Optional “If ...: you can” thường không bị giới hạn bởi sự kiện cuối cùng theo cách đó.
- Đây là quy tắc khái quát; các trigger bắt buộc, trigger trong Damage Step và rulings riêng cần xử lý riêng.

## 5. Hành động hợp lệ
- Kiểm tra lượt, phase, vị trí lá bài, mục tiêu hợp lệ, vùng trống, điều kiện triệu hồi, số lần sử dụng effect và giới hạn theo tên trước khi cho phép hành động.
- Khi trả cost xong mới kiểm tra kết quả resolve; không rollback cost nếu Chain bị negate.
- Phá hủy, banish, gửi GY, negate activation, negate effect và negate attack phải là các kết quả khác nhau trong log/state.

## 6. Các lá bài ví dụ trong cơ sở dữ liệu
Đã thêm/đối chiếu các ví dụ có passcode xác định: Ghost Belle & Haunted Mansion, Chain Hole, Skill Drain, Infinite Impermanence, Solemn Strike, Dimensional Prison, Divine Wrath, Tearlaments Merrli, Ultimate Offering và Call of the Grave. Artwork dùng passcode YGOPRODeck; cần kiểm thử trực quan từng ảnh và kiểm thử effect theo từng tình huống trước khi coi là hoàn chỉnh.

## Giới hạn hiện tại
Các primitive trong `src/utils/ruleEngine.ts` cung cấp cách biểu diễn riêng cho OPT, timing và negate. Chúng không tự động biến mọi callback của `cardDatabase.ts` thành hiệu ứng mô phỏng chính xác. Để đạt độ chính xác Master Duel, cần tiếp tục nối từng primitive vào resolver/Chain, bổ sung lựa chọn mục tiêu và kiểm thử từng lá bài. Không nên tuyên bố full rules support chỉ dựa trên việc hiển thị đúng card text.

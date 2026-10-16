# Cập nhật luật – 16/10/2026

- Thêm `src/utils/ruleEngine.ts`: primitive riêng cho soft/hard once per turn, kiểm tra timing IF/WHEN và phân biệt 4 nhóm negate (effect, activation, summon, attack).
- Thêm `RULEBOOK_IMPLEMENTATION_VI.md` mô tả cost vs send by effect, negate, once per turn và timing.
- Thêm các lá bài ví dụ từ hướng dẫn: Ghost Belle & Haunted Mansion, Chain Hole, Skill Drain, Infinite Impermanence, Solemn Strike, Dimensional Prison, Divine Wrath, Tearlaments Merrli, Ultimate Offering, Called by the Grave.
- Lưu ý: các helper luật chưa được nối đầy đủ vào mọi đường xử lý của duel resolver; các lá bài mới hiện có dữ liệu mô tả và ảnh theo passcode, nhưng không phải tất cả hiệu ứng đều đã được mô phỏng hoàn chỉnh.

SSI-DCA-BOT

# Todo list

- Mục tiêu của BOT là DCA chứng khoán
- Build phần quản lý order ở client
- Check balance trước khi đặt orders
- Kiểm soát số lượng mua bán trong ngày
- Kiểm tra giá tham chiếu (giá đã dùng để tạo các order hiện tại) và giá hiện tại để quyết định có cần phải trigger lại order mới hay không
  - Nếu delta > 0.5%, đặt lại order
  - Nếu tới giờ, nhưng delta vẫn không vượt quá 0.5% thì không cần phải đặt lại orders
- Load dynamic trading strategy config from other service

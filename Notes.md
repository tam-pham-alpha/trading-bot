# SSI-DCA-BOT

Là bot tự động trade stock, với mục tiêu tạo ra ít nhất 5% lợi nhuận thụ động mỗi tháng.


## Todo list

- Mục tiêu của BOT là DCA chứng khoán
- Hỗ trợ multiple stocks
- Hỗ trợ option chỉ bán khi giá hiện tại >= delta (%) cho sẵn
- Kiểm tra khi nào thì stock có thể bán (onHand)

- Build phần quản lý order ở client
- Check balance trước khi đặt orders
- Kiểm soát số lượng mua bán trong ngày
- Kiểm tra giá tham chiếu (giá đã dùng để tạo các order hiện tại) và giá hiện tại để quyết định có cần phải trigger lại order mới hay không
  - Nếu delta > 0.5%, đặt lại order
  - Nếu tới giờ, nhưng delta vẫn không vượt quá 0.5% thì không cần phải đặt lại orders
- Load dynamic trading strategy config from other service

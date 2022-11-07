# SSI-DCA-BOT

Là bot tự động trade stock, với mục tiêu tạo ra ít nhất 10% lợi nhuận thụ động mỗi quý.

Dự kiến
- mỗi lệnh lời: 0.5%
- Giả sử giá trị mỗi lệnh là 5.000.000, thì mỗi lệnh sẽ nhận được 25.000
- Mong muốn doanh thu 10.000.000, tương ứng với 400 lệnh mỗi tháng, 20 lệnh mỗi ngày.
- Có nghĩa là mình cần khoảng 200.000.000 mỗi tháng (để lời 5%)
- Thêm tính năng mua giá trị trường nếu giá đạt delta% (2.5%) so với avgPrice
- Fix connection abort issue
- Apply ticksize
- Get ceiling + floor prices (GetDailyIndex, GetStockPrice)
- Đặt lệnh lại sau khi khớp lệnh


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

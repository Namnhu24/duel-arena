# Sử dụng image chính thức của Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Sao chép các tệp cấu hình quản lý gói
COPY package.json bun.lock* ./

# Cài đặt dependencies bằng Bun
RUN bun install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Tiến hành build ứng dụng Front-end (Vite)
RUN bun run build

# Mở cổng 3000 để truy cập web và websocket
EXPOSE 3000

# Khởi chạy server WebSocket kết hợp phục vụ web
CMD ["bun", "run", "start"]
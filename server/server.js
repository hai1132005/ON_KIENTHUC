// server/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Thay bằng user của bạn
    password: '123456',      // Thay bằng password của bạn
    database: 'phone_store'
});

db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối MySQL: ' + err.stack);
        return;
    }
    console.log('Đã kết nối thành công với MySQL Database.');
});

// --- API 1: ĐĂNG KÝ ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Đăng ký thành công!' });
    });
});

// --- API 2: ĐĂNG NHẬP ---
// Thay thế đoạn API login cũ trong server.js của bạn:
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT username, role FROM users WHERE username = ? AND password = ?"; // Lấy thêm cột role
    
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            res.json({ 
                message: 'Đăng nhập thành công!', 
                user: { 
                    username: results[0].username, 
                    role: results[0].role // Trả quyền hạn về Frontend xử lý
                } 
            });
        } else {
            res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu!' });
        }
    });
});

// --- API 3: LƯU ĐƠN HÀNG KHI MUA SẮM ---
app.post('/api/checkout', (req, res) => {
    const { username, cart, totalPrice } = req.body;

    // 1. Chèn vào bảng orders trước
    const sqlOrder = "INSERT INTO orders (username, total_price) VALUES (?, ?)";
    db.query(sqlOrder, [username, totalPrice], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const orderId = result.insertId; // Lấy ID của đơn hàng vừa sinh ra

        // 2. Chèn danh sách sản phẩm vào order_details
        const sqlDetails = "INSERT INTO order_details (order_id, product_id, product_name, price, quantity) VALUES ?";
        const values = cart.map(item => [orderId, item.id, item.name, item.price, item.quantity]);

        db.query(sqlDetails, [values], (errDetail) => {
            if (errDetail) return res.status(500).json({ error: errDetail.message });
            res.json({ message: 'Đặt hàng và lưu vào MySQL thành công!' });
        });
    });
});

// --- API: TIẾP NHẬN SẢN PHẨM MỚI TỪ TRANG ADMIN VÀ LƯU VÀO MYSQL ---
app.post('/api/products', (req, res) => {
    const { name, price, brand, img, specs } = req.body;
    
    // Câu lệnh SQL chèn dữ liệu vào bảng sản phẩm (đầy đủ các cột thông số cấu hình)
    const sql = `INSERT INTO products (name, price, brand, img, screen, chip, ram, storage) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                 
    const values = [
        name, 
        price, 
        brand, 
        img, 
        specs.screen, 
        specs.chip, 
        specs.ram, 
        specs.storage
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Lỗi MySQL khi chèn sản phẩm:", err);
            return res.status(500).json({ error: "Lỗi lưu trữ cơ sở dữ liệu!" });
        }
        // Trả về phản hồi thành công kèm theo ID tự động tăng của sản phẩm đó
        res.json({ 
            message: 'Thêm sản phẩm mới vào hệ thống MySQL thành công!', 
            productId: result.insertId 
        });
    });
});

app.listen(3000, () => console.log('Backend Server đang chạy ở port 3000'));
// ==========================================================================
// 1. CHỨC NĂNG ĐĂNG KÝ
// ==========================================================================
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // --- Kiểm tra mật khẩu khớp ---
        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            // --- Gửi thông tin đăng ký lên backend ---
            const res = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            alert(data.message);

            // --- Đăng ký thành công -> Chuyển sang trang Đăng nhập ---
            if (res.ok) {
                window.location.href = 'login.html';
            }

        } catch (err) {
            alert("Lỗi kết nối server đăng ký!");
            console.error(err);
        }
    });
}

// ==========================================================================
// 2. CHỨC NĂNG ĐĂNG NHẬP (PHÂN QUYỀN)
// ==========================================================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại!");

            // CẢI TIẾN: Lưu tách rời 2 chuỗi text thuần túy để trình duyệt không bị lỗi ghi nhớ
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('role', data.user.role);
            
            alert(data.message);

            // Kiểm tra quyền hạn trực tiếp để điều hướng trang
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html'; // Chuyển thẳng vào trang quản lý
            } else {
                window.location.href = 'index.html'; // Vào trang mua sắm
            }

        } catch (err) {
            alert(err.message);
            console.error(err);
        }
    });
}
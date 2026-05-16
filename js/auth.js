// =========================
// 1. ĐĂNG KÝ
// =========================
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // --- Validate ---
        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        try {
            // --- Gửi lên backend ---
            const res = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            alert(data.message);

            // --- Thành công thì chuyển trang ---
            if (res.ok) {
                window.location.href = 'login.html';
            }

        } catch (err) {
            alert("Lỗi kết nối server!");
            console.error(err);
        }
    });
}



// =========================
// 2. ĐĂNG NHẬP
// =========================
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

            if (!res.ok) {
                throw new Error(data.message);
            }

            // --- Lưu user ---
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            alert(data.message);

            // --- Chuyển trang ---
            window.location.href = 'index.html';

        } catch (err) {
            alert(err.message || "Đăng nhập thất bại!");
        }
    });
}
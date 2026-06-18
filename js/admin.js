// ==========================================================================
// 1. KIỂM TRA BẢO MẬT & PHÂN QUYỀN TRUY CẬP (GATEKEEPER)
// ==========================================================================
function checkAdminPermission() {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    // Nếu không có thông tin đăng nhập HOẶC quyền hạn không phải là admin
    if (!username || role !== 'admin') {
        alert("Cảnh báo bảo mật: Bạn không có quyền truy cập khu vực quản trị!");
        window.location.href = 'index.html'; // Đẩy tài khoản thường ra trang chủ ngay lập tức
    } else {
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) adminNameElement.innerText = `Quản trị viên: ${username}`;
    }
}

// Chạy kiểm tra bảo mật ngay lập tức khi file script nạp vào trang
checkAdminPermission();

// ==========================================================================
// 2. BIẾN TOÀN CỤC & TẢI SẢN PHẨM TỪ MYSQL
// ==========================================================================
let products = [];
const tableBody = document.getElementById('adminProductTable');
const addModal = document.getElementById('addProductModal');

// Hàm lấy dữ liệu thật từ Backend để đổ vào bảng quản lý
async function loadAdminProducts() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        if (!res.ok) throw new Error("Không thể tải kho hàng");
        
        products = await res.json();
        renderAdminTable();
    } catch (err) {
        console.error("Lỗi nạp kho hàng quản trị:", err);
    }
}

// Hàm render mảng sản phẩm ra các hàng (tr) của bảng HTML
function renderAdminTable() {
    if (!tableBody) return;
    
    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">Kho hàng trống. Vui lòng bấm nút thêm sản phẩm!</td></tr>`;
        return;
    }

    tableBody.innerHTML = products.map(item => `
        <tr>
            <td><b>#${item.id}</b></td>
            <td><img src="${item.img ? item.img.trim() : 'https://via.placeholder.com/50'}" onerror="this.src='https://via.placeholder.com/50';"></td>
            <td><span style="font-weight:700; color:#2d3436;">${item.name}</span></td>
            <td><span class="product-brand" style="font-size:0.85rem; background:#f1f2f6; padding:4px 8px; border-radius:4px;">${item.brand}</span></td>
            <td style="color: #e74c3c; font-weight: 800;">${item.price.toLocaleString('vi-VN')}₫</td>
            <td>
                <button class="btn-action-edit" onclick="editProductPrice(${item.id})">Sửa giá</button>
                <button class="btn-action-delete" onclick="deleteProductFake(${item.id})">Xóa</button>
            </td>
        </tr>
    `).join('');
}

// ==========================================================================
// 3. ĐIỀU KHIỂN ĐÓNG MỞ MODAL & XỬ LÝ SUBMIT FORM THÊM
// ==========================================================================
function openAddModal() { if (addModal) addModal.style.display = "flex"; }
function closeAddModal() { if (addModal) addModal.style.display = "none"; }

// Xử lý sự kiện khi Admin nhấn nút "Lưu vào MySQL Database"
const addProductForm = document.getElementById('addProductForm');

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Ngăn chặn trang web bị tải lại tự động

        // 1. Thu thập dữ liệu từ các ô nhập và xóa khoảng trắng thừa bằng .trim()
        const productData = {
            name: document.getElementById('addName').value.trim(),
            price: parseInt(document.getElementById('addPrice').value),
            brand: document.getElementById('addBrand').value.trim(),
            img: document.getElementById('addImg').value.trim(),
            specs: {
                screen: document.getElementById('specScreen').value.trim() || "Chưa rõ",
                chip: document.getElementById('specChip').value.trim() || "Chưa rõ",
                ram: document.getElementById('specRam').value.trim() || "Chưa rõ",
                storage: document.getElementById('specStorage').value.trim() || "Chưa rõ"
            }
        };

        try {
            // 2. Bắn dữ liệu bằng Fetch API lên API của Node.js Server
            const res = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            const data = await res.json();
            alert(data.message); // Hiển thị thông báo kết quả trả về từ Server

            if (res.ok) {
                addProductForm.reset(); // Xóa sạch dữ liệu vừa gõ trong Form
                closeAddModal();        // Ẩn cửa sổ Pop-up thêm sản phẩm
                
                // 3. Tải lại danh sách sản phẩm mới từ database để cập nhật giao diện bảng Admin
                if (typeof loadAdminProducts === "function") {
                    loadAdminProducts(); 
                } else {
                    location.reload();
                }
            }
        } catch (err) {
            alert("Lỗi kết nối! Không thể gửi sản phẩm tới cơ sở dữ liệu.");
            console.error("Lỗi Fetch Admin:", err);
        }
    });
}

// ==========================================================================
// 4. CÁC HÀNH ĐỘNG KHÁC (SỬA GIÁ, XÓA, ĐĂNG XUẤT)
// ==========================================================================
function editProductPrice(id) {
    const target = products.find(p => p.id === id);
    const newPrice = prompt(`Nhập giá mới cho ${target.name}:`, target.price);
    if (newPrice) {
        alert(`Kích hoạt yêu cầu sửa giá ID #${id} thành ${parseInt(newPrice).toLocaleString()}₫. (Logic cập nhật MySQL sẽ liên kết ở bài học sau).`);
    }
}

function deleteProductFake(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
        alert(`Kích hoạt lệnh xóa sản phẩm ID #${id} khỏi MySQL.`);
    }
}

function adminLogout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

// KHỞI CHẠY: Tự động nạp kho hàng khi trang admin mở ra
window.onload = () => {
    loadAdminProducts();
};
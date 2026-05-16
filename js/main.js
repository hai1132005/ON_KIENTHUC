// ==========================================================================
// 1. BIẾN TOÀN CỤC (GLOBAL STATE) & KHỞI TẠO DOM
// ==========================================================================
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('quickViewModal');

let cart = JSON.parse(localStorage.getItem('CART')) || [];

// ==========================================================================
// 2. HIỂN THỊ SẢN PHẨM (RENDER UI)
// ==========================================================================

// Hàm hiển thị danh sách sản phẩm ra màn hình chính
function displayProducts(list) {
    if (!productGrid) return; // Tránh lỗi nếu không tìm thấy phần tử HTML

    productGrid.innerHTML = list.map(item => {
        // Tính % giảm giá dựa trên giá gốc và giá khuyến mãi
        const discountPercentage = item.discountPrice 
            ? Math.round(((item.discountPrice - item.price) / item.discountPrice) * 100) 
            : 0;

        return `
        <div class="product-card">
            ${discountPercentage > 0 ? `<span class="discount-badge">-${discountPercentage}%</span>` : ''}

            <div class="product-img-wrapper">
                <img src="${item.img}" alt="${item.name}">
            </div>

            <div class="product-info">
                <p class="product-brand">${item.brand}</p>
                <h3 class="product-name">${item.name}</h3>

                <div class="product-price-row">
                    <span class="price-current">${item.price.toLocaleString('vi-VN')}₫</span>
                    ${item.discountPrice ? `<span class="price-old">${item.discountPrice.toLocaleString('vi-VN')}₫</span>` : ''}
                </div>

                <div class="product-action">
                    <button class="btn-add-cart" onclick="addToCart(${item.id})">
                        <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
                    </button>

                    <button class="btn-quick-view" onclick="openQuickView(${item.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ==========================================================================
// 3. BỘ LỌC VÀ TÌM KIẾM (FILTERS & SEARCH)
// ==========================================================================

// Lọc sản phẩm theo thanh trượt mức giá tối đa
function filterByPrice() {
    const maxPriceMillion = document.getElementById('priceRange').value;
    const maxPriceVND = maxPriceMillion * 1000000;

    const filtered = products.filter(p => p.price <= maxPriceVND);
    displayProducts(filtered);

    // Hiển thị thông báo trống nếu không tìm thấy kết quả phù hợp
    if (filtered.length === 0) {
        productGrid.innerHTML = `
            <p style="padding: 20px; color: #888; text-align: center; width: 100%;">
                Không có sản phẩm nào dưới ${maxPriceMillion} triệu.
            </p>
        `;
    }
}

// Lọc sản phẩm theo danh mục thương hiệu ở Sidebar
function filterProduct(brand) {
    if (brand === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p =>
            p.brand.trim().toLowerCase() === brand.trim().toLowerCase()
        );
        displayProducts(filtered);
    }
}

// Lắng nghe sự kiện gõ phím trên thanh tìm kiếm
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(value)
        );
        displayProducts(filtered);
    });
}

// ==========================================================================
// 4. QUẢN LÝ GIỎ HÀNG (CART MANAGEMENT)
// ==========================================================================

// Thêm sản phẩm vào mảng giỏ hàng và đồng bộ hóa với localStorage
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const itemInCart = cart.find(item => item.id === id);

    if (itemInCart) {
        itemInCart.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('CART', JSON.stringify(cart));
    updateCartCount();

    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
}

// Cập nhật số lượng hiển thị trên Badge icon giỏ hàng ở Header
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.innerText = count;
    }
}

// ==========================================================================
// 5. TÍNH NĂNG XEM NHANH (QUICK VIEW MODAL)
// ==========================================================================

// Mở cửa sổ Modal và đổ thông tin chi tiết của sản phẩm được chọn
function openQuickView(id) {
    if (!modal) return;
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Gán dữ liệu động vào cấu trúc HTML của Modal
    document.getElementById('modalProductImg').src = product.img;
    document.getElementById('modalProductImg').alt = product.name;
    document.getElementById('modalProductBrand').innerText = product.brand;
    document.getElementById('modalProductName').innerText = product.name;
    document.getElementById('modalProductPrice').innerText = product.price.toLocaleString('vi-VN') + '₫';

    // Tạo nút bấm mua hàng riêng biệt tích hợp bên trong Modal
    document.getElementById('modalActionContainer').innerHTML = `
        <button class="btn-add-cart" style="width: 100%; margin-top: 15px;" onclick="addToCart(${product.id}); closeModal();">
            <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng ngay
        </button>
    `;

    modal.style.display = "flex"; // Kích hoạt hiển thị Modal dạng Flexbox
}

// Đóng cửa sổ Modal xem nhanh
function closeModal() {
    if (modal) modal.style.display = "none";
}

// ==========================================================================
// 6. XỬ LÝ XÁC THỰC NGƯỜI DÙNG (USER AUTHENTICATION)
// ==========================================================================

// Kiểm tra trạng thái phiên đăng nhập hiện tại để cập nhật giao diện Header
function checkLogin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userInfo = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (user) {
        if (userInfo) userInfo.innerText = `Chào, ${user.username}`;
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
    }
}

// Đăng xuất và xóa trạng thái người dùng khỏi bộ nhớ local
function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// ==========================================================================
// 7. KHỞI CHẠY HỆ THỐNG ĐỒNG BỘ (INITIALIZATION)
// ==========================================================================

// Đảm bảo toàn bộ logic được kích hoạt đồng thời khi toàn bộ cây DOM đã nạp xong
window.onload = () => {
    displayProducts(products); // Render toàn bộ kho sản phẩm ban đầu
    updateCartCount();         // Đọc và hiển thị số lượng giỏ hàng cũ (nếu có)
    checkLogin();              // Đồng bộ hóa trạng thái tài khoản trên Header
};

// Đóng Modal khi người dùng nhấn chuột lệch ra ngoài vùng nội dung chính
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
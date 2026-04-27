// 1. LẤY PHẦN TỬ HTML (DOM)
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');

// 2. BIẾN TOÀN CỤC (GLOBAL)
let cart = JSON.parse(localStorage.getItem('CART')) || [];

// 3. HIỂN THỊ SẢN PHẨM

function displayProducts(list) {
    if (!productGrid) return; // tránh lỗi nếu không có HTML

    productGrid.innerHTML = list.map(item => {

        // Tính % giảm giá
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

                    <button class="btn-quick-view">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// 4. TÌM KIẾM SẢN PHẨM
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(value)
        );

        displayProducts(filtered);
    });
}

// 5. LỌC THEO THƯƠNG HIỆU

function filterProduct(brand) {
    if (brand === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p =>
            p.brand.toLowerCase() === brand.toLowerCase()
        );
        displayProducts(filtered);
    }
}

// 6. LỌC THEO GIÁ
function filterByPrice() {
    const maxPriceMillion = document.getElementById('priceRange').value;
    const maxPriceVND = maxPriceMillion * 1000000;

    const filtered = products.filter(p => p.price <= maxPriceVND);

    displayProducts(filtered);

    // Nếu không có sản phẩm
    if (filtered.length === 0) {
        productGrid.innerHTML = `
            <p style="padding: 20px; color: #888;">
                Không có sản phẩm nào dưới ${maxPriceMillion} triệu.
            </p>
        `;
    }
}

// 7. GIỎ HÀNG (CART)

// Thêm sản phẩm vào giỏ
function addToCart(id) {
    const product = products.find(p => p.id === id);
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


// Cập nhật số lượng hiển thị trên icon giỏ hàng
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');

    if (cartCountElement) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.innerText = count;
    }
}

// 8. KHỞI TẠO KHI LOAD TRANG
window.onload = () => {
    displayProducts(products); // hiển thị toàn bộ sản phẩm
    updateCartCount();         // cập nhật số giỏ hàng
};
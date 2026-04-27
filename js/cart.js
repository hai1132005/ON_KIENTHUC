// 1. BIẾN TOÀN CỤC (GLOBAL)
let cart = JSON.parse(localStorage.getItem('CART')) || [];

// 2. LẤY PHẦN TỬ HTML (DOM)
const cartItemsContainer = document.getElementById('cartItems');
const totalPriceElement = document.getElementById('totalPrice');

// 3. HIỂN THỊ GIỎ HÀNG
function renderCart() {

    // Nếu giỏ hàng trống
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <tr>
                <td colspan='5'>Giỏ hàng trống!</td>
            </tr>
        `;
        totalPriceElement.innerText = "0₫";
        return;
    }

    let total = 0;

    // Render từng sản phẩm
    cartItemsContainer.innerHTML = cart.map((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.price.toLocaleString()}₫</td>

                <td>
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    ${item.quantity}
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </td>

                <td>${subtotal.toLocaleString()}₫</td>

                <td>
                    <button onclick="removeItem(${index})" style="color:red">
                        Xóa
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Cập nhật tổng tiền
    totalPriceElement.innerText = total.toLocaleString() + "₫";
}

// 4. XỬ LÝ SỐ LƯỢNG
function changeQuantity(index, delta) {
    cart[index].quantity += delta;

    // Không cho nhỏ hơn 1
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    saveAndRender();
}

// 5. XÓA SẢN PHẨM
function removeItem(index) {
    cart.splice(index, 1);
    saveAndRender();
}

// 6. LƯU + RENDER LẠI
function saveAndRender() {
    localStorage.setItem('CART', JSON.stringify(cart));
    renderCart();
}

// 7. THANH TOÁN
function checkout() {

    // Kiểm tra giỏ hàng
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // Thông báo
    alert("Cảm ơn bạn đã đặt hàng! Đơn hàng đang được xử lý.");

    // Xóa giỏ hàng
    localStorage.removeItem('CART');

    window.location.href = 'index.html';
}

// 8. KHỞI TẠO (LOAD TRANG)
renderCart();
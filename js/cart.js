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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert("Vui lòng đăng nhập trước khi thanh toán!");
        window.location.href = 'login.html';
        return;
    }
    if (cart.length === 0) return alert("Giỏ hàng trống!");

    // Tính tổng tiền
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: user.username,
            cart: cart,
            totalPrice: total
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        localStorage.removeItem('CART'); // Xóa giỏ hàng local sau khi lưu DB thành công
        window.location.href = 'index.html';
    });
}

// 8. KHỞI TẠO (LOAD TRANG)
renderCart();
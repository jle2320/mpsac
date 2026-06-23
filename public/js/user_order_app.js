document.addEventListener("DOMContentLoaded", async () => {



document.addEventListener('click', function (e) {
    const tabBtn = e.target.closest('.tab-btn');
    if (!tabBtn) return;

    const status = tabBtn.dataset.status;

    document.querySelectorAll('.tab-btn')
        .forEach(b => b.classList.remove('active'));

    tabBtn.classList.add('active');

    let hasData = false;

    document.querySelectorAll('.order-card').forEach(card => {
        const match = status === 'all' || card.dataset.status === status;

        card.classList.toggle('hidden', !match);

        if (match) hasData = true;
    });

    const emptyState = document.getElementById('emptyState');

    if (hasData) {
        emptyState.classList.add('hidden');
    } else {
        emptyState.classList.remove('hidden');
    }
});





document.getElementById('orderSearch').addEventListener('input', function () {
    const keyword = this.value.toLowerCase().trim();

    document.querySelectorAll('.order-card').forEach(card => {

        const orderNumber = card.querySelector('.order-note strong')?.textContent.toLowerCase() || '';

        const productNames = Array.from(card.querySelectorAll('.product-name'))
            .map(el => el.textContent.toLowerCase())
            .join(' ');

        const match =
            orderNumber.includes(keyword) ||
            productNames.includes(keyword);

        card.classList.toggle('hidden', !match);
    });

    // optional empty state
    const visibleCards = document.querySelectorAll('.order-card:not(.hidden)').length;
    const emptyState = document.getElementById('emptyState');

    if (visibleCards === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
});









document.addEventListener('click', async function (e) {

    const btn = e.target.closest('.cancel-order');
    if (!btn) return;

    const orderCard = btn.closest('.order-card');
    const orderNumber = orderCard.dataset.orderNumber;

    if (!confirm(`Cancel order ${orderNumber}?`)) return;

    try {
        const res = await fetch('/orders/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderNumber:orderNumber, orderStatus:'cancelled' })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        // update UI instantly
        orderCard.dataset.status = 'cancelled';

        orderCard.querySelector('.order-status-label').innerHTML = '❌ CANCELLED';
        orderCard.querySelector('.tracking-info').innerHTML = 'Order was cancelled';

        btn.remove(); // remove cancel button

        alert('Order cancelled successfully');

    } catch (err) {
        console.error(err);
        alert('Failed to cancel order');
    }
});







const STATUS_CONFIG = {
  pending     : { label: 'PENDING',    cls: 'status-pending',    icon: '⏳', msg: 'Awaiting order acceptance', btn: '<button class="cancel-order btn-danger-order" >Cancel Order</button>' },
  to_ship    : { label: 'TO SHIP',     cls: 'status-to-ship',    icon: '📦', msg: 'Your order is ready for shipment', btn: '' },
  to_receive : { label: 'TO RECEIVE',  cls: 'status-to-receive', icon: '🚚', msg: 'Your order is out for delivery', btn: '' },
  completed  : { label: 'COMPLETED',   cls: 'status-completed',  icon: '✅', msg: 'Your order has been delivered', btn: '' },
  cancelled  : { label: 'CANCELLED',   cls: 'status-cancelled',  icon: '❌', msg: 'Your order was cancelled', btn: ''},
  refund     : { label: 'RETURN/REFUND',cls:'status-refund',     icon: '↩️', msg: 'Order has been refunded', btn: ''},
};


    fetchOrders();
    async function fetchOrders(){
        try {
            const response = await fetch('/orders/list/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                if(data.data.length != 0){
                    document.getElementById('ordersList').innerHTML = '';
                    let countPending = 0;
                    let toShip = 0;
                    let toReceive = 0;
                    let completed = 0;
                    data.data.forEach((order, index) => {

                        countPending += order.orderStatus === 'pending' ? 1 : 0;
                        toShip += order.orderStatus === 'to_ship' ? 1 : 0;
                        toReceive += order.orderStatus === 'to_receive' ? 1 : 0;
                        completed += order.orderStatus === 'completed' ? 1 : 0;

                        let itemHTML = ``;
                        order.orderItems.forEach((items, indexI) => {
                            itemHTML += `
                            <div class="product-row" >
                                <div class="product-img-wrap">
                                    <img src="${items.images[0].imagePath || 'https://via.placeholder.com/100'}" alt="" />
                                </div>

                                <div class="product-info">
                                    <p class="product-name">${items.productName}</p>
                                    <p class="product-variation">${items.productCategory}</p>
                                    <p class="product-qty">x${items.productQuantity} &#8901; ${items.productUnit}</p>
                                </div>

                                <div class="product-price-col">
                                    ${Number(items.salePrice) !== 0 ? `<span class="product-price-original">₱${items.regularPrice.toFixed(2)}</span>` : ''}

                                    <span class="product-price-final">
                                        ₱${Number(items.salePrice) === 0 ? items.regularPrice.toFixed(2) : items.salePrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>`;
                        });


                        document.getElementById('ordersList').innerHTML += `
                        <div class="order-card" data-status="${order.orderStatus}" data-order-number="${order.orderNumber}" >

                            <!-- Seller bar -->
                            <div class="seller-bar">
                            
                            <div class="seller-left">
                                <button class="btn-chat">
                                <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                Chat
                                </button>
                            </div>

                            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                                <span class="tracking-info">
                                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                                    <path d="M16 8h4l3 3v5h-7V8z"/>
                                    <circle cx="5.5" cy="18.5" r="2.5"/>
                                    <circle cx="18.5" cy="18.5" r="2.5"/>
                                </svg>
                                    ${STATUS_CONFIG[order.orderStatus].msg}
                                </span>

                                <span class="order-status-label">
                                ${STATUS_CONFIG[order.orderStatus].icon} ${STATUS_CONFIG[order.orderStatus].label}
                                </span>
                            </div>
                            </div>

                            <!-- Product items -->
                            ${itemHTML}
                            <!-- Footer -->
                            <div class="order-footer">
                            <div class="order-total-row">
                                <span class="order-total-label">Order Total:</span>
                                <span class="order-total-amount">₱${order.orderTotal.toFixed(2)}</span>
                            </div>

                            <div class="flex items-center justify-between gap-[10px] flex-wrap">
                                <div class="flex flex-col" >
                                    <span class="text-sm flex items-center gap-[5px] text-forest-500" >Order Number: <strong>${order.orderNumber}</strong></span>
                                    <span class="text-xs flex items-center gap-[5px] text-harvest-500" >Payment Method: <strong>${order.paymentMethod} - ${order.paymentStatus}</strong></span>
                                </div>
                                <div class="action-btns">
                                    ${STATUS_CONFIG[order.orderStatus].btn}
                                </div>
                            </div>
                            </div>
                        </div>`; 
                    });

                    countPending !== 0 ? document.getElementById('pendingBtn').innerHTML += `<span class="tab-badge" >${countPending}</span>` : '';
                    toShip !== 0 ? document.getElementById('toShipBtn').innerHTML += `<span class="tab-badge" >${toShip}</span>` : '';
                    toReceive !== 0 ? document.getElementById('toReiveBtn').innerHTML += `<span class="tab-badge" >${toReceive}</span>` : '';
                    completed !== 0 ? document.getElementById('completeBtn').innerHTML += `<span class="tab-badge" >${completed}</span>` : '';
                }else{
                    document.getElementById('emptyState').classList.remove('hidden');
                }
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    title: "Error!",
                    text: data.message,
                    icon: "error"
                });
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Request Failed",
                text: "Unable to load orders"
            });
        }
    }


});






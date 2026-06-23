
function formatDate(dateString) {

    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

}




document.addEventListener("DOMContentLoaded", async () => {

    let myData = [];

    // =========================
    // FETCH DATA
    // =========================

    try {

        const response = await fetch('/a/orders/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            
            myData = data.rows || [];
        }

    } catch (err) {
        console.log(err);
    }


    // =========================
    // ELEMENTS
    // =========================

    const ordersBody = document.getElementById('ordersBody');
    const tableSearch = document.getElementById('tableSearch');
    const filterPayment = document.getElementById('filterPayment');
    const filterSort = document.getElementById('filterSort');

    const paginationInfo = document.getElementById('paginationInfo');
    const paginationBtns = document.getElementById('paginationBtns');
    const filterDate = document.getElementById('filterDate');
    const statusTabs = document.querySelectorAll('.status-tab');

    // =========================
    // STATES
    // =========================

    let currentPage = 1;
    let rowsPerPage = 10;

    let currentStatus = 'all';
    let currentSearch = '';
    let currentPayment = '';
    let currentSort = 'newest';
    let currentDateFilter = '';
    
    // =========================
    // UPDATE STATS
    // =========================

    function updateStats() {

        let countPending = 0;
        let countToShip = 0;
        let countToReceive = 0;
        let countComplete = 0;
        let countCancelled = 0;
        let countRefund = 0;

        myData.forEach(order => {

            countPending += order.orderStatus === 'pending' ? 1 : 0;
            countToShip += order.orderStatus === 'to_ship' ? 1 : 0;
            countToReceive += order.orderStatus === 'to_receive' ? 1 : 0;
            countComplete += order.orderStatus === 'completed' ? 1 : 0;
            countCancelled += order.orderStatus === 'cancelled' ? 1 : 0;
            countRefund += order.orderStatus === 'refund' ? 1 : 0;

        });

        document.getElementById('count-all').textContent = myData.length;
        document.getElementById('count-pending').textContent = countPending;
        document.getElementById('count-to-ship').textContent = countToShip;
        document.getElementById('count-to-receive').textContent = countToReceive;
        document.getElementById('count-completed').textContent = countComplete;
        document.getElementById('count-cancelled').textContent = countCancelled;
        document.getElementById('count-refund').textContent = countRefund;

    }

    

    // =========================
    // STATUS BADGE
    // =========================

    function getStatusBadge(status) {

        const map = {
            pending: 'bg-yellow-500/20 text-yellow-300',
            to_ship: 'bg-blue-500/20 text-blue-300',
            to_receive: 'bg-purple-500/20 text-purple-300',
            completed: 'bg-green-500/20 text-green-300',
            cancelled: 'bg-red-500/20 text-red-300',
            refund: 'bg-orange-500/20 text-orange-300'
        };

        return `
            <span class="px-2 py-1 rounded-full text-[11px] font-semibold ${map[status] || ''}">
                ${status.replaceAll('_', ' ')}
            </span>
        `;
    }

    // =========================
    // FILTER + SEARCH + SORT
    // =========================

    function getFilteredData() {

        let filtered = [...myData];

        // STATUS FILTER
        if (currentStatus !== 'all') {

            filtered = filtered.filter(order => {

                return order.orderStatus === currentStatus;

            });

        }

        // SEARCH
        if (currentSearch) {

            filtered = filtered.filter(order => {

                const searchText = `
                    ${order.orderNumber}
                    ${order.customerName}
                    ${order.customerPhone}
                    ${order.orderPayment}
                `.toLowerCase();

                return searchText.includes(currentSearch);

            });

        }

        // PAYMENT FILTER
        if (currentPayment) {

            filtered = filtered.filter(order => {

                if (currentPayment === 'COD') {
                    return order.orderPayment === 'Cash on Delivery';
                }

                return order.orderPayment === currentPayment;

            });

        }

        // SORT
        switch (currentSort) {

            case 'amount-high':
                filtered.sort((a, b) => b.orderTotal - a.orderTotal);
                break;

            case 'amount-low':
                filtered.sort((a, b) => a.orderTotal - b.orderTotal);
                break;

            case 'oldest':
                filtered.reverse();
                break;

            case 'newest':
            default:
                break;
        }

        // DATE FILTER
        if (currentDateFilter) {

            const now = new Date();

            filtered = filtered.filter(order => {

                const orderDate = new Date(order.orderDate);

                // TODAY
                if (currentDateFilter === 'today') {

                    return (
                        orderDate.getDate() === now.getDate() &&
                        orderDate.getMonth() === now.getMonth() &&
                        orderDate.getFullYear() === now.getFullYear()
                    );

                }

                // THIS WEEK
                if (currentDateFilter === 'week') {

                    const startOfWeek = new Date(now);

                    startOfWeek.setDate(now.getDate() - now.getDay());

                    startOfWeek.setHours(0, 0, 0, 0);

                    return orderDate >= startOfWeek;

                }

                // THIS MONTH
                if (currentDateFilter === 'month') {

                    return (
                        orderDate.getMonth() === now.getMonth() &&
                        orderDate.getFullYear() === now.getFullYear()
                    );

                }

                return true;

            });

        }

        return filtered;

    }

    // =========================
    // RENDER TABLE
    // =========================

    function renderTable() {

        const filteredData = getFilteredData();

        const totalPages = Math.ceil(filteredData.length / rowsPerPage);

        if (currentPage > totalPages) {
            currentPage = 1;
        }

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        const paginatedData = filteredData.slice(start, end);

        // CLEAR TABLE
        ordersBody.innerHTML = '';

        // EMPTY
        if (paginatedData.length === 0) {

            ordersBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-10 text-forest-500">
                        No orders found
                    </td>
                </tr>
            `;

            paginationInfo.textContent = `Showing 0 results`;

            paginationBtns.innerHTML = '';

            return;
        }

        // ROWS
        paginatedData.forEach((order, idx) => {

            const tr = document.createElement('tr');
            tr.className = `
                trow
                border-b border-forest-800/30
                hover:bg-forest-900/20
                duration-200
                cursor-pointer
                trow-appear
            `;
            tr.style.animationDelay = `${idx*0.03}s`;

            tr.innerHTML = `
                <td class="py-4 px-4 font-semibold text-forest-100">
                    ${order.orderNumber}
                </td>

                <td class="py-4 px-3">
                    <div class="font-medium text-forest-100">
                        ${order.customerName}
                    </div>

                    <div class="text-xs text-forest-500">
                        ${order.customerPhone}
                    </div>
                </td>

                <td class="py-4 px-3 text-forest-300">
                    ${order.items.length} item(s)
                </td>

                <td class="py-4 px-3 text-forest-300">
                    ${formatDate(order.orderDate)}
                </td>

                <td class="py-4 px-3 text-forest-300">
                    ${order.orderPayment}
                </td>

                <td class="py-4 px-3 text-right font-bold text-forest-100">
                    ₱${Number(order.orderTotal).toLocaleString()}
                </td>

                <td class="py-4 px-4">
                    ${getStatusBadge(order.orderStatus)}
                </td>
            `;

            tr.addEventListener('click', () => {
                openModal(buildOrderModal(order));

                document.getElementById('printOrderBtn').addEventListener('click', ()=>{ 
                    printOrder(order);
                });

                document.getElementById('applyStatusBtn').addEventListener('click', async ()=>{
                    const newStatus = document.getElementById('statusChanger').value;
                    order.status = newStatus;
                    const btn = document.getElementById('applyStatusBtn');
                    btn.innerHTML = `<span class="spinner"></span>`;
                    btn.disabled = true;

                    const response = await fetch('/a/orders/update/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderStatus:newStatus, orderNumber: order.orderNumber })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        window.location = '/a/orders';
                    } else {
                        setLoading(false);
                        form.classList.add('shake');
                        setTimeout(() => form.classList.remove('shake'), 400);
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
                });
            });

            ordersBody.appendChild(tr);

        });

        renderPagination(filteredData.length, totalPages, start, end);

    }

    // =========================
    // PAGINATION
    // =========================

    function renderPagination(totalItems, totalPages, start, end) {

        paginationInfo.textContent = `
            Showing ${start + 1}-${Math.min(end, totalItems)} of ${totalItems}
        `;

        paginationBtns.innerHTML = '';

        // PREV
        const prevBtn = document.createElement('button');

        prevBtn.innerHTML = '&laquo;';

        prevBtn.className = `
            px-3 py-1.5 rounded-lg border border-forest-700
            text-forest-300 hover:bg-forest-800/50
        `;

        prevBtn.disabled = currentPage === 1;

        prevBtn.addEventListener('click', () => {

            if (currentPage > 1) {

                currentPage--;

                renderTable();

            }

        });

        paginationBtns.appendChild(prevBtn);

        // PAGE BUTTONS
        for (let i = 1; i <= totalPages; i++) {

            const btn = document.createElement('button');

            btn.textContent = i;

            btn.className = `
                px-3 py-1.5 rounded-lg border
                ${currentPage === i
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'border-forest-700 text-forest-300 hover:bg-forest-800/50'}
            `;

            btn.addEventListener('click', () => {

                currentPage = i;

                renderTable();

            });

            paginationBtns.appendChild(btn);

        }

        // NEXT
        const nextBtn = document.createElement('button');

        nextBtn.innerHTML = '&raquo;';

        nextBtn.className = `
            px-3 py-1.5 rounded-lg border border-forest-700
            text-forest-300 hover:bg-forest-800/50
        `;

        nextBtn.disabled = currentPage === totalPages;

        nextBtn.addEventListener('click', () => {

            if (currentPage < totalPages) {

                currentPage++;

                renderTable();

            }

        });

        paginationBtns.appendChild(nextBtn);

    }

    // =========================
    // SEARCH
    // =========================

    tableSearch.addEventListener('input', (e) => {

        currentSearch = e.target.value.toLowerCase();

        currentPage = 1;

        renderTable();

    });

    // =========================
    // PAYMENT FILTER
    // =========================

    filterPayment.addEventListener('change', (e) => {

        currentPayment = e.target.value;

        currentPage = 1;

        renderTable();

    });

    // =========================
    // SORT
    // =========================

    filterSort.addEventListener('change', (e) => {

        currentSort = e.target.value;

        renderTable();

    });

    // =========================
    // STATUS TABS
    // =========================

    statusTabs.forEach(tab => {

        tab.addEventListener('click', () => {

            statusTabs.forEach(btn => {
                btn.classList.remove('active');
            });

            tab.classList.add('active');

            currentStatus = tab.dataset.tab;

            currentPage = 1;

            renderTable();

        });

    });


    filterDate.addEventListener('change', (e) => {
        currentDateFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });

    











    function buildOrderModal(order){
        const dStr = new Date(order.orderDate).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const tStr = new Date(order.orderDate).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const itemsHtml = order.items.map(p=>`
            <div class="flex items-center justify-between py-2.5 border-b border-forest-800/40 last:border-0">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-forest-800/60 flex items-center justify-center text-lg">
                        <img src="${p.images[0]['imagePath']}" >
                    </div>
                    <div>
                        <p class="text-forest-200 text-xs font-medium">${p.productName}</p>
                        <p class="text-harvest-500 text-xs font-medium">${p.variantName}</p>
                    </div>
                </div>
                <div>
                    <p class="text-forest-500 text-[10px]"> ₱${p.itemSalePrice == 0 ? p.itemRegularPrice :  `<span class='line-through' >`+ p.itemRegularPrice +`</span> ` + p.itemSalePrice } × ${p.itemQuantity}</p>
                    <p class="text-white text-xs font-bold">₱${p.itemTotal.toLocaleString()}</p>
                </div>
            </div>`).join('');
        
        const statusOpts = Object.entries(STATUS).map(([k,v])=> `<option value="${k}" ${k===order.orderStatus?'selected':''}>${v.label}</option>`).join('');    

        let statusBtn = ``;
        const hideStatus = ['cancelled', 'refund'].includes(order.orderStatus);
        if(!hideStatus){
            statusBtn = `<label class="text-forest-500 text-xs font-semibold whitespace-nowrap">Update Status:</label>
                        <select id="statusChanger" class="filter-select flex-1 text-xs">${statusOpts}</select>
                        <button id="applyStatusBtn" class="bg-harvest-400 hover:bg-harvest-300 text-forest-900 text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2">
                            Apply
                        </button>`;
        }
        return `
            <div class="p-5 md:p-6">

                <div class="flex items-start justify-between mb-5 gap-3">
                    <div>
                        <div class="flex items-center gap-2.5 mb-1 flex-wrap">
                            <h2 class="font-display text-xl text-white font-bold">${order.orderNumber}</h2>
                            ${getStatusBadge(order.orderStatus)}
                        </div>
                        <p class="text-forest-500 text-xs">${dStr} at ${tStr}</p>
                    </div>
                    <button id="closeModal" class="w-8 h-8 rounded-xl bg-forest-800/60 hover:bg-forest-700 flex items-center justify-center text-forest-400 hover:text-white transition shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <!-- 2-col grid on md+ -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                    <!-- Left: Customer + Delivery -->
                    <div class="space-y-4">

                    <!-- Customer -->
                    <div class="bg-forest-900/50 border border-forest-800/50 rounded-xl p-4">
                        <p class="text-forest-500 text-[10px] uppercase tracking-widest font-bold mb-3">Customer</p>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 bg-harvest-500 rounded-full flex items-center justify-center font-bold">${order.customerName[0]}</div>
                                <div>
                                    <p class="text-white text-sm font-semibold">${order.customerName}</p>
                                    <p class="text-forest-400 text-xs">${order.customerEmail}</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-2 text-xs">
                                <svg class="w-3.5 h-3.5 text-forest-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span class="text-forest-400">
                                    ${order.orderContactPerson} (${order.orderContactNumber}).
                                    ${order.orderContactStreet},
                                    ${order.orderContactBarangay},
                                    ${order.orderContactCity},
                                    ${order.orderContactProvince},
                                    Landmark: ${order.orderContactLandmark}
                                </span>
                            </div>
                        </div>

                        <!-- Payment -->
                        <div class="bg-forest-900/50 border border-forest-800/50 rounded-xl p-4">
                            <p class="text-forest-500 text-[10px] uppercase tracking-widest font-bold mb-3">Payment</p>
                            <div class="flex items-center justify-between text-xs mb-2">
                                <span class="text-forest-400">Method</span>
                                <span class="text-white font-semibold">${order.orderStatus}</span>
                            </div>

                            <div class="flex items-center justify-between text-xs mb-2">
                                <span class="text-forest-400">Subtotal</span>
                                <span class="text-forest-200">₱${order.orderSubTotal.toLocaleString()}</span>
                            </div>

                            <div class="flex items-center justify-between text-xs mb-2">
                                <span class="text-forest-400">Shipping</span>
                                <span class="text-forest-200">₱${order.orderShippingFee.toLocaleString()}</span>
                            </div>

                            <div class="flex items-center justify-between text-xs mb-2">
                                <span class="text-forest-400">Discount</span>
                                <span class="text-forest-400">₱${order.orderDiscount.toLocaleString()}</span>
                            </div>

                            <div class="h-px bg-forest-800/60 my-2"></div>
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-white font-bold">Total</span>
                                <span class="text-harvest-400 font-bold">₱${order.orderTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Items + Timeline -->
                    <div class="space-y-4">
                        <!-- Order Items -->
                        <div class="bg-forest-900/50 border border-forest-800/50 rounded-xl p-4">
                            <p class="text-forest-500 text-[10px] uppercase tracking-widest font-bold mb-3">Order Items (${order.items.length})</p>
                            ${itemsHtml}
                        </div>
                    </div>
                </div>

                <!-- Action row -->
                <div class="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-forest-800/40">
                    <div class="flex items-center gap-2 flex-1">
                        ${statusBtn}
                    </div>

                    <div class="flex gap-2">
                        <button id="printOrderBtn" class="flex items-center gap-1.5 bg-forest-800/60 hover:bg-forest-700 text-forest-300 text-xs font-medium px-3.5 py-2 rounded-xl transition">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print
                        </button>
                    </div>
                </div>
            </div>`;
    }



    function printOrder(order) {

        // ── 1. Date strings — same fields your modal uses ────────────
        const dStr = new Date(order.orderDate).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const tStr = new Date(order.orderDate).toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit'
        });

        // ── 2. Status label + colours ────────────────────────────────
        const STATUS_LABELS = {
            pending:    'Pending',
            to_ship:    'To Ship',
            to_receive: 'To Receive',
            completed:  'Completed',
            cancelled:  'Cancelled',
            refund:     'Return / Refund',
        };
        const STATUS_COLORS = {
            pending:    { bg: '#fef3c7', color: '#b45309' },
            to_ship:    { bg: '#e0f2df', color: '#2d7429' },
            to_receive: { bg: '#ffedd5', color: '#c2410c' },
            completed:  { bg: '#dcfce7', color: '#15803d' },
            cancelled:  { bg: '#fee2e2', color: '#b91c1c' },
            refund:     { bg: '#ede9fe', color: '#7c3aed' },
        };
        const statusLabel = STATUS_LABELS[order.orderStatus] || order.orderStatus || '—';
        const sc = STATUS_COLORS[order.orderStatus] || { bg: '#e0f2df', color: '#2d7429' };

        // ── 3. Payment totals — same fields as your modal ────────────
        const subtotal = Number(order.orderSubTotal    || 0);
        const shipping = Number(order.orderShippingFee || 0);
        const discount = Number(order.orderDiscount    || 0);
        const total    = Number(order.orderTotal       || 0);

        // ── 4. Printed-at timestamp ──────────────────────────────────
        const printedAt = new Date().toLocaleString('en-PH', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        // ── 5. Item rows — mirrors your modal itemsHtml exactly ──────
        //  Your logic: p.itemSalePrice == 0 → show regular price
        //              otherwise → strikethrough regular + sale price
        const itemRows = order.items.map(item => {

            const hasSale = Number(item.itemSalePrice) !== 0;

            const priceCell = hasSale
            ? `<span style="text-decoration:line-through;color:#9ca3af;font-size:11px;">
                ₱${Number(item.itemRegularPrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span><br/>
                <span style="color:#ea580c;font-weight:700;font-size:13px;">
                ₱${Number(item.itemSalePrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>`
            : `<span style="font-size:13px;color:#255e22;font-weight:500;">
                ₱${Number(item.itemRegularPrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>`;

            // Same image access your modal uses: p.images[0]['imagePath']
            const imgTag = item.images && item.images.length
            ? `<img
                src="${item.images[0].imagePath}"
                alt="${item.productName}"
                style="width:48px;height:48px;object-fit:cover;border-radius:8px;
                        border:1px solid #e0f2df;display:block;flex-shrink:0;"/>`
            : `<div style="width:48px;height:48px;border-radius:8px;background:#e0f2df;
                            display:flex;align-items:center;justify-content:center;
                            font-size:22px;flex-shrink:0;">🌿</div>`;

            return `
            <tr style="border-bottom:1px solid #e0f2df;">
                <td style="padding:12px 8px 12px 12px;vertical-align:middle;">
                <div style="display:flex;align-items:center;gap:12px;">
                    ${imgTag}
                    <div>
                        <p style="font-size:13px;color:#1f4b1d;font-weight:500;line-height:1.4;margin:0px;">${item.productName}</p>
                        <p style="font-size:10px;color:#f59e0b;font-weight:500;line-height:1;margin:0px;">${item.variantName}</p>
                    </div>
                </div>
                </td>
                <td style="padding:12px 8px;text-align:center;vertical-align:middle;">
                <span style="font-size:13px;color:#255e22;font-weight:600;">${item.itemQuantity}</span>
                </td>
                <td style="padding:12px 8px;text-align:right;vertical-align:middle;line-height:1.6;">
                ${priceCell}
                </td>
                <td style="padding:12px 12px 12px 8px;text-align:right;vertical-align:middle;">
                <span style="font-size:13px;font-weight:700;color:#183d17;">
                    ₱${Number(item.itemTotal).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
                </td>
            </tr>`;
        }).join('');

        // ── 6. Full receipt HTML ──────────────────────────────────────
        const receiptHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8"/>
        <title>Receipt — ${order.orderNumber}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'DM Sans', Arial, sans-serif; background: #fff; color: #1f4b1d; }

            .receipt { max-width: 720px; margin: 0 auto; padding: 40px 36px; }

            /* HEADER */
            .header {
            display: flex; align-items: flex-start;
            justify-content: space-between;
            border-bottom: 2px solid #f2eddfff;
            padding-bottom: 22px; margin-bottom: 28px;
            }
            .brand { display: flex; align-items: center; gap: 12px; }
            .brand-logo {
            width: 46px; height: 46px; background: #fbbf24; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; flex-shrink: 0;
            }
            .brand-name  { font-size: 24px; font-weight: 700; color: #183d17; line-height: 1; }
            .brand-name span { color: #d97706; }
            .brand-sub   { font-size: 10px; color: #5cb356; text-transform: uppercase; letter-spacing: .12em; margin-top: 4px; }
            .receipt-meta { text-align: right; }
            .order-num   { font-size: 17px; font-weight: 700; color: #183d17; }
            .order-date  { font-size: 11px; color: #5cb356; margin-top: 4px; }
            .status-pill {
            display: inline-block; margin-top: 7px;
            padding: 4px 14px; border-radius: 99px;
            font-size: 11px; font-weight: 700;
            background: ${sc.bg}; color: ${sc.color};
            }

            /* INFO GRID */
            .info-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 16px; margin-bottom: 30px;
            }
            .info-box {
            background: #f2f9f2; border: 1px solid #e0f2df;
            border-radius: 12px; padding: 16px;
            }
            .info-label {
            font-size: 9px; font-weight: 700;
            text-transform: uppercase; letter-spacing: .14em;
            color: #5cb356; margin-bottom: 10px;
            }
            .info-avatar {
            width: 38px; height: 38px; border-radius: 50%;
            background: #f59e0b; color: #183d17;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 15px; flex-shrink: 0;
            }
            .info-name { font-size: 13px; font-weight: 700; color: #183d17; }
            .info-sub  { font-size: 11px; color: #5cb356; margin-top: 2px; }
            .info-line { font-size: 12px; color: #255e22; line-height: 1.75; }

            /* SECTION LABEL */
            .section-label {
            font-size: 9px; font-weight: 700;
            text-transform: uppercase; letter-spacing: .14em;
            color: #5cb356; margin-bottom: 12px;
            }

            /* ITEMS TABLE */
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .items-table thead tr { background: #e0f2df; }
            .items-table thead th {
            padding: 10px 8px; font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: .08em; color: #2d7429;
            }
            .items-table thead th:first-child  { text-align: left;  border-radius: 8px 0 0 8px; padding-left: 12px; }
            .items-table thead th:last-child   { text-align: right; border-radius: 0 8px 8px 0; padding-right: 12px; }
            .items-table thead th:not(:first-child):not(:last-child) { text-align: center; }
            .items-table tbody tr:last-child   { border-bottom: none !important; }

            /* PAYMENT + TOTALS */
            .pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
            .pay-box  { background: #f2f9f2; border: 1px solid #e0f2df; border-radius: 12px; padding: 16px; }
            .pay-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: #e0f2df; border: 1px solid #bde4ba;
            border-radius: 8px; padding: 8px 14px;
            font-size: 13px; font-weight: 600; color: #2d7429; margin-top: 4px;
            }
            .totals-box { border: 1px solid #e0f2df; border-radius: 12px; overflow: hidden; }
            .totals-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 16px; font-size: 12px;
            border-bottom: 1px solid #e0f2df; color: #255e22;
            }
            .totals-row.discount { color: #ea580c; }
            .totals-row.grand {
            border-bottom: none; background: #183d17;
            color: #fbbf24; font-size: 15px; font-weight: 700; padding: 14px 16px;
            }

            /* FOOTER */
            .footer {
            border-top: 1px dashed #bde4ba; padding-top: 18px;
            text-align: center; color: #8fce8a; font-size: 11px; line-height: 2;
            }
            .footer strong { color: #3a9134; }

            /* PRINT */
            @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 12mm 10mm; size: A4; }
            }
        </style>
        </head>
        <body>
        <div class="receipt">

        <!-- HEADER -->
        <div class="header">
            <div class="brand">
            <div class="brand-logo">
                <img style="width:50px;" src="/images/logo.png" >
            </div>
            <div>
                <div class="brand-name">MPSAC<span>Shop</span></div>
                <div class="brand-sub">Official Order Receipt</div>
            </div>
            </div>
            <div class="receipt-meta">
            <div class="order-num">${order.orderNumber}</div>
            <div class="order-date">${dStr} at ${tStr}</div>
            <div class="status-pill">${statusLabel}</div>
            </div>
        </div>

        <!-- CUSTOMER + DELIVERY — same fields as your modal -->
        <div class="info-grid">

            <div class="info-box">
            <div class="info-label">Customer</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div class="info-avatar">
                ${order.customerName ? order.customerName[0].toUpperCase() : '?'}
                </div>
                <div>
                <div class="info-name">${order.customerName || '—'}</div>
                <div class="info-sub">${order.customerEmail || '—'}</div>
                <div class="info-sub">${order.customerPhone || '—'}</div>
                </div>
            </div>
            </div>

            <div class="info-box">
            <div class="info-label">Delivery Address</div>
            <div style="display:flex;align-items:flex-start;gap:8px;margin-top:4px;">
                <span style="font-size:14px;flex-shrink:0;">📍</span>
                <span class="info-line">
                    ${order.orderContactPerson} (${order.orderContactNumber}).
                    ${order.orderContactStreet},
                    ${order.orderContactBarangay},
                    ${order.orderContactCity},
                    ${order.orderContactProvince},
                    Landmark: ${order.orderContactLandmark}
                </span>
            </div>
            </div>

        </div>

        <!-- ORDER ITEMS -->
        <div class="section-label">Order Items (${order.items.length})</div>
        <table class="items-table">
            <thead>
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
            </thead>
            <tbody>${itemRows}</tbody>
        </table>

        <!-- PAYMENT + TOTALS — same fields as your modal -->
        <div class="pay-grid">

            <div class="pay-box">
            <div class="info-label">Payment Method</div>
            <div class="pay-pill">💳 ${order.orderPayment || '—'}</div>
            <div style="margin-top:14px;">
                <div class="info-label">Order Status</div>
                <div style="display:inline-block;margin-top:4px;padding:4px 12px;
                            border-radius:99px;font-size:11px;font-weight:700;
                            background:${sc.bg};color:${sc.color};">
                ${statusLabel}
                </div>
            </div>
            </div>

            <div>
            <div class="info-label" style="margin-bottom:8px;">Payment Summary</div>
            <div class="totals-box">
                <div class="totals-row">
                <span>Subtotal</span>
                <span>₱${subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="totals-row">
                <span>Shipping Fee</span>
                <span>₱${shipping.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                ${discount > 0 ? `
                <div class="totals-row discount">
                <span>Discount</span>
                <span>− ₱${discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                <div class="totals-row grand">
                <span>Grand Total</span>
                <span>₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
            </div>

        </div>

        <!-- FOOTER -->
        <div class="footer">
            <div>Thank you for shopping with <strong>MPSAC</strong> 🌿</div>
        </div>

        </div>
        </body>
        </html>`;

        // ── 7. Inject into hidden iframe and trigger print ────────────
        const existing = document.getElementById('__printFrame');
        if (existing) existing.remove();

        const iframe = document.createElement('iframe');
        iframe.id = '__printFrame';
        // Completely off-screen — invisible to the user
        iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(receiptHtml);
        iframeDoc.close();

        // Wait for fonts + images to load before opening print dialog
        iframe.contentWindow.addEventListener('load', () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            // Give browser ~1 s to spool the job, then clean up the iframe
            setTimeout(() => iframe.remove(), 1000);
        });
        }

    // =========================
    // INIT
    // =========================

    updateStats();

    renderTable();

});
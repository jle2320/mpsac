

// Populate category dropdown 
const selectCategory = document.getElementById('filterCategory');
productCategories.forEach(category => {
    selectCategory.insertAdjacentHTML('beforeend',`<option value="${category}">${category}</option>`);
});



document.addEventListener("DOMContentLoaded", async () => {
    // =========================
    // FETCH DATA
    // =========================
    let inventory = [];
    try {
        const response = await fetch('/a/inventory/list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        if (data.success) {
            inventory = data.inventory || [];
        }
    } catch (err) {
        console.error(err);
    }


    const filterSearch = document.getElementById('filterSearch');
    const filterCategory = document.getElementById('filterCategory');
    const filterSort = document.getElementById('filterSort');
    const inventoryBody = document.getElementById('inventoryBody');
    const statusTabs = document.querySelectorAll('.status-tab');

    let currentStatus = 'all';
    let currentCategory = 'all';
    let currentSort = 'stock-low';
    let currentSearch = '';
    let currentPage = 1;
    let rowsPerPage = 10;


    function getFilteredData() {

        let filtered = [...inventory];

        // FILTER Status
        if (currentStatus !== 'all') {

            filtered = filtered.filter(row => {
                const quantity = Number(row.variantStock);
                const lowStockAlert = Number(row.lowStockAlert);
                const criticalGap = (quantity / lowStockAlert) * 100;
                if (criticalGap <= 0) {
                    return "outOfStock" === currentStatus;
                } else if (criticalGap <= 50) {
                    return "criticalStock" === currentStatus;
                } else if (criticalGap <= 100) {
                    return "lowStock" === currentStatus;
                }else{
                    return "inStock" === currentStatus;
                }
            });

        }

        // FILTER CATEGORY
        if (currentCategory !== 'all') {
            filtered = filtered.filter(row => {
                return row.productCategory === currentCategory;
            });
        }

        // SORT Stock from Low to High
        if (currentSort === 'stock-low') {
            filtered.sort((a, b) => {
                return Number(a.variantStock) - Number(b.variantStock);
            });
        }

        // SORT Stock from High to low
        if (currentSort === 'stock-high') {
            filtered.sort((a, b) => {
                return Number(b.variantStock) - Number(a.variantStock);
            });
        }

        // SEARCH FILTER
        if (currentSearch) {
            filtered = filtered.filter(row => {
                const searchText = `${row.productSKU} ${row.productName} ${row.productCategory} ${row.variantName} ${row.variantSKU}`.toLowerCase();
                return searchText.includes(currentSearch);
            });
        }
        return filtered;
    }



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
        inventoryBody.innerHTML = '';

        // EMPTY
        if (paginatedData.length === 0) {
            inventoryBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-forest-500">
                        No items found
                    </td>
                </tr>
            `;
            paginationInfo.textContent = `Showing 0 results`;
            paginationBtns.innerHTML = '';
            return;
        }

        // ROWS
        paginatedData.forEach((row, idx) => {
            
            const tr = document.createElement('tr');
            tr.className = `trow border-b border-forest-800/30 hover:bg-forest-900/20 duration-200 cursor-pointer trow-appear `;
            tr.style.animationDelay = `${idx*0.03}s`;

            const avIdx    = idx % AVATAR_CLASSES.length;
            const avClass = AVATAR_CLASSES[avIdx];

            const quantity = Number(row.variantStock);
            const lowStockAlert = Number(row.lowStockAlert);
            const criticalGap = (quantity / lowStockAlert) * 100;

            let criticalIndicator = `<span class="text-forest-400 font-bold bg-forest-500/20 text-[9px] font-medium px-4 py-1 rounded-full">In Stock</span>`;
            if(criticalGap <= 0){
                criticalIndicator = `<span class="text-harvest-900 font-bold bg-terra-400 text-[9px] font-medium px-4 py-1 rounded-full">Out of Stock</span>`;
            }else if (criticalGap <= 50) {
                criticalIndicator = `<span class="text-terra-400 font-bold bg-terra-500/20 text-[9px] font-medium px-4 py-1 rounded-full">Critical</span>`;
            } else if (criticalGap <= 100) {
                criticalIndicator = `<span class="text-harvest-400 font-bold bg-harvest-500/20 text-[9px] font-medium px-4 py-1 rounded-full">Low Stock</span>`;
            }
            
            tr.innerHTML = `<td class="py-3 px-3">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-8 h-8 rounded-full ${avClass} flex items-center justify-center font-bold text-xs shrink-0">${row.productName[0]}${row.variantName[0]}</div>
                                    <div class="min-w-0">
                                        <p class="text-forest-100 text-xs font-semibold truncate max-w-[140px]">${row.productName}</p>
                                        <p class="text-forest-500 text-[10px] mt-0.5">${row.variantName}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-3 px-3 col-sku">
                                <p class="text-forest-400 text-[10px] font-mono">${row.variantSKU}</p>
                            </td>
                            <td class="py-3 px-3 col-category">
                                <span class="bg-forest-800/60 text-forest-300 text-[10px] font-medium px-2 py-0.5 rounded-full">${row.productCategory}</span>
                            </td>
                            
                            <td class="py-3 px-3">
                                <span class="text-forest-200 text-xs font-bold w-8 text-right">${quantity}</span>
                            </td>

                            <td class="py-3 px-3">
                                <span class="text-forest-200 text-xs font-bold w-8 text-right">${row.variantUnit}</span>
                            </td>

                            <td class="py-3 px-3 col-category">
                                ${criticalIndicator}
                            </td>`;

            inventoryBody.appendChild(tr);
            tr.addEventListener('click', () => {
                openModal(buildStockView(row));


                // ADD STOCK
                document.getElementById('doRestockBtn').addEventListener('click', async (e) =>{
                    const btn = e.currentTarget;
                    const restockQty = document.getElementById('restockQty').value;
                    if(!restockQty) return showToast('Stock quantity is required','warning');

                    btn.disabled = true;
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `Processing...`;

                    try{
                        const response = await fetch('/a/inventory/stocks/restock', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productId:row.productID, variantID:row.variantID, restockQty:restockQty })
                        });

                        const data = await response.json();
                        if(data.success){
                            showToast('Stocks added.');
                            setTimeout(() => {
                                window.location = '/a/inventory';
                            }, 3000);
                        }else{
                            btn.disabled = false;
                            btn.classList.remove('opacity-50', 'cursor-not-allowed');
                            btn.innerHTML = originalHTML;
                            return showToast('Server Error.','error');
                        }
                    }catch{
                        btn.disabled = false;
                        btn.classList.remove('opacity-50', 'cursor-not-allowed');
                        btn.innerHTML = originalHTML;
                        return showToast('Failed to connect to server.','error');
                    }
                });


                // ADJUST STOCK
                document.getElementById('doAdjustBtn').addEventListener('click', async (e) =>{
                    const btn = e.currentTarget;
                    const adjustkQty = Number(document.getElementById('adjustkQty').value);
                    const currentStock = Number(row.variantStock);

                    if (isNaN(adjustkQty)) {
                        return showToast('Stock quantity is required', 'warning');
                    }

                    if (adjustkQty <= 0) {
                        return showToast('Stock quantity must be greater than 0', 'warning');
                    }

                    if (adjustkQty === currentStock) {
                        return showToast('Stock quantity is already the same as current stock', 'warning');
                    }

                    let adjustedQuantity = adjustkQty - currentStock;

                    btn.disabled = true;
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `Processing...`;

                    try{
                        const response = await fetch('/a/inventory/stocks/adjust', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productId:row.productID, variantID:row.variantID, adjustkQty:adjustedQuantity })
                        });

                        const data = await response.json();
                        if(data.success){
                            showToast('Stocks adjusted.');
                            setTimeout(() => {
                                window.location = '/a/inventory';
                            }, 3000);
                        }else{
                            btn.disabled = false;
                            btn.classList.remove('opacity-50', 'cursor-not-allowed');
                            btn.innerHTML = originalHTML;
                            return showToast('Server Error.','error');
                        }
                    }catch{
                        btn.disabled = false;
                        btn.classList.remove('opacity-50', 'cursor-not-allowed');
                        btn.innerHTML = originalHTML;
                        return showToast('Failed to connect to server.','error');
                    }
                });
            });
        });
        renderPagination(filteredData.length, totalPages, start, end);
    }

    function renderPagination(totalItems, totalPages, start, end) {

        paginationInfo.textContent = `Showing ${start + 1}-${Math.min(end, totalItems)} of ${totalItems}`;
        paginationBtns.innerHTML = '';

        // PREV
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '&laquo;';
        prevBtn.className = `px-3 py-1.5 rounded-lg border border-forest-700 text-forest-300 hover:bg-forest-800/50`;
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
            btn.className = `px-3 py-1.5 rounded-lg border ${currentPage === i ? 'bg-forest-700 text-white border-forest-700' : 'border-forest-700 text-forest-300 hover:bg-forest-800/50'} `;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            paginationBtns.appendChild(btn);
        }

        // NEXT
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&raquo;';
        nextBtn.className = `px-3 py-1.5 rounded-lg border border-forest-700 text-forest-300 hover:bg-forest-800/50`;
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        paginationBtns.appendChild(nextBtn);
    }

    function buildStockView(row){

        const quantity = Number(row.variantStock);
        const lowStockAlert = Number(row.lowStockAlert);
        const criticalGap = lowStockAlert > 0 ? (quantity / lowStockAlert) * 100 : 0;
        
        const variantRegularPrice = Number(row.variantRegularPrice);
        const variantSalePrice = Number(row.variantSalePrice);
        const variantCostPrice = Number(row.variantCostPrice);
        const hasSale = variantSalePrice > 0;
        const disc  = hasSale ? Math.round((1-variantSalePrice/variantRegularPrice)*100) : 0;
        const displayPrice = hasSale ? variantSalePrice : variantRegularPrice;
        const totalValue = (quantity * displayPrice).toLocaleString(undefined,{maximumFractionDigits:0});
        const margin = variantSalePrice > 0 ? Math.round((variantSalePrice-variantCostPrice)/variantSalePrice*100) : 0;
        const markup = variantSalePrice > 0 ? Math.round((variantSalePrice-variantCostPrice)/variantCostPrice*100) : 0;

        let criticalIndicator = `<span class="text-forest-400 font-bold bg-forest-500/20 text-[9px] font-medium px-4 py-1 rounded-full">In Stock</span>`;
        if(criticalGap <= 0){
            criticalIndicator = `<span class="text-harvest-900 font-bold bg-terra-400 text-[9px] font-medium px-4 py-1 rounded-full">Out of Stock</span>`;
        }else if (criticalGap <= 50) {
            criticalIndicator = `<span class="text-terra-400 font-bold bg-terra-500/20 text-[9px] font-medium px-4 py-1 rounded-full">Critical</span>`;
        } else if (criticalGap <= 100) {
            criticalIndicator = `<span class="text-harvest-400 font-bold bg-harvest-500/20 text-[9px] font-medium px-4 py-1 rounded-full">Low Stock</span>`;
        }

        const mvHtml = row.movements.sort((a, b) => new Date(b.movementID) - new Date(a.movementID)).map(m => {
            
            if(m.movementQuantity < 0){
                return `
                    <div class="flex items-center justify-between">
                            <div>
                                <span class="text-terra-400 text-xs font-medium">${STOCK_MOVEMENT[m.movementType].label}</span>
                                <p class="text-terra-500 text-[10px]">${m.movementDate}</p>
                            </div>
                            <div class="flex items-center gap-2 mb-0">
                                <p class="text-terra-500 text-xs font-medium">&#x2191;</p>
                                <p class="text-terra-500 text-xs font-medium">${m.movementQuantity}</p>
                            </div>
                        </div>
                    <div class="h-px bg-forest-800/50"></div>`;
            }else{
                return `
                    <div class="flex items-center justify-between">
                            <div>
                                <span class="text-forest-400 text-xs font-medium">${STOCK_MOVEMENT[m.movementType].label}</span>
                                <p class="text-forest-500 text-[10px]">${m.movementDate}</p>
                            </div>
                            <div class="flex items-center gap-2 mb-0">
                                <p class="text-forest-500 text-xs font-medium">&#x2193;</p>
                                <p class="text-forest-500 text-xs font-medium">+${m.movementQuantity}</p>
                            </div>
                        </div>
                    <div class="h-px bg-forest-800/50"></div>`;
            }
        }).join('');

        return `
            <div class="flex items-center justify-between p-5 border-b border-forest-800/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full avatar-a flex items-center justify-center font-bold text-xs shrink-0">${row.productName[0]}${row.variantName[0]}</div>
                    <div>
                        <h2 class="font-display text-lg text-white font-bold">${row.productName}</h2>
                        <p class="text-forest-500 text-xs mt-0.5">${row.variantName} · <span class="font-mono">${row.variantSKU}</span></p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${criticalIndicator}
                    <button id="closeModal" class="w-8 h-8 rounded-xl bg-forest-800/60 hover:bg-terra-500/20 text-forest-400 hover:text-terra-400 flex items-center justify-center transition">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                </div>

                <!-- Modal body -->
                <div class="p-5 space-y-4 max-h-[65vh] overflow-y-auto">

                    <!-- Stock gauge + price row -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <!-- Stock -->
                        <div class="bg-forest-900/50 border border-forest-800/50 rounded-xl p-4">
                        <p class="text-forest-500 text-[10px] uppercase tracking-widest font-bold mb-3">Stock Level</p>
                        <div class="flex items-end gap-3 mb-3">
                            <p class="font-display text-4xl font-bold text-white">${row.variantStock}</p>
                            <span class="text-forest-400 text-sm mb-1">${row.variantUnit}</span>
                        </div>
                        
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-forest-800/50 rounded-lg p-2.5">
                                    <p class="text-forest-500 mb-0.5">Policy</p>
                                    <p class="text-forest-200 font-semibold capitalize">${row.variantStockPlcy}</p>
                                </div>

                                <div class="bg-forest-800/50 rounded-lg p-2.5">
                                    <p class="text-forest-500 mb-0.5">Total Value</p>
                                    <p class="text-harvest-400 font-bold">₱${totalValue}</p>
                                </div>

                                <div class="bg-forest-800/50 rounded-lg p-2.5">
                                    <p class="text-forest-500 mb-0.5">Barcode</p>
                                    <p class="text-forest-200 font-mono font-semibold text-[10px]">${row.variantBarcode}</p>
                                </div>

                                <div class="bg-forest-800/50 rounded-lg p-2.5">
                                    <p class="text-forest-500 mb-0.5">Category</p>
                                    <p class="text-forest-200 font-semibold">${row.productCategory}</p>
                                </div>
                            </div>
                            
                        </div>

                        <!-- Pricing -->
                        <div class="bg-forest-900/50 border border-forest-800/50 rounded-xl p-4">
                        <p class="text-forest-500 text-[10px] uppercase tracking-widest font-bold mb-3">Pricing</p>
                        <div class="flex items-baseline gap-2 mb-1">
                            <span class="font-display text-3xl text-white font-bold">₱${displayPrice}</span>
                            ${hasSale ? `<span class="text-forest-500 line-through text-sm">₱${variantRegularPrice}</span>
                            <span class="badge bg-terra-500/20 text-terra-400 border border-terra-500/25">-${disc}%</span>` : ''}
                        </div>
                        <p class="text-forest-500 text-xs mb-4">Selling price · ${row.variantUnit}</p>
                        <div class="space-y-2 text-xs">
                            <div class="flex justify-between py-2 border-b border-forest-800/30">
                            <span class="text-forest-500">Regular Price</span>
                            <span class="text-forest-200 font-semibold">₱${variantRegularPrice}</span>
                            </div>
                            ${hasSale ? `<div class="flex justify-between py-2 border-b border-forest-800/30">
                            <span class="text-forest-500">Sale Price</span>
                            <span class="text-terra-400 font-semibold">₱${variantSalePrice}</span>
                            </div>` : ''}
                            <div class="flex justify-between py-2 border-b border-forest-800/30">
                            <span class="text-forest-500">Cost Price</span>
                            <span class="text-forest-300 font-semibold">₱${variantCostPrice}</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-forest-500">Profit Margin</span>
                                <span class="${margin>30?'text-forest-400':'text-harvest-400'} font-bold">${margin}%</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-forest-500">Markup</span>
                                <span class="${markup>30?'text-forest-400':'text-harvest-400'} font-bold">${markup}%</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <!--  -->
                    <div class="flex gap-3">
                        <div class="bg-harvest-400/10 border border-harvest-400/25 rounded-xl p-4" >
                            <p class="text-harvest-300 text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Quick Restock
                            </p>
                            <div class="flex gap-2 flex-wrap">
                                <input id="restockQty" type="number" min="1" placeholder="Qty to add…" class="form-input flex-1 min-w-[120px] py-2.5 text-sm"/>
                                <button id="doRestockBtn" class="bg-harvest-400 hover:bg-harvest-300 text-forest-900 text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                    Restock
                                </button>
                            </div>
                        </div>

                        <div class="bg-terra-500/10 border border-harvest-400/25 rounded-xl p-4" >
                            <p class="text-terra-300 text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Adjust Stock
                            </p>
                            <div class="flex gap-2 flex-wrap">
                                <input id="adjustkQty" type="number" min="1" placeholder="Qty to adjust…" class="form-input flex-1 min-w-[120px] py-2.5 text-sm"/>
                                <button id="doAdjustBtn" class="bg-terra-400 hover:bg-terra-300 text-forest-900 text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                    Adjust
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Stock Movement history -->
                    <div class="bg-forest-900/50 border border-forest-800/50 rounded-xl p-4">
                        <p class="text-forest-500 text-[10px] uppercase tracking-widest font-bold mb-1">Stock Movement History</p>
                        <div>${mvHtml}</div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex flex-col sm:flex-row gap-2.5 p-5 border-t border-forest-800/40">
                <div class="flex gap-2 flex-1">
                    <button id="writeOffBtn" class="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium px-3.5 py-2 rounded-xl transition">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        Write Off
                    </button>
                </div>
            </div>`;
    }

    filterCategory.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        renderTable();
    });

    filterSort.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        renderTable();
    });

    filterSearch.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        currentPage = 1;
        renderTable();
    });

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

    renderTable();

    
})



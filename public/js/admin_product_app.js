// Populate category dropdown 
const selectCategory = document.getElementById('filterCategory');
productCategories.forEach(category => {
    selectCategory.insertAdjacentHTML('beforeend',`<option value="${category}">${category}</option>`);
});

// Populate status dropdown 
const selectStatus = document.getElementById('filterStatus');
productStatuses.forEach(status => {
    selectStatus.insertAdjacentHTML('beforeend',`<option value="${status}">${status}</option>`);
});









document.addEventListener("DOMContentLoaded", async () => {
    // =========================
    // FETCH DATA
    // =========================
    let productsData = [];
    try {
        const response = await fetch('/a/products/list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });

        const data = await response.json();

        if (data.success) {
            productsData = data.products || [];
            console.log(productsData);
        }

    } catch (err) {
        console.error(err);
    }



    const filterSearch = document.getElementById('filterSearch');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const productsTbody = document.getElementById('productsTbody');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationBtns = document.getElementById('paginationBtns');
    let currentCategory = 'all';
    let currentStatus = 'all';
    let currentSearch = '';
    let currentPage = 1;
    let rowsPerPage = 10;

    function getFilteredData() {

        let filtered = [...productsData];

        // CATEGORY FILTER
        if (currentCategory !== 'all') {
            filtered = filtered.filter(product => {
                return product.productCategory === currentCategory;
            });
        }

        // STATUS FILTER
        if (currentStatus !== 'all') {
            filtered = filtered.filter(product => {
                return product.productStatus === currentStatus;
            });
        }

        // SEARCH FILTER
        if (currentSearch) {
            filtered = filtered.filter(product => {
                const searchText = `${product.productSKU}${product.productName}`.toLowerCase();
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
        productsTbody.innerHTML = '';

        // EMPTY
        if (paginatedData.length === 0) {
            productsTbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-forest-500">
                        No products found
                    </td>
                </tr>
            `;
            paginationInfo.textContent = `Showing 0 results`;
            paginationBtns.innerHTML = '';
            return;
        }

        // ROWS
        paginatedData.forEach((product, idx) => {

            const tr = document.createElement('tr');
            tr.className = `trow border-b border-forest-800/30 hover:bg-forest-900/20 duration-200 cursor-pointer trow-appear `;
            tr.style.animationDelay = `${idx*0.03}s`;

            tr.innerHTML = `
                <td class="py-4 px-4 font-semibold text-forest-100">
                    ${product.productSKU}
                </td>

                <td class="py-4 px-4 font-semibold text-forest-100">
                    ${product.productName}
                </td>

                <td class="py-4 px-4 font-semibold text-forest-100">
                    ${product.productCategory}
                </td>

                <td class="py-4 px-4 font-semibold text-forest-100">
                    ${product.productStatus}
                </td>

                <td class="py-4 px-3 text-forest-300">
                    ${product.productVariants.length} variant(s)
                </td>

                <td class="py-4 px-3 text-forest-300">
                   Medium
                </td>`;

            tr.addEventListener('click', () => {
                openModal(buildProductViewHtml(product));
            });

            productsTbody.appendChild(tr);

        });
        renderPagination(filteredData.length, totalPages, start, end);
    }

    // =========================
    // PAGINATION
    // =========================

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


    // View product info in modal
    function buildProductViewHtml(p) {
        /* images */
        const imagesHtml = p.productImages.length
            ? p.productImages.map(img => `
                <div class="pm-img-thumb">
                <img src="${img.imagePath}" alt="${img.imageName}"
                    onerror="this.parentElement.innerHTML='<svg class=pm-img-placeholder viewBox=\\'0 0 24 24\\'><path fill=\\'currentColor\\' d=\\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-8.5-5.5l-2 2.79L8 13l-3 4h14l-4.5-5.5z\\'/></svg>'">
                </div>`).join('')
            : `<div class="pm-img-thumb"><svg class="pm-img-placeholder" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-8.5-5.5l-2 2.79L8 13l-3 4h14l-4.5-5.5z"/></svg></div>`;

        /* variants */
        const variantsHtml = p.productVariants.map(v => {
            const hasSale = parseFloat(v.variantSalePrice) > 0;
            return `
            <div class="variant-card">
                <div class="vc-name">${v.variantName}</div>
                <div class="vc-row">
                <span class="vc-price-regular">₱${parseFloat(v.variantRegularPrice).toFixed(2)}</span>
                ${hasSale ? `<span class="vc-price-sale">Sale ₱${parseFloat(v.variantSalePrice).toFixed(2)}</span>` : ''}
                </div>
                <div class="vc-price-cost">Cost: ₱${parseFloat(v.variantCostPrice).toFixed(2)}</div>
                <div class="vc-stocks">
                <div>
                    <div class="vc-stock-num">${v.variantStocks}</div>
                    <div class="vc-stock-unit">${v.variantUnit}</div>
                </div>
                <div style="text-align:right">
                    <div class="vc-label">SKU</div>
                    <div class="vc-value">${v.variantSKU}</div>
                </div>
                </div>
                <div class="vc-expiry">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Exp: ${dateMDY(v.variantExpirationDate)}
                </div>
            </div>`;
        }).join('');

        /* all movements flat */
        const allMovements = p.productVariants.flatMap(v =>
            v.stocksMovement.map(m => ({ ...m, variantName: v.variantName }))
        ).sort((a, b) => a.movementID - b.movementID);

        const movementsHtml = allMovements.map((m,idx) => `
            <tr>
            <td>${idx + 1}</td>
            <td><span class="mt-variant-badge">${m.variantName}</span></td>
            <td><span class="mt-type">↑ ${m.movementType}</span></td>
            <td class="mt-qty">+${m.movementQuantity}</td>
            <td>${dateMDY(m.movementDate)}</td>
            
            </tr>`).join('');

        return `
            <!-- Header -->
            <div class="pm-header">
            <div>
                <div class="pm-title" id="pm-title-text">${p.productName}</div>
                <div class="pm-sku">SKU: ${p.productSKU}</div>
            </div>
            <button class="pm-close" id="closeModal" aria-label="Close modal">✕</button>
            </div>

            <!-- Badges -->
            <div class="pm-badges">
            <span class="badge badge-green">${p.productStatus}</span>
            ${p.productFeatured === 'true' ? '<span class="badge badge-yellow">★ Featured</span>' : ''}
            <span class="badge badge-gray">${p.productCategory}</span>
            <span class="badge badge-orange">${p.productSubCategory}</span>
            </div>

            <!-- Images -->
            ${p.productImages.length ? `<div class="pm-images">${imagesHtml}</div>` : ''}

            <div class="pm-divider"></div>

            <!-- Description -->
            <div class="pm-desc">${p.productDescription}</div>

            <div class="pm-divider"></div>

            <!-- Variants -->
            <div class="pm-section-label" style="padding-top:20px">Variants</div>
            <div class="pm-variants">${variantsHtml}</div>

            <div class="pm-divider"></div>

            <!-- Stock movements -->
            <div class="pm-section-label" style="padding-top:20px">Stock Movements</div>
            <div class="pm-movements">
            <div style="overflow-x:auto; border-radius:12px; border:1px solid rgba(255,255,255,.07);">
                <table class="movement-table">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Variant</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Date</th>
                    </tr>
                </thead>
                <tbody>${movementsHtml}</tbody>
                </table>
            </div>
            </div>

            <!-- Footer timestamps -->
            <div class="pm-footer">
            <div class="pm-ts">Created<span>${dateMDY(p.productCreated)}</span></div>
            <div class="pm-ts">Updated<span>${dateMDY(p.productUpdated)}</span></div>
            </div>`;
    }


    //Search Event listener
    filterSearch.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        currentPage = 1;
        renderTable();
    });

    // Category Event listener
    filterCategory.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        renderTable();
    });

    // Category Event listener
    filterStatus.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        currentPage = 1;
        renderTable();
    });


    //Render Table
    renderTable();
})



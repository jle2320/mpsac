const activeUser = JSON.parse(document.body.dataset.user);

// Populate category 
const productCategory = document.getElementById('productCategory');
productCategories.forEach(category => {
    productCategory.innerHTML += `<button class="filter-chip text-xs border border-forest-200 px-3 py-1.5 rounded-full transition hover:border-forest-400" value="${category}" >${category}</button>`;
});





document.addEventListener("DOMContentLoaded", async () => {

    // =========================
    // FETCH DATA
    // =========================
    let productsData = [];
    try {
        const response = await fetch('/index/list/products', {
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



    const productGrid = document.getElementById('productGrid');
    let selectedCategory = null;

    function getFilteredData() {
        let filtered = [...productsData];
        if (selectedCategory) {
            filtered = filtered.filter(product => {
                return product.productCategory === selectedCategory;
            });
        }
        return filtered;
    }

    function renderProducts() {
        const filteredData = getFilteredData();
        productGrid.innerHTML = '';
        // EMPTY
        if (filteredData.length === 0) {
            productGrid.innerHTML = ` no Products`;
            return;
        }

        // ROWS
        filteredData.forEach((product, idx) => {
            const productDate = new Date(product.productCreated);
            const today = new Date();
            const diffTime = today - productDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            let newTag = '';
            if (diffDays <= 10) {
                newTag = `<span class="absolute top-3 right-3 bg-white/90 text-forest-700 text-xs font-bold px-2 py-1 rounded-full">New</span>`;
            }

            const productDiv = document.createElement('div');
            productDiv.className = `animate-fadeUpOrder product-card group bg-white border border-forest-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-forest-200/40 transition-all`;

            // --- price range from variants ---
            const prices = product.productVariants.map(v => parseFloat(v.variantRegularPrice)).filter(Boolean);
            const salePrices = product.productVariants.map(v => parseFloat(v.variantSalePrice)).filter(p => p > 0);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const hasSale = salePrices.length > 0;
            const priceDisplay = minPrice === maxPrice
                ? `₱${minPrice.toFixed(2)}`
                : `₱${minPrice.toFixed(2)} – ₱${maxPrice.toFixed(2)}`;

            // --- total stock ---
            const totalStock = product.productVariants.reduce((sum, v) => sum + v.variantStocks, 0);

            // --- first image ---
            const firstImage = product.productImages?.[0]?.imagePath ?? null;

            // --- image html ---
            const imageHtml = firstImage
                ? `<img src="${firstImage}" alt="${product.productName}" class="pc-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : '';
            const placeholderStyle = firstImage ? 'display:none;' : '';

            // --- variant pills (up to 3) ---
            const variantPills = product.productVariants.slice(0, 3).map(v =>
                `<span class="pc-pill">${v.variantName}</span>`
            ).join('');
            const extraVariants = product.productVariants.length > 3
                ? `<span class="pc-pill pc-pill-more">+${product.productVariants.length - 3}</span>` : '';

            productDiv.innerHTML = `
              <div class="pc-image-wrap">
                ${imageHtml}
                <div class="pc-img-placeholder" style="${placeholderStyle}">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bde4ba" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                ${newTag}
                ${hasSale ? '<span class="pc-sale-badge">Sale</span>' : ''}
                <div class="pc-hover-overlay">
                  <button class="pc-view-btn" data-id="${product.productID}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View Product
                  </button>
                </div>
              </div>

              <div class="pc-body">
                <div class="pc-meta">
                  <span class="pc-category">${product.productCategory}</span>
                  <span class="pc-sub">· ${product.productSubCategory}</span>
                </div>

                <h3 class="pc-name">${product.productName}</h3>

                <div class="pc-pills-row">
                  ${variantPills}${extraVariants}
                </div>

                <div class="pc-footer">
                  <div>
                    <div class="pc-price">${priceDisplay}</div>
                    ${hasSale ? '<div class="pc-sale-note">Sale available</div>' : ''}
                  </div>
                  <div class="pc-stock ${totalStock <= 20 ? 'pc-stock-low' : ''}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 12H4V9h16v10zM4 5h16V3H4z"/></svg>
                    ${totalStock} in stock
                  </div>
                </div>
              </div>
            `;
            productGrid.appendChild(productDiv);
            productDiv.querySelector('.pc-view-btn').addEventListener('click', () => {
                const p = productsData.find(x => x.productID === product.productID);
                //create a form here and submit the product
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/product/view';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'data';
                input.value = JSON.stringify(product);
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            });
        });
    }

    


    function renderFeatured(){
      const featuredGrid = document.getElementById('featuredGrid');
      const featuredProducts = productsData
                .filter(p => p.productFeatured == 'true')
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
      featuredGrid.innerHTML = '';
      // EMPTY
      if (featuredProducts.length === 0) {
          featuredGrid.innerHTML = ` no Products`;
          return;
      }

      featuredProducts.forEach(product => {
        const productDate = new Date(product.productCreated);
        const today = new Date();
        const diffTime = today - productDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        let newTag = '';
        if (diffDays <= 10) {
            newTag = `<span class="absolute top-3 right-3 bg-white/90 text-forest-700 text-xs font-bold px-2 py-1 rounded-full">New</span>`;
        }

        const productDiv = document.createElement('div');
        productDiv.className = `animate-fadeUpOrder product-card group bg-white border border-forest-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-forest-200/40 transition-all`;
      
        // --- price range from variants ---
        const prices = product.productVariants.map(v => parseFloat(v.variantRegularPrice)).filter(Boolean);
        const salePrices = product.productVariants.map(v => parseFloat(v.variantSalePrice)).filter(p => p > 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const hasSale = salePrices.length > 0;
        const priceDisplay = minPrice === maxPrice
            ? `₱${minPrice.toFixed(2)}`
            : `₱${minPrice.toFixed(2)} – ₱${maxPrice.toFixed(2)}`;

        // --- total stock ---
        const totalStock = product.productVariants.reduce((sum, v) => sum + v.variantStocks, 0);

        // --- first image ---
        const firstImage = product.productImages?.[0]?.imagePath ?? null;

        // --- image html ---
        const imageHtml = firstImage
            ? `<img src="${firstImage}" alt="${product.productName}" class="pc-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : '';
        const placeholderStyle = firstImage ? 'display:none;' : '';

        // --- variant pills (up to 3) ---
        const variantPills = product.productVariants.slice(0, 3).map(v =>
            `<span class="pc-pill">${v.variantName}</span>`
        ).join('');
        const extraVariants = product.productVariants.length > 3
            ? `<span class="pc-pill pc-pill-more">+${product.productVariants.length - 3}</span>` : '';

        productDiv.innerHTML = `
          <div class="pc-image-wrap">
            ${imageHtml}
            <div class="pc-img-placeholder" style="${placeholderStyle}">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bde4ba" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            ${newTag}
            ${hasSale ? '<span class="pc-sale-badge">Sale</span>' : ''}
            <div class="pc-hover-overlay">
              <button class="pc-view-btn" data-id="${product.productID}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View Product
              </button>
            </div>
          </div>

          <div class="pc-body">
            <div class="pc-meta">
              <span class="pc-category">${product.productCategory}</span>
              <span class="pc-sub">· ${product.productSubCategory}</span>
            </div>

            <h3 class="pc-name">${product.productName}</h3>

            <div class="pc-pills-row">
              ${variantPills}${extraVariants}
            </div>

            <div class="pc-footer">
              <div>
                <div class="pc-price">${priceDisplay}</div>
                ${hasSale ? '<div class="pc-sale-note">Sale available</div>' : ''}
              </div>
              <div class="pc-stock ${totalStock <= 20 ? 'pc-stock-low' : ''}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 12H4V9h16v10zM4 5h16V3H4z"/></svg>
                ${totalStock} in stock
              </div>
            </div>
          </div>
        `;
        featuredGrid.appendChild(productDiv);
        productDiv.querySelector('.pc-view-btn').addEventListener('click', () => {
            const p = productsData.find(x => x.productID === product.productID);
            //create a form here and submit the product
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/product/view';
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'data';
            input.value = JSON.stringify(product);
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        });
      });
    }


    renderFeatured();
    renderProducts();





});






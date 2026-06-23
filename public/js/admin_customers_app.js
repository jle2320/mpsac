



document.addEventListener("DOMContentLoaded", async () => {
    // =========================
    // FETCH DATA
    // =========================
    let customers = [];
    try {
        const response = await fetch('/a/customers/list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });

        const data = await response.json();

        if (data.success) {
            customers = data.customers || [];
        }

    } catch (err) {
        console.error(err);
    }

    const filterSearch = document.getElementById('filterSearch');
    const filterSort = document.getElementById('filterSort');
    const customersBody = document.getElementById('customersBody');

   
    let currentSort = 'all';
    let currentSearch = '';
    let currentPage = 1;
    let rowsPerPage = 10;

    function getFilteredData() {

        let filtered = [...customers];

        // STATUS FILTER A-Z
        if (currentSort === 'name-az') {
            filtered.sort((a, b) => {
                const nameA = `${a.userFname} ${a.userLname}`.toLowerCase();
                const nameB = `${b.userFname} ${b.userLname}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
        }

        // STATUS FILTER Z-A
        if (currentSort === 'name-za') {
            filtered.sort((a, b) => {
                const nameA = `${a.userFname} ${a.userLname}`.toLowerCase();
                const nameB = `${b.userFname} ${b.userLname}`.toLowerCase();
                return nameB.localeCompare(nameA);
            });
        }

        // STATUS FILTER Newest first
        if (currentSort === 'newest') {
            filtered.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }

        // STATUS FILTER Oldest first
        if (currentSort === 'oldest') {
            filtered.sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        }

        // STATUS FILTER Spend High-Low
        if (currentSort === 'spend-high') {
            filtered.sort((a, b) => {
                return Number(b.totalSpent) - Number(a.totalSpent);
            });
        }

        // STATUS FILTER Spend Low-High
        if (currentSort === 'spend-low') {
            filtered.sort((a, b) => {
                return Number(a.totalSpent) - Number(b.totalSpent);
            });
        }

        // STATUS FILTER Order High-low
        if (currentSort === 'orders-high') {
            filtered.sort((a, b) => {
                return Number(b.totalOrders) - Number(a.totalOrders);
            });
        }

        // STATUS FILTER Order Low-High
        if (currentSort === 'orders-low') {
            filtered.sort((a, b) => {
                return Number(a.totalOrders) - Number(b.totalOrders);
            });
        }

        // SEARCH FILTER
        if (currentSearch) {
            filtered = filtered.filter(row => {
                const searchText = `${row.userFname} ${row.userLname}`.toLowerCase();
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
        customersBody.innerHTML = '';

        // EMPTY
        if (paginatedData.length === 0) {
            customersBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-forest-500">
                        No customer found
                    </td>
                </tr>
            `;
            paginationInfo.textContent = `Showing 0 results`;
            paginationBtns.innerHTML = '';
            return;
        }

        // ROWS
        paginatedData.forEach((row, idx) => {
            const avIdx    = idx % AVATAR_CLASSES.length;
            const avClass = AVATAR_CLASSES[avIdx];
            const tr = document.createElement('tr');
            tr.className = `trow border-b border-forest-800/30 hover:bg-forest-900/20 duration-200 cursor-pointer trow-appear `;
            tr.style.animationDelay = `${idx*0.03}s`;

            let emailVerified = `<span class="badge bg-terra-500/20 text-terra-500">Unverified</span>`;
            if(row.emailVerified == 'true'){
                emailVerified = `<span class="badge bg-forest-500/20 text-forest-300">Verified</span>`;
            }

            let phoneVerified = `<span class="badge bg-terra-500/20 text-terra-500">Unverified</span>`;
            if(row.phoneVerified == 'true'){
                phoneVerified = `<span class="badge bg-forest-500/20 text-forest-300">Verified</span>`;
            }

            tr.innerHTML = `
                <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full ${avClass} flex items-center justify-center font-bold text-xs shrink-0">${row.userFname[0]}${row.userLname[0]}</div>
                        <p class="text-forest-100 text-xs font-semibold truncate">${row.userFname} ${row.userLname}</p>
                    </div>
                </td>

                <td class="py-3.5 px-4">
                    <div class="flex flex-col gap-3">
                        <p class="text-forest-100 text-xs font-semibold truncate">${row.userEmail}</p>
                        <p class="m-0 text-forest-500 text-[8px] truncate">${emailVerified}</p>
                    </div>
                </td>

                <td class="py-3.5 px-4">
                    <div class="flex flex-col gap-3">
                        <p class="text-forest-100 text-xs font-semibold truncate">${row.userPhone}</p>
                        <p class="m-0 text-forest-500 text-[8px] truncate">${phoneVerified}</p>
                    </div>
                </td>

                <td class="py-3.5 px-3 col-join">
                    <p class="text-forest-500 text-xs">${row.createdAt}</p>
                </td>

                <td class="py-3.5 px-3 col-orders">
                    <p class="text-forest-300 text-xs font-semibold">${row.totalOrders}</p>
                </td>
                <td class="py-3.5 px-4">
                    <p class="text-white text-xs font-bold">₱${row.totalSpent.toLocaleString()}</p>
                </td>`;

            customersBody.appendChild(tr);

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

    renderTable();

})



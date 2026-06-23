document.addEventListener("DOMContentLoaded", async () => {
   countTodayRevenue();
   countRevenue7Days();
   countOrdersOngoing();
   countTotalProducts();
   countTotalCustomers();
   selectLimit10PendingOrders();
   selectAllLowStockVariants();
   selectLimit10MovementStocks();
})


// Revenue Chart Buttons period
document.querySelectorAll('.chart-period').forEach(button => {
    button.addEventListener('click', function(){
        document.querySelectorAll('.chart-period').forEach(btn => {
            btn.classList.remove('bg-harvest-400/20',  'text-harvest-400', 'border',  'border-harvest-400/30');
            btn.classList.add('bg-forest-800/60', 'text-forest-400');
        });

        this.classList.remove('bg-forest-800/60', 'text-forest-400' );
        this.classList.add('bg-harvest-400/20', 'text-harvest-400', 'border', 'border-harvest-400/30');

        const period = this.dataset.period;
        if(period === '7d') countRevenue7Days();
        if(period === '4w') countRevenue4Weeks();
        if(period === '12m') countRevenue12Months();
    });

});




// Count Today Revenue
async function countTodayRevenue(){
    try{
        const response = await fetch('/a/dashboard/count/revenue/today', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const revenue = await response.json();

        const todayStat = Number(revenue.todayStat);
        const yesterdayStat = Number(revenue.yesterdayStat);

        let revenueGap = 0;

        if (yesterdayStat === 0) {
            revenueGap = todayStat === 0 ? 0 : 100;
        } else {
            revenueGap = ((todayStat - yesterdayStat) / yesterdayStat) * 100;
        }

        let formattedGap = `0%`;
        if (revenueGap > 0) {
            formattedGap = `<span class='text-forest-500' >&#x2191; +${revenueGap.toFixed(2)}%</span>`;
        } else if (revenueGap < 0) {
            formattedGap = `<span class='text-terra-500' >&#x2193; ${revenueGap.toFixed(2)}%</span>`; 
        }

        document.getElementById('todayStatRevenue').textContent = `₱`+ todayStat;
        document.getElementById('yesterdayStatRevenue').textContent = `₱`+ yesterdayStat;
        document.getElementById('yesterdayTodayRevenueGap').innerHTML = formattedGap;


    }catch{
        console.log('Failed to load Today revenue.');
    }
}

// Count Ongoing Orders
async function countOrdersOngoing(){
    try{
        const response = await fetch('/a/dashboard/count/orders/ongoing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const orders = await response.json();

        if(orders.success){
            const totalOngoingOrders = orders.ongoingOrders.length;
            const pendingOrders = orders.ongoingOrders.filter(o => o.orderStatus === 'pending').length;

            document.getElementById('statOngoingOrders').textContent = totalOngoingOrders;
            document.getElementById('statPendingOrders').textContent = pendingOrders + ` pending/s`;
        }
        
    }catch{
        console.log('Failed to load total ongoing orders.');
    }
}

// Count Total Products
async function countTotalProducts(){
    try{
        const response = await fetch('/a/dashboard/count/total/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const products = await response.json();

        if(products.success){
            const totalProducts = products.products.length;

            let lowStockCount = 0;

            products.products.forEach(product => {
                product.variantStocks.forEach(variant => {
                    if ( Number(variant.stockQuantity) <= Number(variant.stockLowAlert)) {
                        lowStockCount++;
                    }
                });
            });

            document.getElementById('statTotalProducts').textContent = totalProducts;
            document.getElementById('statTotalLowStock').textContent = lowStockCount === 0 ? `` : lowStockCount + ` variants are low in stock`;
        }
        
    }catch{
        console.log('Failed to load total products.');
    }
}

// Count Total Customers
async function countTotalCustomers(){
    try{
        const response = await fetch('/a/dashboard/count/total/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){
            const totalCustomer = data.customers.length;
            const unverifiedCustomers = data.customers.filter(c =>
                c.emailVerified === 'false' &&
                c.phoneVerified === 'false'
            ).length;

            document.getElementById('statTotalCustomer').textContent = totalCustomer;
            document.getElementById('statTotalUnverifiedCustomer').textContent = unverifiedCustomers + ` unverified users.`;
        }
        
    }catch{
        console.log('Failed to load total ongoing orders.');
    }
}










// Count Revenue for 7 days
async function countRevenue7Days(){
    try{
        const response = await fetch('/a/dashboard/count/revenue/7days', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){

            const revenue = data.revenue7Days;
            let chartData = {
                labels: [],
                data: []
            };

            chartData = {
                labels: revenue.map(r => {
                    const date = new Date(r.revenueDate);

                    return date.toLocaleDateString('en-US', {
                        weekday: 'short'
                    });
                }),

                data: revenue.map(r => Number(r.totalRevenue))
            };
            
            renderRevenueChart(chartData, 'revenueChart');
        }
    }catch{
        console.log('Failed to load revenue for 7 days');
    }
}



// Count Revenue for 4 weeks
async function countRevenue4Weeks(){
    try{
        const response = await fetch('/a/dashboard/count/revenue/4weeks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){

            const revenue = data.revenue4Weeks;
            let chartData = {
                labels: [],
                data: []
            };

            chartData = {
                labels: revenue.map((r, i)=> `Week ` + Number( i+1 )),
                data: revenue.map(r => Number(r.totalRevenue))
            };
            
            renderRevenueChart(chartData, 'revenueChart');
        }
    }catch{
        console.log('Failed to load revenue for 4 weeks');
    }
}


// Count Revenue for 12 months
async function countRevenue12Months(){
    try{
        const response = await fetch('/a/dashboard/count/revenue/12months', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){

            const revenue = data.revenue12Months;
            let chartData = {
                labels: [],
                data: []
            };

            chartData = {
                labels: revenue.map(r => r.monthLabel),
                data: revenue.map(r => Number(r.totalRevenue))
            };
            
            renderRevenueChart(chartData, 'revenueChart');
        }
    }catch{
        console.log('Failed to load revenue for 12 months');
    }
}



// Get  pending orders limit 10
async function selectLimit10PendingOrders(){
    try{
        const response = await fetch('/a/dashboard/select/limit/10pending/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){

            const orders = data.orders;

            let rows = '';

            orders.forEach(o => {
                rows += `
                    <tr class="trow border-b border-forest-800/30">

                        <td class="py-3 px-1 text-forest-400 text-xs font-mono">
                            ${o.orderNumber}
                        </td>

                        <td class="py-3 px-1">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-harvest-400/20 flex items-center justify-center text-harvest-400 text-[10px] font-bold">
                                    ${o.customerName?.[0] || ''}
                                </div>
                                <span class="text-forest-200 text-xs">
                                    ${o.customerName}
                                </span>
                            </div>
                        </td>

                        <td class="py-3 px-1 text-forest-400 text-xs hidden sm:table-cell">
                            ${o.items?.length || 0} variant/s
                        </td>

                        <td class="py-3 px-1 text-white text-xs font-semibold">
                            ₱${o.totalAmountOrder}
                        </td>

                        <td class="py-3 px-1 text-forest-400">
                            ${o.orderDate}
                        </td>

                    </tr>
                `;
            });

            document.getElementById('tbodyPendingOrderTable').innerHTML = rows;
        }
    }catch{
        console.log('Failed to load 10 pending orders');
    }
}



// Get all the low stocks varaints
async function selectAllLowStockVariants(){
    try{
        const response = await fetch('/a/dashboard/select/lowstocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){

            const lowStocks = data.lowStocks;

            let rows = '';

            lowStocks.slice(0, 3).forEach(ls => {
                const quantity = Number(ls.quantity);
                const lowStockAlert = Number(ls.lowStockAlert);
                const criticalGap = (quantity / lowStockAlert) * 100;
                let criticalIndicator = ``;
                if (criticalGap <= 0) {
                    criticalIndicator = `<span class="text-harvest-900 font-bold bg-terra-400 text-[9px] font-medium px-4 py-1 rounded-full">Out of Stock</span>`;
                } else if (criticalGap <= 50) {
                    criticalIndicator = `<span class="text-terra-400 font-bold bg-terra-500/20 text-[9px] font-medium px-4 py-1 rounded-full">Critical</span>`;
                } else if (criticalGap <= 100) {
                    criticalIndicator = `<span class="text-harvest-400 font-bold bg-harvest-500/20 text-[9px] font-medium px-4 py-1 rounded-full">Low Stock</span>`;
                }
                rows += `
                    <div class="flex items-center gap-3 p-2.5 bg-terra-900/20 border border-terra-800/30 rounded-xl">
                        <span class="text-xl">🥦</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-forest-200 text-sm font-medium truncate">${ls.productName}</p>
                            <p class="text-forest-500 text-xs">${ls.variantName}</p>
                            <p class="text-terra-400 text-[10px]">Only ${quantity} units left</p>
                        </div>
                        ${criticalIndicator}
                    </div>
                 `;
            });

            document.getElementById('lowStockCTX').innerHTML = rows;
            document.getElementById('totalLowStock').textContent = lowStocks.length + ` item/s`;
        }
    }catch{
        console.log('Failed to load low stocks');
    }
}



// Get  movement stocks limit 10
async function selectLimit10MovementStocks(){
    try{
        const response = await fetch('/a/dashboard/select/limit/10movementstocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if(data.success){

            const movementStock = data.movementStock;

            let rows = '';

            movementStock.forEach(m => {
                let movementIndicator  = `<div class="flex items-center gap-2 mb-0">
                                            <p class="text-forest-500 text-xs font-medium">&#x2191;</p>
                                            <p class="text-forest-500 text-xs font-medium">+${m.quantity}</p>
                                        </div>
                                        <span class="text-forest-400 text-xs font-medium">${STOCK_MOVEMENT[m.movementType].label}</span>`;
                if(m.quantity < 0){
                    movementIndicator  = `<div class="flex items-center gap-2 mb-0">
                                            <p class="text-terra-500 text-xs font-medium">&#x2193;</p>
                                            <p class="text-terra-500 text-xs font-medium">${m.quantity}</p>
                                        </div>
                                        <span class="text-terra-400 text-xs font-medium">${STOCK_MOVEMENT[m.movementType].label}</span>`;
                }

                rows += `
                    <div class="flex items-center justify-between">
                        <div>
                        <p class="text-forest-200 text-xs font-medium">${m.productName}</p>
                        <p class="text-forest-500 text-[10px]">${m.variantName}</p>
                        </div>
                        <div>${movementIndicator}</div>
                    </div>
                    <div class="h-px bg-forest-800/50"></div>
                 `;
            });

            document.getElementById('recentMovementStockCTX').innerHTML = rows;
        }
    }catch{
        console.log('Failed to load low stocks');
    }
}





















































//// MAIN
// revenueChart
let revenueChartInstance = null;
function renderRevenueChart(chartData, ctx){
    const revenueCtx = document.getElementById(ctx).getContext('2d');
    if(revenueChartInstance){
        revenueChartInstance.destroy();
    }

    const gradient = revenueCtx.createLinearGradient(0, 0, 0, 220);

    gradient.addColorStop(0, 'rgba(251,191,36,0.3)');
    gradient.addColorStop(1, 'rgba(251,191,36,0.01)');

    revenueChartInstance = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                borderColor: '#fbbf24',
                borderWidth: 2.5,
                pointBackgroundColor: '#fbbf24',
                pointBorderColor: '#0e2410',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },

            plugins: {
                legend: { display: false },

                tooltip: {
                    backgroundColor: 'rgba(24,61,23,0.95)',
                    borderColor: 'rgba(251,191,36,0.3)',
                    borderWidth: 1,
                    titleColor: '#fbbf24',
                    bodyColor: '#8fce8a',
                    padding: 10,

                    callbacks: {
                        label: ctx => ' ₱' + ctx.raw.toLocaleString()
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawBorder: false
                    },

                    ticks: {
                        color: '#5cb356',
                        font: { size: 11 }
                    }
                },

                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawBorder: false
                    },

                    ticks: {
                        color: '#5cb356',
                        font: { size: 11 },

                        callback: v =>
                            '₱' + (v >= 1000
                                ? (v/1000).toFixed(0) + 'k'
                                : v)
                    }
                }
            }
        }
    });
}
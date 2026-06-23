document.addEventListener("DOMContentLoaded", async () => {
    


    fetchCartProducts();


    document.addEventListener('click', async function(e){

        // ADD
        if(e.target.classList.contains('add-quantity')){
            const cartId = e.target.dataset.cartIndex;
            updateCartItem(cartId, '+', 1);
        }

        // MINUS
        if(e.target.classList.contains('minus-quantity')){
            const cartId = e.target.dataset.cartIndex;
            updateCartItem(cartId, '-', 1);
        }

        // Delete
        if(e.target.classList.contains('delete-item')){
            const cartId = e.target.dataset.cartIndex;
                try {
                const response = await fetch('/myCart/delete/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartId:cartId})
                });

                const data = await response.json();

                if (data.success) {
                    fetchCartProducts();
                    badgeCountCartProduct();
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "Request Failed",
                    text: "Unable to load products"
                });
            }
        }

    });

    async function fetchCartProducts(){
        try {
            const response = await fetch('/myCart/list/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                if(data.data.length != 0){
                    document.getElementById('cart-items-container').innerHTML = '';
                    let subTotal = 0;
                    data.data.forEach((product, index) => {
                        const productName = product.productName;
                        const variantName = product.variantName;
                        const variantStock = product.variantStock;
                        const variantRegularPrice = Number(product.variantRegularPrice);
                        const variantSalePrice = Number(product.variantSalePrice);
                        const variantUnit = product.variantUnit;
                        const quantity = Number(product.quantity);
                        const cartID = product.cartID;
                        const image = product.images[0].imagePath;

                        let variantPrice = variantRegularPrice.toFixed(2);
                        let origPrice = ``;
                        let totalProductPrice = variantPrice * quantity;
                        if(variantSalePrice > 0 ){
                            variantPrice = variantSalePrice.toFixed(2);
                            origPrice = `<span class="text-forest-400 line-through text-xs">₱${variantRegularPrice.toFixed(2)}</span>`;
                            totalProductPrice = variantPrice * quantity;
                        }

                        subTotal += totalProductPrice;

                        const btnAddQuantity = variantStock <= quantity ? 'disabled' : '';
                        const btnMinusQuantity = quantity <= 1 ? 'disabled' : '';

                        document.getElementById('cart-items-container').innerHTML += `
                            <div class="bg-white border border-forest-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                <div class="w-24 h-24 bg-forest-50 rounded-xl overflow-hidden shrink-0">
                                <img src="${image}" alt="Product" class="w-full h-full object-cover">
                                </div>
                                
                                <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <h3 class="font-display text-lg text-forest-900 font-bold">${productName}</h3>
                                    <button class="text-terra-400 hover:text-terra-600 transition">
                                    <svg data-cart-index="${cartID}" class="delete-item w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                                <span class="text-forest-900 font-bold mb-2">₱${variantPrice}</span>
                                ${origPrice}
                                
                                
                                <div class="flex justify-between items-center">
                                <span>${variantName}</span>
                                    <div class="flex items-center gap-1">
                                        <div class="flex items-center bg-forest-50 rounded-lg border border-forest-100">
                                            <button ${btnMinusQuantity} data-cart-index="${cartID}" class="minus-quantity px-3 py-1 text-forest-600 hover:bg-forest-100 rounded-l-lg transition">-</button>
                                            <span class="px-3 py-1 font-bold text-forest-900 text-sm">${quantity}</span>
                                            <button ${btnAddQuantity} data-cart-index="${cartID}" class="add-quantity px-3 py-1 text-forest-600 hover:bg-forest-100 rounded-r-lg transition">+</button>
                                        </div>
                                        <span>${variantUnit}</span>
                                    </div>
                                    <span class="font-bold text-forest-900">Total ₱${totalProductPrice.toFixed(2)}</span>
                                </div>
                                </div>
                            </div>
                        `
                    });

                    document.getElementById('cart-item-count').innerHTML = `(${data.data.length} items)`;
                    document.getElementById('cart-total-price').innerHTML = `₱${subTotal.toFixed(2)}`;
                }else{
                    document.getElementById('cart-section').innerHTML = `<div class="lg:col-span-2 space-y-4 text-center" ><p class="text-grey-500 font-body">Your cart is empty. <a href="/#products" class='text-forest-500' >Continue Shopping</a></p></div>`;
                }
            } else {
                showToast('Server Error');
            }

        } catch (err) {
            showToast('Unable to load cart');
        }
    }

    async function updateCartItem(cartId, operator, quantity){
        try {
            const response = await fetch('/myCart/update/products/quantity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartId:cartId, operator:operator, quantity:quantity })
            });

            const data = await response.json();

            if (data.success) {
                fetchCartProducts();
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Request Failed",
                text: "Unable to load products"
            });
        }
    }


});






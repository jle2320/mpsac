document.addEventListener("DOMContentLoaded", async () => {
    fetchCartProducts();
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


                        document.getElementById('cart-items-container').innerHTML += `
                            <div class="bg-white border border-forest-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                <div class="w-24 h-24 bg-forest-50 rounded-xl overflow-hidden shrink-0">
                                <img src="${image}" alt="Product" class="w-full h-full object-cover">
                                </div>
                                
                                <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <h3 class="font-display text-lg text-forest-900 font-bold">${productName}</h3>
                                </div>
                                <span class="text-forest-900 font-bold mb-2">₱${variantPrice}</span>
                                ${origPrice}
                                
                                
                                <div class="flex justify-between items-center">
                                <span>${variantName}</span>
                                    <div class="flex items-center gap-1">
                                        <span class="px-3 py-1 font-bold text-forest-900 text-sm">${quantity}</span>
                                        <span>${variantUnit}</span>
                                    </div>
                                    <span class="font-bold text-forest-900">Total ₱${totalProductPrice.toFixed(2)}</span>
                                </div>
                                </div>
                            </div>
                        `
                    });

                    document.getElementById('cart-total-price').innerHTML = `₱${subTotal.toFixed(2)}`;
                    document.getElementById('total-price').innerHTML = `₱${subTotal.toFixed(2)}`;
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



































 

    document.getElementById('place-order').addEventListener('click', async (e) => {

        const btn = e.target;
        btn.disabled = true;

        const deliveryAddressPerson = document.getElementById('deliveryAddressPerson').value;
        const deliveryAddressNumber = document.getElementById('deliveryAddressNumber').value;
        const deliveryAddressStreet = document.getElementById('deliveryAddressStreet').value;
        const deliveryAddressBarangay = document.getElementById('deliveryAddressBarangay').value;
        const deliveryAddressCity = document.getElementById('deliveryAddressCity').value;
        const deliveryAddressProvince = document.getElementById('deliveryAddressProvince').value;
        const deliveryAddressLandmark = document.getElementById('deliveryAddressLandmark').value;
        const paymentMethod = document.getElementById('payment-method').value;

        try {

            if (!deliveryAddressPerson || !deliveryAddressNumber || !deliveryAddressStreet || !deliveryAddressBarangay || !deliveryAddressCity || !deliveryAddressProvince || !deliveryAddressLandmark || !paymentMethod) {
                btn.disabled = false;
                return showToast("All fields with * are required.");
            }

           showToast("Processing order...");

            const response = await fetch('/checkout/placeorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryAddressPerson:deliveryAddressPerson,
                    deliveryAddressNumber:deliveryAddressNumber,
                    deliveryAddressStreet:deliveryAddressStreet,
                    deliveryAddressBarangay:deliveryAddressBarangay,
                    deliveryAddressCity:deliveryAddressCity,
                    deliveryAddressProvince:deliveryAddressProvince,
                    deliveryAddressLandmark:deliveryAddressLandmark,
                    paymentMethod:paymentMethod
                })
            });

            const data = await response.json();

            if (data.success) {

                Swal.fire({
                    icon: "success",
                    title: "Order Placed!",
                    text: "Redirecting...",
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "/";
                });

            } else {
                btn.disabled = false;
                showToast("Something went wrong");
            }

        } catch (err) {
            btn.disabled = false;
            showToast("Unable to Place Order");
        }
    });

});






const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const inputQty = document.getElementById('inputQty');

qtyPlus.addEventListener('click', function () {
  inputQty.value = Number(inputQty.value) + 1;
});

qtyMinus.addEventListener('click', function () {
  const current = Number(inputQty.value);
  if (current > 1) {
    inputQty.value = current - 1;
  }
});

inputQty.addEventListener('change', function () {
  const current = Number(inputQty.value);
  if (current < 1) {
    inputQty.value = 1;
  }
});




const mainImage = document.getElementById('mainImage');
const thumbItems = document.querySelectorAll('.thumb-item');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');

let currentIndex = 0;

function updateGallery(index) {
  const selectedThumb = thumbItems[index];
  const img = selectedThumb.querySelector('img');

  mainImage.src = img.src;
  currentIndex = index;

  thumbItems.forEach(t => t.classList.remove('active'));
  selectedThumb.classList.add('active');
}

thumbItems.forEach((thumb, index) => {
  thumb.addEventListener('click', function () {
    updateGallery(index);
  });
});

arrowLeft.addEventListener('click', function () {
  let newIndex = currentIndex - 1;
  if (newIndex < 0) {
    newIndex = thumbItems.length - 1; 
  }
  updateGallery(newIndex);
});

arrowRight.addEventListener('click', function () {
  let newIndex = currentIndex + 1;
  if (newIndex >= thumbItems.length) {
    newIndex = 0; 
  }
  updateGallery(newIndex);
});



document.addEventListener('DOMContentLoaded', () => {
    const variantBtns = document.querySelectorAll('.variant-btn');
    const variantLabel = document.getElementById('variantNameLabel');
    const variantUnitLabel = document.getElementById('variantUnitLabel');
    const variantStocksLabel = document.getElementById('variantStocksLabel');
    const variantWeightLabel = document.getElementById('variantWeightLabel');
    const priceInfo = document.getElementById('priceInfo');

    variantBtns.forEach((btn) => {
        btn.addEventListener('click', function () {

            variantBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const data = JSON.parse(this.dataset.value);
            variantLabel.textContent = data.variantName;
            variantUnitLabel.textContent = data.variantUnit;
            variantStocksLabel.textContent = data.variantStocks;
            variantWeightLabel.textContent = data.variantWeight;
            inputQty.value = 1;

            if(data.variantSalePrice == 0){
                priceInfo.innerHTML = `<span class="text-forest-800 font-bold text-2xl" >₱${data.variantRegularPrice}</span>`;
            }else{
                priceInfo.innerHTML = `<span class="text-forest-800 font-bold text-2xl" >₱${data.variantSalePrice}</span>
                                        <span class="line-through text-forest-500 text-sm " >₱${data.variantRegularPrice}</span>`;
            }
        });
    });



    document.getElementById('addToCart').addEventListener('click', async () => {
        const activeBtn = document.querySelector('.variant-btn.active');
        if (!activeBtn) return;
        const dataSet = JSON.parse(activeBtn.dataset.value);
        const productID = activeBtn.dataset.product;
        const variantID = dataSet.variantID;
        const variantQuantity = inputQty.value;

        try {
            const response = await fetch('/product/addtocart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productID: productID,
                    variantID: variantID,
                    variantQuantity: variantQuantity
                })
            });

            const data = await response.json();

            if (data.success) {
                badgeCountCartProduct();
                showToast("✔️ Product added to cart", "success");
            } else {
                showToast("⚠️ Failed  to add in cart.", "warning");
            }

        } catch (err) {
          showToast("❌ Server error. Please try again.", "error");
        }
    });
});




const productCategories = [
  "Fruits",
  "Vegetables",
  "Grains",
  "Dairy",
  "Livestock"
];


// Populate category dropdown 
const select = document.getElementById('productCategory');
productCategories.forEach(category => {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  select.appendChild(option);
});





document.getElementById('productName').addEventListener('input', function(){
  countChars(this, 'nameCount', 100); 
});

document.getElementById('productDescription').addEventListener('input', function(){
  const len = this.innerText.trim().length;
  const el = document.getElementById('descCount');
  el.textContent = len + ' characters';
  el.className = 'char-counter' + (len>1000?' warn':'');
});

document.getElementById('toggleFeatured').addEventListener('click', function(){
  this.classList.toggle('on');
});

document.getElementById('toggleCOD').addEventListener('click', function(){
  this.classList.toggle('on');
});



// ── Image upload with drag-and-drop ──
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');

let selectedFiles = []; 

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; 
});

function handleFiles(files) {
    for (let file of files) {
    if (!file.type.startsWith('image/')) continue;
    selectedFiles.push(file);
    displayImage(file);
    }
}

function displayImage(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    // Parent container (important for positioning)
    const preview = document.createElement('div');
    preview.className = "relative w-32 h-32";

    // Image
    const img = document.createElement('img');
    img.src = e.target.result;
    img.className = "w-full h-full object-cover rounded-xl shadow-md";

    // Remove button (TOP-LEFT INSIDE IMAGE)
    const removeBtn = document.createElement('button');
    removeBtn.className = `
      absolute top-2 left-2 z-10
      w-7 h-7
      flex items-center justify-center
      rounded-full
      bg-black/70 backdrop-blur
      text-white text-sm font-bold
      hover:bg-red-600
      transition
    `;
    removeBtn.innerHTML = "×";

    removeBtn.onclick = () => {
      preview.remove();
      selectedFiles = selectedFiles.filter(f => f !== file);
    };

    preview.appendChild(img);
    preview.appendChild(removeBtn);
    previewContainer.appendChild(preview);
  };

  reader.readAsDataURL(file);
}























// ── Char counter ──
function countChars(el, countId, max){
  const len = el.value.length;
  const counter = document.getElementById(countId);
  counter.textContent = len + ' / ' + max;
  counter.className = 'char-counter' + (len > max*.9 ? (len >= max ? ' over' : ' warn') : '');
}









// Add Variant
document.getElementById('addNewVariantBtn').addEventListener('click', function(){
  document.getElementById('variantContainer').insertAdjacentHTML('beforeend',`<div class="variantSet mb-3 border-b border-forest-600">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label class="form-label">Variant Name<span class="req">*</span></label>
                      <input type="text" placeholder="e.g. Small" class="variantName form-input" required />
                    </div>
                    <div>
                      <label class="form-label">Variant SKU<span class="req">*</span></label>
                      <input type="text" placeholder="e.g. Apple-Small-01" class="variantSKU form-input"/>
                    </div>
                    <div>
                      <label class="form-label">Barcode<span class="req">*</span></label>
                      <input type="text" placeholder="e.g. 123456789" class="variantBarcode form-input"/>
                    </div>
                  </div>

                  <!-- Stock qty + Low stock threshold -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label class="form-label">Stock Quantity <span class="req">*</span></label>
                      <input type="number" placeholder="e.g. 10" min="1" class="variantStock form-input"/>
                    </div>
                    <div>
                      <label class="form-label">Low Stock Alert<span class="req">*</span></label>
                      <input type="number" placeholder="e.g. 5" min="1" class="variantLowStock form-input"/>
                    </div>
                    <div>
                      <label class="form-label">Stock Policy<span class="req">*</span></label>
                      <select class="variantStockPolicy form-input">
                        <option value="block">Block when out of stock</option>
                        <option value="notify">Notify only</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label class="form-label">Regular Price (₱) <span class="req">*</span></label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 text-sm font-bold pointer-events-none">₱</span>
                        <input type="number" placeholder="0.00" min="0" step="0.01" class="variantRegularPrice form-input" required />
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Sale Price (₱) <span class="hint">optional</span></label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 text-sm font-bold pointer-events-none">₱</span>
                        <input type="number" placeholder="0.00" min="0" step="0.01" class="variantSalePrice form-input" />
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Cost per Item (₱) <span class="hint">internal</span></label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500 text-sm font-bold pointer-events-none">₱</span>
                        <input type="number" placeholder="0.00" min="0" step="0.01" class="variantCostPrice form-input pl-8" />
                      </div>
                    </div>
                  </div>

                  <!-- Unit + Weight -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="form-label">Selling Unit <span class="req">*</span></label>
                      <select class="variantUnit form-input" required >
                        <option value="" disabled selected>Select unit</option>
                        <option>kg</option><option>gram (g)</option><option>500g Pack</option>
                        <option>1kg Pack</option><option>Piece/s</option><option>Bundle</option>
                        <option>Liter (L)</option><option>Box</option><option>Sack</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label">Weight (kg)</label>
                      <input type="number" placeholder="0.50" min="0" step="0.01" class="variantWeight form-input"/>
                    </div>
                    <div>
                      <label class="form-label">Expiration Date</label>
                      <input type="date" class="variantExpirationDate form-input"/>
                    </div>
                  </div>

                  <div class="mt-1 w-full text-sm text-forest-400 flex">
                      <button type="button" class="removeVariantBtn ml-auto inline-flex items-center">
                          <svg class="w-4 h-4 text-terra-500" fill="none" stroke="currentColor" stroke-width="2"
                              viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                          </svg>
                          Remove Variant 
                          <span class="variantNameLabel text-harvest-500 ml-1">_blank</span>
                      </button>
                  </div>
                </div>`);
})

// Remove Variant
document.getElementById('variantContainer').addEventListener('click', function (e) {
  const btn = e.target.closest('.removeVariantBtn');
  if (!btn) return;
  const variantSet = btn.closest('.variantSet');
  if (!variantSet) return;
  variantSet.classList.add('opacity-0', 'scale-95', 'transition');
  setTimeout(() => {
    variantSet.remove();
  }, 150);
});

// Set the name of variant in remove button
document.getElementById('variantContainer').addEventListener('input', function (e) {
  if (!e.target.classList.contains('variantName')) return;
  const variantSet = e.target.closest('.variantSet');
  if (!variantSet) return;
  const label = variantSet.querySelector('.variantNameLabel');
  if (!label) return;
  label.textContent = e.target.value || '_blank';
});


// get all the value of variant and validate the fields
function getVariantsData() {
  const variantSets = document.querySelectorAll('.variantSet');
  const variants = [];
  for (const set of variantSets) {
    const name = set.querySelector('.variantName')?.value.trim();
    const sku = set.querySelector('.variantSKU')?.value.trim();
    const barcode = set.querySelector('.variantBarcode')?.value.trim();
    const stock = set.querySelector('.variantStock')?.value;
    const lowStock = set.querySelector('.variantLowStock')?.value;
    const stockPolicy = set.querySelector('.variantStockPolicy')?.value;
    const regularPrice = set.querySelector('.variantRegularPrice')?.value;
    const unit = set.querySelector('.variantUnit')?.value;

    if (!name || !sku || !barcode || !stock || !lowStock || !stockPolicy || !regularPrice || !unit) {
      return null;
    }
    variants.push({
      variantName:name,
      variantSKU:sku,
      variantBarcode:barcode,
      variantStock: Number(stock),
      variantLowStock: Number(lowStock),
      variantStockPolicy:stockPolicy,
      variantRegularPrice: Number(regularPrice),
      variantSalePrice: Number(set.querySelector('.variantSalePrice')?.value || 0),
      variantCostPrice: Number(set.querySelector('.variantCostPrice')?.value || 0),
      variantUnit:unit,
      variantWeight: Number(set.querySelector('.variantWeight')?.value || 0),
      variantExpirationDate: set.querySelector('.variantExpirationDate')?.value || null,
    });
  }
  return variants;
}

// Conver the image into based64
function base64ToFile(base64, filename) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}





// Publish Products
document.getElementById('publishProductBtn').addEventListener('click', async (e) => {
  try{
    const btn = e.target;
    btn.disabled = true;

    const productName = document.getElementById('productName').value.trim();
    const productCategory = document.getElementById('productCategory').value.trim();
    const productSubCategory = document.getElementById('productSubCategory').value.trim();
    const productSKU = document.getElementById('productSKU').value.trim();
    const productDescription = document.getElementById('productDescription').innerHTML.trim();
    const variants = getVariantsData();
    const imageElements = document.querySelectorAll('#previewContainer img');
    const productStatus = "Published";
    const isFeatured = document.getElementById('toggleFeatured').classList.contains('on');

    if(!productName || !productCategory || !productSubCategory || !productSKU || !productDescription || !variants){
      btn.disabled = false;
      Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            title: "Reqiured",
            text: "All fields with * are required.",
            icon: "warning"
        });
      return;
    }


    if (imageElements.length < 1) {
        btn.disabled = false;
        Swal.fire({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              title: "Reqiured",
              text: "Please upload at least 1 image.",
              icon: "warning"
          });
        return;
    }

    if (imageElements.length > 10) {
        btn.disabled = false;
        Swal.fire({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              title: "Reqiured",
              text: "You can only upload up to 10 images.",
              icon: "warning"
          });
        return;
    }


    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('productCategory', productCategory);
    formData.append('productSubCategory', productSubCategory);
    formData.append('productSKU', productSKU);
    formData.append('productDescription', productDescription);
    formData.append('productStatus', productStatus);
    formData.append('isFeatured', isFeatured);
    formData.append('variants', JSON.stringify(variants));
    const images = Array.from(imageElements).map((img, i) => base64ToFile(img.src, `product_${i}.png`));
    images.forEach(file => {
        formData.append('productImages', file); 
    });


    const response = await fetch('/a/products/new/publish', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    
    if (data.success) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            title: "Success!",
            text: data.message,
            icon: "success"
        }).then(() => {
            window.location = data.redirect;
        });
    } else {
        btn.disabled = false;
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            title: "Warning",
            text: data.message,
            icon: "warning"
        });
    }
  }catch(error){
    btn.disabled = false;
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        title: "Warning",
        text: 'Something went wrong. Please try again.',
        icon: "warning"
    });
  }
});
/*===================================
        Update Avatar
=====================================*/
const uploadBtn = document.getElementById('avatar-upload-btn');
const inputAvatar = document.getElementById('inputAvatar');
const updateAccountButtons = document.getElementById('updateAccountButtons');

uploadBtn.addEventListener('click', () => {
    inputAvatar.click();
});

inputAvatar.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    try {
        const base64Image = await resizeImage(file, 256, 0.7);
        const response = await fetch('/post/account/avatar/change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userAvatar: base64Image
            })
        });
        const result = await response.json();
        if (result.success) {
            document.querySelectorAll('.avatarDisplay').forEach(el => {
                el.innerHTML = `<img src="${base64Image}" class="w-full h-full object-cover rounded-2xl">`;
            });
        }
    } catch (error) {
        console.error(error);
    }
});

function resizeImage(file, size = 256, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = size;
                canvas.height = size;
                ctx.drawImage(img, 0, 0, size, size);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}




/*===================================
        Enable Textfield
        Personal Information
=====================================*/
document.getElementById('editProfileBtn').addEventListener('click', (e) => {
    e.target.disabled = true;
    e.target.innerText = 'Editing...';

    document.querySelectorAll('.acc-input').forEach((el, indx) => {
        el.disabled = false;
        if(indx === 0) el.focus();
    });


    updateAccountButtons.innerHTML = `<button id="saveProfileBtn" class="bg-forest-600 hover:bg-forest-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition flex items-center gap-2">
                                        Save Changes
                                        </button>
                                        <button id="cancelProfileBtn" class="bg-forest-50 hover:bg-forest-100 text-forest-600 text-xs font-semibold px-4 py-2 rounded-lg transition">
                                        Cancel
                                        </button>`;


    document.getElementById('cancelProfileBtn').addEventListener('click', () => {
        document.querySelectorAll('.acc-input').forEach(el => {
            el.disabled = true;
        });
        e.target.disabled = false;
        e.target.innerText = 'Edit Profile';
        updateAccountButtons.innerHTML = '';
    });


    document.getElementById('saveProfileBtn').addEventListener('click', async(s) => {
        const viewFirstname = document.getElementById('viewFirstname').value;
        const viewLastname = document.getElementById('viewLastname').value;
        const viewBirthday = document.getElementById('viewBirthday').value;
        const viewGender = document.getElementById('viewGender').value;
        const viewEmail = document.getElementById('viewEmail').value;
        const viewPhone = document.getElementById('viewPhone').value;
        const viewBio = document.getElementById('viewBio').value;
        

        if(!viewFirstname || !viewLastname || !viewEmail || !viewPhone) return;
        
        s.target.disabled = true;
        e.target.innerText = 'Saving...';

        document.querySelectorAll('.acc-input').forEach(el => {
            el.disabled = true;
        });

        try{
            const response = await fetch('/post/account/information/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    newFirstname: viewFirstname, 
                    newLastname: viewLastname, 
                    newBirthday: viewBirthday, 
                    newGender: viewGender, 
                    newEmail: viewEmail, 
                    newPhone: viewPhone, 
                    newBio: viewBio, 
                })
            });

            const data = await response.json();
            if(data.success){
                window.location = '/account';
            }else{

            }
        }catch (error) {
           
        }
    });
});




/*===================================
        Delivery Address
=====================================*/
const modalDeliveryAddress = document.getElementById('modalDeliveryAddress');
const modalContentDeliveryAddress = document.getElementById('modalContentDeliveryAddress');

document.getElementById('addAddressBtn').addEventListener('click', async() => {

  modalContentDeliveryAddress.innerHTML = `<div class="p-6" >
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg text-forest-900 font-bold">New Address</h3>
        <button id="modalCose" class="w-8 h-8 bg-forest-50 hover:bg-forest-100 rounded-xl flex items-center justify-center text-forest-400 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="space-y-3 mb-5" style="max-height: 70vh;overflow-y: auto;">

        <div>
            <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Label</label>
            <input type="text" id='label' placeholder='e.g. Work or Home.' class="acc-input resize-none"/>
        </div>

        <div class='grid grid-cols-2 gap-8' >
            <div>
                <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Contact Person</label>
                <input type="text" id='contactPerson' placeholder='e.g. Juan Dela Cruz' class="acc-input resize-none"/>
            </div>

            <div>
                <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Note</label>
                <input type="text" id='contactNumber' placeholder='e.g. 09091234567' class="acc-input resize-none"/>
            </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Region</label>
          <select id="region" class='acc-input resize-none' ><option value="" selected disabled >Select Region</option></select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Provice</label>
          <select id="province" class='acc-input resize-none' ><option value="" selected disabled >Select Province</option></select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">City</label>
          <select id="city" class='acc-input resize-none' ><option value="" selected disabled >Select City</option></select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Baranggay</label>
          <select id="barangay" class='acc-input resize-none' ><option value="" selected disabled >Select Baranggay</option></select>
        </div>

        <div>
            <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">House No., Street, Subdivision <span class="req">*</span></label>
            <input type="text" id='street' placeholder='e.g. 1234 Main St.' class="acc-input resize-none"/>
        </div>

        <div>
            <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Landmark <span class="req">*</span></label>
            <input type="text" id='landmark' placeholder='e.g. Near ABC Mall' class="acc-input resize-none"/>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="addAddrBtn" data-addr-id="" class="flex-1 bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
          Save Address
        </button>
        <button id="modal-close-2" class="px-4 bg-forest-50 hover:bg-forest-100 text-forest-600 text-sm font-semibold rounded-xl transition">
          Cancel
        </button>
      </div>
    </div>`;
    
    modalDeliveryAddress.classList.add('open');
    document.body.style.overflow = 'hidden';
    initializePSGC();

    document.getElementById('modalCose').addEventListener('click', function(){
        modalDeliveryAddress.classList.remove('open');
        document.body.style.overflow = '';
    });

    document.getElementById('addAddrBtn').addEventListener('click', async function(e){
        e.target.disabled = true;
        const person = document.getElementById('contactPerson').value;
        const number = document.getElementById('contactNumber').value;
        const region = document.getElementById('region').value;
        const province = document.getElementById('province').value;
        const city = document.getElementById('city').value;
        const barangay = document.getElementById('barangay').value;
        const street = document.getElementById('street').value;
        const landmark = document.getElementById('landmark').value;
        const label = document.getElementById('label').value;

        if(!person || !number || !region || !province || !city || !barangay || !street || !landmark || !label) return;

        try{
            const response = await fetch('/account/deliveryaddress/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    person:person, 
                    number:number, 
                    region:region, 
                    province:province, 
                    city:city, 
                    barangay:barangay, 
                    street:street, 
                    landmark:landmark, 
                    label:label
                })
            });

            const data = await response.json();

            if (data.success) {
                window.location = '/account';
            }
        }catch(error){
            e.target.disabled = false;
        }

    });
});



document.querySelectorAll('.setAsDefaultAddress').forEach(button => {
  button.addEventListener('click', async () => {
    const addressID = button.dataset.id;
    try{
        const response = await fetch('/account/deliveryaddress/setdefault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({  addressID:addressID })
        });
        const data = await response.json();
        if (data.success) {
            window.location = '/account';
        }
    }catch(err){
    }
  });
});



document.querySelectorAll('.deleteAddress').forEach(button => {
  button.addEventListener('click', async () => {

    Swal.fire({
        text: "Delete this address? This action cannot be undone.",
        showCancelButton: true,
        confirmButtonColor: '#c2410c',
        cancelButtonColor: '#255e22',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const addressID = button.dataset.id;
            try{
                const response = await fetch('/post/account/deliveryaddress/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({  addressID:addressID })
                });
                const data = await response.json();
                if (data.success) {
                    window.location = '/account';
                }
            }catch(err){
            }
        }
    });
  });
});


document.getElementById('changePasswordBtn').addEventListener('click', function(){
    modalContentDeliveryAddress.innerHTML = `<div class="p-6">
        <div class="flex items-center justify-between mb-5">
            <h3 class="font-display text-lg text-forest-900 font-bold">Change Password</h3>
            <button id="modalClose" class="w-8 h-8 bg-forest-50 hover:bg-forest-100 rounded-xl flex items-center justify-center text-forest-400 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="space-y-3 mb-5">
            <div>
            <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <input id="pwCurrent" type="password" class="acc-input" placeholder="••••••••"/>
            </div>
            <div>
            <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">New Password</label>
            <input id="pwNew" type="password" class="acc-input" placeholder="Min. 8 characters"/>
            <div id="pw-strength-bar" class="h-1 rounded-full mt-2 bg-forest-100 overflow-hidden">
                <div id="pw-strength-fill" class="h-full rounded-full transition-all duration-300" style="width:0%"></div>
            </div>
            <p id="pw-strength-label" class="text-[10px] text-forest-400 mt-1"></p>
            </div>
            <div>
            <label class="block text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input id="pwConfirm" type="password" class="acc-input" placeholder="••••••••"/>
            </div>
        </div>
        <button id="savePasswordBtn" class="w-full bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
            Update Password
        </button>
    </div>`;
    modalDeliveryAddress.classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('savePasswordBtn').addEventListener('click', async () => {
        const pwCurrent = document.getElementById('pwCurrent').value;
        const pwNew = document.getElementById('pwNew').value;
        const pwConfirm = document.getElementById('pwConfirm').value;

        if(!pwCurrent || !pwNew || !pwConfirm){
            Swal.fire({
                text: "All fields are required",
                showConfirmButton: false,
                cancelButtonColor: '#255e22',
                cancelButtonText: 'Close'
            })
            return;
        } 

        if(pwNew != pwConfirm){
            Swal.fire({
                text: "New password and confirmation password do not match.",
                showConfirmButton: false,
                cancelButtonColor: '#255e22',
                cancelButtonText: 'Close'
            })
            return;
        } 

        try{
            const response = await fetch('/post/account/password/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  pwCurrent:pwCurrent, pwNew:pwNew, pwConfirm:pwConfirm})
            });
            const data = await response.json();
            if (data.success) {
                window.location = '/account';
            }else{
                Swal.fire({
                    text: data.message,
                    showConfirmButton: false,
                    cancelButtonColor: '#255e22',
                    cancelButtonText: 'Close'
                })
                return;
            }
        }catch(err){
        }
    });

    document.getElementById('modalClose').addEventListener('click', function(){
        modalDeliveryAddress.classList.remove('open');
        document.body.style.overflow = '';
    });
})













document.querySelectorAll('.password-time').forEach(el => {
  const date = el.dataset.date;
  el.textContent = timeAgo(date);
});













function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `Last changed ${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Last changed just now';
}
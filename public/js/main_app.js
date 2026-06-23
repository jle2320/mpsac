const productCategories = [
    "Fruits",
    "Vegetables",
    "Grains",
    "Dairy",
    "Livestock"
];


const productStatuses = [
    "Published",
    "Draft"
];



const STATUS = {
    'pending':{
                label:'Pending',    
            },

    'to_ship':{
                label:'To Ship',   
            },

    'to_receive':{
                label:'To Receive'
            },

    'completed':{
                label:'Completed',
            },

    'cancelled':{
                label:'Cancelled',
            },
            
    'refund':{
                label:'Refund/Return',
            },
};


const AVATAR_CLASSES = [
    'avatar-a',
    'avatar-b',
    'avatar-c',
    'avatar-d',
    'avatar-e',
    'avatar-f',
    'avatar-g',
    'avatar-h'
];

const STOCK_MOVEMENT = {
    'sale':{
                label:'Sale',    
            },

    'restock':{
                label:'Restock',   
            },

    'adjustment':{
                label:'Adjustment'
            },

    'returned':{
                label:'Returned',
            },

    'cancelled':{
                label:'Cancelled',
            }
};









// Modal
function openModal(content) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = content;
    const backdrop = document.getElementById('modal');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('closeModal').addEventListener('click', closeModal);
}

function closeModal(){
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
}


// Message Toast
function showToast(msg, type='success'){
    let toastClass = '';    
    if(type === 'success') toastClass = ['bg-forest-800/50', 'border', 'border-forest-600'];
    if(type === 'warning') toastClass = ['bg-harvest-800/50', 'border', 'border-harvest-500'];
    if(type === 'error') toastClass = ['bg-terra-800/50', 'border', 'border-terra-500'];

    const t = document.getElementById('toast');
    t.classList.add(...toastClass);

    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 3000);
}










//Date format
function dateMDY(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' });
}
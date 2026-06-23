



























// Nav Links set automatically active
const navLinks = document.querySelectorAll('.nav-item');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  });
});






// Toggle Side Menu
document.getElementById('sidebarToggleBtn').addEventListener('click', handleSidebarToggle);
document.getElementById('sidebarOverlay').addEventListener('click', toggleMobileSidebar);

function handleSidebarToggle(){
  if(isDesktop()){
    sidebar.classList.toggle('collapsed');
  } else {
    toggleMobileSidebar();
  }
}

function toggleMobileSidebar(){
  const open = sidebar.classList.toggle('mobile-open');
  overlay.classList.toggle('hidden', !open);
  setTimeout(()=>{ overlay.style.opacity = open ? '1' : '0'; }, open ? 0 : 200);
}




// Rich text editor toolbar
document.querySelectorAll('.rich-toolbar button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const command = btn.getAttribute('data-command');
    document.execCommand(command,false,null); 
  });
});



















const d = new Date();
document.getElementById('currentDate').textContent =
  d.toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

// ── Sidebar toggle ──
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('sidebarOverlay');
let isDesktop  = () => window.innerWidth >= 1024;







window.addEventListener('resize', ()=>{
  if(isDesktop()){
    sidebar.classList.remove('mobile-open');
    overlay.classList.add('hidden');
    overlay.style.opacity = '0';
  }
});

// ── Active nav ──
function setActive(el){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  if(!isDesktop()){ toggleMobileSidebar(); }
}

// ── Count-up animation ──
function countUp(el, target, prefix='', duration=1800){
  const start = Date.now();
  const isFloat = target.toString().includes('.');
  const run = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(ease * target);
    el.textContent = prefix + val.toLocaleString();
    if(progress < 1) requestAnimationFrame(run);
    else el.textContent = prefix + target.toLocaleString();
  };
  requestAnimationFrame(run);
}

setTimeout(()=>{
  countUp(document.getElementById('stat-revenue'), 284750, '₱');
  countUp(document.getElementById('stat-orders'),  4821, '');
  countUp(document.getElementById('stat-products'),1248, '');
  countUp(document.getElementById('stat-farmers'), 342,  '');
}, 300);

// ── Progress bars animate ──
setTimeout(()=>{
  document.querySelectorAll('.prog-bar').forEach(bar=>{
    bar.style.width = bar.dataset.width;
  });
}, 500);

// ── Revenue Chart ──
const revenueCtx = document.getElementById('revenueChart').getContext('2d');
const chartData = {
  '7d': {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    data:[18400,21200,16800,24500,19700,28900,22400]
  },
  '1m': {
    labels:['W1','W2','W3','W4'],
    data:[64200,71500,58900,89600]
  },
  '6m': {
    labels:['Dec','Jan','Feb','Mar','Apr','May'],
    data:[195000,212000,178000,245000,268000,284750]
  },
  '1y': {
    labels:['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'],
    data:[142000,158000,172000,165000,189000,201000,195000,212000,178000,245000,268000,284750]
  }
};

const gradient = revenueCtx.createLinearGradient(0, 0, 0, 220);
gradient.addColorStop(0, 'rgba(251,191,36,0.3)');
gradient.addColorStop(1, 'rgba(251,191,36,0.01)');

let revenueChart = new Chart(revenueCtx, {
  type: 'line',
  data: {
    labels: chartData['1m'].labels,
    datasets: [{
      label: 'Revenue (₱)',
      data: chartData['1m'].data,
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
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#5cb356', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: '#5cb356',
          font: { size: 11 },
          callback: v => '₱' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)
        }
      }
    }
  }
});

function setChartPeriod(period, btn){
  document.querySelectorAll('.chart-period').forEach(b=>{
    b.className = 'chart-period text-xs px-3 py-1.5 rounded-lg bg-forest-800/60 text-forest-400 hover:text-harvest-300 transition font-medium';
  });
  btn.className = 'chart-period text-xs px-3 py-1.5 rounded-lg bg-harvest-400/20 text-harvest-400 border border-harvest-400/30 transition font-medium';
  const d = chartData[period];
  revenueChart.data.labels = d.labels;
  revenueChart.data.datasets[0].data = d.data;
  revenueChart.update('active');
}

// ── Category Donut ──
const catCtx = document.getElementById('categoryChart').getContext('2d');
new Chart(catCtx, {
  type: 'doughnut',
  data: {
    labels: ['Vegetables','Fruits','Seeds','Others'],
    datasets: [{
      data: [38, 27, 18, 17],
      backgroundColor: ['#5cb356','#fbbf24','#f97316','#255e22'],
      borderColor: '#0e2410',
      borderWidth: 3,
      hoverOffset: 6,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(24,61,23,0.95)',
        borderColor: 'rgba(251,191,36,0.3)',
        borderWidth: 1,
        titleColor: '#fbbf24',
        bodyColor: '#8fce8a',
        padding: 10,
        callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.raw + '%' }
      }
    }
  }
});

// badges
badgeCountCartProduct();
async function badgeCountCartProduct() {
    try {
        const response = await fetch('/myCart/count/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            const cartBadges = document.querySelectorAll('.cartBadge');
            cartBadges.forEach(badge => {
                if (data.cartBadgeData > 0) {
                    badge.textContent = data.cartBadgeData;
                    badge.classList.remove('hidden');
                }
            });
        }
    } catch (err) {
        console.error("Badge fetch error:", err);
    }
}












document.querySelectorAll(".filter-chip").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-chip")
      .forEach(c => c.classList.remove("active"));

    this.classList.add("active");
  });
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id === "#") return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  });
});















    














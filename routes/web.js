const express = require('express');
const router = express.Router();

const UserHomeController = require('../controllers/UserHomeController');
const PSGCController = require('../controllers/PSGCController');
const UploadFile = require('../middleware/UploadFile');


/* ================================
===================================
            USER
===================================
================================ */


// User Authentication Login Page
router.get('/account/login', UserHomeController.userAccountLoginPage);
router.post('/account/user/verify', UserHomeController.userAccountUserVerify);

// User Authentication Register Page
router.get('/account/register', UserHomeController.userAccountRegisterPage);
router.post('/account/user/save', UserHomeController.userAccountUserSave);

// User Account Page
router.get('/account', UserHomeController.userAccount);
router.get('/acccount/logout', UserHomeController.userAccountLogout);
router.post('/account/deliveryaddress/new', UserHomeController.userAccountDeliveryAddressNew);
router.post('/account/deliveryaddress/setdefault', UserHomeController.userAccountDeliveryAddressSetDefault);

// Index Page
router.get('/', UserHomeController.userIndex);
router.post('/index/list/products', UserHomeController.userIndexListProducts);


// Product Page
router.post('/product/view', UserHomeController.userProductViewPage);
router.post('/product/addtocart', UserHomeController.userProductAddToCart);


// Cart Page
router.get('/myCart', UserHomeController.userCartPage);
router.post('/myCart/list/products', UserHomeController.userMyCartListProducts);
router.post('/myCart/update/products/quantity', UserHomeController.userMyCartUpdateProductsQuantity);
router.post('/myCart/delete/products', UserHomeController.userMyCartDeleteProducts);
router.post('/myCart/count/products', UserHomeController.userCartBadgeData); // Badge Count Product in cart


// Checkout Page
router.get('/checkout', UserHomeController.userCheckoutPage);
router.post('/checkout/placeorder', UserHomeController.userCheckoutPlaceOrder);


// Order Page
router.get('/orders', UserHomeController.userOrder);
router.post('/orders/list/products', UserHomeController.userOrderListProducts);
router.post('/orders/cancel', UserHomeController.userOrderCancel);












/* ================================
===================================
            ADMIN
===================================
================================ */
const AdminMainController = require('../controllers/AdminMainController');


// Dashboard Page
router.post('/a/dashboard/count/revenue/today', AdminMainController.adminDashboardCountRevenueToday);
router.post('/a/dashboard/count/revenue/7days', AdminMainController.adminDashboardCountRevenueFor7Days);
router.post('/a/dashboard/count/revenue/4weeks', AdminMainController.adminDashboardCountRevenueFor4Weeks);
router.post('/a/dashboard/count/revenue/12months', AdminMainController.adminDashboardCountRevenueFor12Months);
router.post('/a/dashboard/count/orders/ongoing', AdminMainController.adminDashboardCountOngoingOrders);
router.post('/a/dashboard/count/total/products', AdminMainController.adminDashboardCountTotalProducts);
router.post('/a/dashboard/count/total/customers', AdminMainController.adminDashboardCountTotalCustomers);
router.post('/a/dashboard/select/limit/10pending/orders', AdminMainController.adminDashboardSelectLimit10PendingOrders);
router.post('/a/dashboard/select/lowstocks', AdminMainController.adminDashboardSelectAllLowStockVariants);
router.post('/a/dashboard/select/limit/10movementstocks', AdminMainController.adminDashboardSelectLimit10MovementStocks);

// Products Page
router.get('/a/products/new', AdminMainController.adminProductNewPage);



// Order Page
router.get('/a/orders', AdminMainController.adminOrdersPage);
router.post('/a/orders/list', AdminMainController.adminOrdersList);
router.post('/a/orders/update/status', AdminMainController.adminOrdersUpdateStatus);


// Customer Page
router.get('/a/customers', AdminMainController.adminCustomerPage);
router.post('/a/customers/list', AdminMainController.adminCustomerList);


// Inventory Page
router.get('/a/inventory', AdminMainController.adminInventoryPage);
router.post('/a/inventory/list', AdminMainController.adminInventoryList);
router.post('/a/inventory/stocks/restock', AdminMainController.adminInventoryStockRestock);
router.post('/a/inventory/stocks/adjust', AdminMainController.adminInventoryStockAdjust);









router.post('/post/account/avatar/change', UserHomeController.userPostUpdateUserAvatar);
router.post('/post/account/information/update', UserHomeController.userPostUpdateUserInformation);




router.post('/post/account/deliveryaddress/delete', UserHomeController.userPostDeleteDeliveryAddress);
router.post('/post/account/password/change', UserHomeController.userPostChangePassword);







//Badges




router.get('/a/login', AdminMainController.adminLoginPage);
router.get('/a/dashboard', AdminMainController.adminDashboardPage);








router.get('/a/logout', AdminMainController.adminLogout);


router.post('/a/postLogin', AdminMainController.adminPostLogin);













// Admin Products routes
router.get('/a/products', AdminMainController.adminProductPage);
router.post('/a/products/new/publish', UploadFile.array('productImages', 10), AdminMainController.adminPostPublishProduct);
router.post('/a/products/list', AdminMainController.adminPostSelectAllProducts);






// PSGC
router.get('/psgc/regions', PSGCController.regions);
router.get('/psgc/provinces/:region', PSGCController.provinces);
router.get('/psgc/cities/:province', PSGCController.cities);
router.get('/psgc/barangays/:city', PSGCController.barangays);



router.use((req, res) => {
    res.status(404).render('partials/404');
});




module.exports = router;
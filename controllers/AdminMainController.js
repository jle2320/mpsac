const Admin = require('../models/AdminModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');




// Dashboard Page

//Count Revenue
exports.adminDashboardCountRevenueToday= async (req, res) => {
  try {
    const result = await Admin.coutTodayTotalRevenue();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate today’s revenue." });
    }
    res.status(200).json({ success: true, todayStat: result.today_revenue , yesterdayStat: result.yesterday_revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


//Count Revenue for 7Days
exports.adminDashboardCountRevenueFor7Days = async (req, res) => {
  try {
    const result = await Admin.coutRevenueFor7Days();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate 7 days revenue." });
    }
    res.status(200).json({ success: true, revenue7Days: result});
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


//Count Revenue for 4weeks
exports.adminDashboardCountRevenueFor4Weeks = async (req, res) => {
  try {
    const result = await Admin.countRevenueFor4Weeks();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate 4 weeks revenue." });
    }
    res.status(200).json({ success: true, revenue4Weeks: result});
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


//Count Revenue for 12months
exports.adminDashboardCountRevenueFor12Months = async (req, res) => {
  try {
    const result = await Admin.countRevenueFor12Months();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate 12 months revenue." });
    }
    res.status(200).json({ success: true, revenue12Months: result});
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};

//Count Ongoing Orders
exports.adminDashboardCountOngoingOrders= async (req, res) => {
  try {
    const result = await Admin.coutOngoingOrders();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate total ongoing orders." });
    }
    res.status(200).json({ success: true, ongoingOrders: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};

//Count Total Products
exports.adminDashboardCountTotalProducts= async (req, res) => {
  try { 
    const result = await Admin.coutTotalProducts();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate total products." });
    }

    const grouped = {};
    result.forEach(row => {
      const productID = row.productID;
      const variantID = row.variantID;
      const stockQuantity = row.stockQuantity;
      const stockLowAlert = row.stockLowAlert;
      if (!grouped[productID]) {
        grouped[productID] = {
          productID: productID,
          variantStocks: []
        };
      }


      if (variantID) {
        const vExists = grouped[productID].variantStocks.some(
          v => v.variantID === variantID
        );

        if (!vExists) {
          grouped[productID].variantStocks.push({
            variantID: variantID,
            stockQuantity: stockQuantity,
            stockLowAlert:stockLowAlert
          });
        }
      }
    });

    const recompliedProducts = Object.values(grouped);
    res.status(200).json({ success: true, products: recompliedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


//Count Total Customers
exports.adminDashboardCountTotalCustomers= async (req, res) => {
  try {
    const result = await Admin.coutTotalCustomers();
    if (!result) {
      return res.status(401).json({ message: "Failed to calculate total ongoing orders." });
    }
    res.status(200).json({ success: true, customers: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


//Select 10 pending orders
exports.adminDashboardSelectLimit10PendingOrders= async (req, res) => {
  try {
    const result = await Admin.selectLimit10PendingOrders();
    if (!result) {
      return res.status(401).json({ message: "Failed to select 10 pending orders." });
    }

    const grouped = {};
    result.forEach(row => {
      const orderNumber = row.orderNumber;
      const customerName = row.customerName;
      const totalAmountOrder = row.totalAmountOrder;
      const orderDate = row.orderDate;
      const itemID = row.itemID;
      const productName = row.productName;
      
      if (!grouped[orderNumber]) {
        grouped[orderNumber] = {
          orderNumber: orderNumber,
          customerName: customerName,
          totalAmountOrder: totalAmountOrder,
          orderDate: orderDate,
          items: []
        };
      }


      if (itemID) {
        const vExists = grouped[orderNumber].items.some(
          v => v.itemID === itemID
        );

        if (!vExists) {
          grouped[orderNumber].items.push({
            itemID: itemID,
            productName:productName
          });
        }
      }
    });
    
    const recompliedProducts = Object.values(grouped);
    res.status(200).json({ success: true, orders: recompliedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


 // Get all the low stocks varaints
exports.adminDashboardSelectAllLowStockVariants= async (req, res) => {
  try {
    const result = await Admin.selectAllLowStockVariants();
    if (!result) {
      return res.status(401).json({ message: "Failed to select all the low stock alert." });
    }
    res.status(200).json({ success: true, lowStocks: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};


 // Get  movement stocks limit 10
exports.adminDashboardSelectLimit10MovementStocks= async (req, res) => {
  try {
    const result = await Admin.selectLimit10MovementStocks();
    if (!result) {
      return res.status(401).json({ message: "Failed to select 10 movement stocks." });
    }
    res.status(200).json({ success: true, movementStock: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error"});
  }
};










// Order Page

exports.adminOrdersPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (!activeUser) {
    return res.redirect('/a/login');
  }

  res.render('admin_order', {
    pageTitle: 'Admin Page - Orders',
    linkActive: 'order'
  });
};


exports.adminOrdersList = async (req, res) => {
  try {
    const products = await Admin.selectOrders();
    if (!products) {
      return res.status(404).json({ message: 'No products orders' });
    }

    const grouped = {};

    products.forEach(row => {
      const customerName = row.customerName;
      const customerPhone = row.customerPhone;
      const customerEmail = row.customerEmail;
      const orderNumber = row.orderNumber;
      const orderStatus = row.orderStatus;
      const orderPayment = row.orderPayment;
      const orderSubTotal = row.orderSubTotal;
      const orderDiscount = row.orderDiscount;
      const orderShippingFee = row.orderShippingFee;
      const orderTotal = row.orderTotal;
      const orderDate = row.orderDate;
      const orderContactPerson = row.orderContactPerson;
      const orderContactNumber = row.orderContactNumber;
      const orderContactStreet = row.orderContactStreet;
      const orderContactBarangay = row.orderContactBarangay;
      const orderContactCity = row.orderContactCity;
      const orderContactProvince = row.orderContactProvince;
      const orderContactLandmark = row.orderContactLandmark;
      const itemID = row.itemID;
      const productName = row.productName;
      const variantName = row.variantName;
      const itemRegularPrice = row.itemRegularPrice;
      const itemSalePrice = row.itemSalePrice;
      const itemQuantity = row.itemQuantity;
      const itemTotal = row.itemTotal;
      const imageID = row.imageID;
      const imagePath = row.imagePath;

      if (!grouped[orderNumber]) {
        grouped[orderNumber] = {
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          orderNumber: orderNumber,
          orderStatus: orderStatus,
          orderPayment: orderPayment,
          orderSubTotal: orderSubTotal,
          orderDiscount: orderDiscount,
          orderShippingFee: orderShippingFee,
          orderTotal: orderTotal,
          orderDate:orderDate,
          orderContactPerson:orderContactPerson,
          orderContactNumber:orderContactNumber,
          orderContactStreet:orderContactStreet,
          orderContactBarangay:orderContactBarangay,
          orderContactCity:orderContactCity,
          orderContactProvince:orderContactProvince,
          orderContactLandmark:orderContactLandmark,
          items: []
        };
      }


      if (itemID) {
        const orderExists = grouped[orderNumber].items.some(
          img => img.itemID === itemID
        );

        if (!orderExists) {
          grouped[orderNumber].items.push({
            itemID: itemID,
            productName: productName,
            variantName:variantName,
            itemRegularPrice: itemRegularPrice,
            itemSalePrice: itemSalePrice,
            itemQuantity: itemQuantity,
            itemTotal: itemTotal,
            images: []
          });
        }
      }


      if (imageID) {

        const item = grouped[orderNumber].items.find(
          item => item.itemID === itemID
        );

        if (item) {

          const imageExists = item.images.some(img => img.imageID === imageID);

          if (!imageExists) {
            item.images.push({
              imageID: imageID,
              imagePath: imagePath,
            });
          }
        }
      }
    });

  const recompliedProducts = Object.values(grouped);
  res.status(200).json({ success: true, rows: recompliedProducts });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.adminOrdersUpdateStatus= async (req, res) => {
  const { orderNumber, orderStatus } = req.body;
  try {
    const result = await Admin.updateOrderStatus({ orderStatus:orderStatus, orderNumber:orderNumber});
    if (!result) {
      return res.status(401).json({ message: 'Failed to update to status' });
    }
    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};



/**************************************
//////////////////////////////////////
        CUSTOMER PAGE
//////////////////////////////////////
**************************************/
exports.adminCustomerPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (!activeUser) {
    return res.redirect('/a/login');
  }

  res.render('admin_customers', {
    pageTitle: 'Admin Page - Customers',
    linkActive: 'customer'
  });
};

exports.adminCustomerList= async (req, res) => {
  try {
    const result = await Admin.selectCustomersData();
    if (!result) {
      return res.status(401).json({ message: 'No Customer data' });
    }
    
    res.json({ success: true, customers: result});
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**************************************
//////////////////////////////////////
        INVENTORY PAGE
//////////////////////////////////////
**************************************/
exports.adminInventoryPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (!activeUser) {
    return res.redirect('/a/login');
  }

  res.render('admin_inventory', {
    pageTitle: 'Admin Page - Inventory',
    linkActive: 'inventory'
  });
};

exports.adminInventoryList= async (req, res) => {
  try {
    const result = await Admin.selectInventoryData();
    if (!result) {
      return res.status(401).json({ message: 'No Inventory data' });
    }
    
    const grouped = {};

    result.forEach(row => {
      const productID = row.productID;
      const productSKU = row.productSKU;
      const productName = row.productName;
      const productCategory = row.productCategory;
      const variantID = row.variantID;
      const variantName = row.variantName;
      const variantSKU = row.variantSKU;
      const variantBarcode = row.variantBarcode;
      const variantStockPlcy = row.variantStockPlcy;
      const variantStock = row.variantStock;
      const variantUnit = row.variantUnit;
      const variantRegularPrice = row.variantRegularPrice;
      const variantSalePrice = row.variantSalePrice;
      const variantCostPrice = row.variantCostPrice;
      const lowStockAlert = row.lowStockAlert;
      const movementID = row.movementID;
      const movementType = row.movementType;
      const movementQuantity = row.movementQuantity;
      const movementDate = row.movementDate;

      if (!grouped[variantID]) {
        grouped[variantID] = {
          productID: productID,
          productSKU: productSKU,
          productName: productName,
          productCategory: productCategory,
          variantID: variantID,
          variantName: variantName,
          variantSKU: variantSKU,
          variantBarcode: variantBarcode,
          variantStockPlcy: variantStockPlcy,
          variantStock: variantStock,
          variantUnit: variantUnit,
          variantRegularPrice: variantRegularPrice,
          variantSalePrice: variantSalePrice,
          variantCostPrice: variantCostPrice,
          lowStockAlert: lowStockAlert,
          movements: []
        };
      }


      if (movementID) {
        const mExists = grouped[variantID].movements.some(
          m => m.movementID === movementID
        );

        if (!mExists) {
          grouped[variantID].movements.push({
            movementID: movementID,
            movementType: movementType,
            movementQuantity: movementQuantity,
            movementDate: movementDate
          });
        }
      }



    });
    const recompliedProducts = Object.values(grouped);
    res.json({ success: true, inventory: recompliedProducts});
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.adminInventoryStockRestock= async (req, res) => {
  const { productId, variantID, restockQty } = req.body;
  try {
    const result = await Admin.restockVariant({productId:productId,variantID:variantID,restockQty:restockQty});
    if (!result) {
      return res.status(401).json({ success: false});
    }
    res.json({ success: true});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.adminInventoryStockAdjust= async (req, res) => {
  const { productId, variantID, adjustkQty } = req.body;
  try {
    const result = await Admin.adjustStockVariant({productId:productId,variantID:variantID,adjustkQty:adjustkQty});
    if (!result) {
      return res.status(401).json({ success: false});
    }
    res.json({ success: true});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};















exports.adminLoginPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (activeUser) {
    return res.redirect('/a/dashboard');
  }

  res.render('admin_login', {
    pageTitle: 'Admin Page - Login'
  });
};



exports.adminDashboardPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (!activeUser) {
    return res.redirect('/a/login');
  }

  res.render('admin_dashboard', {
    pageTitle: 'Admin Page - Dashboard',
    linkActive: 'dashboard'
  });
};



exports.adminProductPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (!activeUser) {
    return res.redirect('/a/login');
  }

  res.render('admin_product', {
    pageTitle: 'Admin Page - Products',
    linkActive: 'products'
  });
};













// Add product page
exports.adminProductNewPage = (req, res) => {
  const activeUser = req.session.sessionAdminID && req.session.sessionAdminFULLNAME && req.session.sessionAdminROLE;
  if (!activeUser) {
    return res.redirect('/a/login');
  }

  res.render('admin_product_new', {
    pageTitle: 'Admin Page - Add Product',
    linkActive: 'add-product'
  });
};









// Admin Logout handler
exports.adminLogout = (req, res) => {
  // Destroy session
  req.session.destroy(err => {
    if (err) {
      console.error("DEBUG ERROR:", err);
      return res.status(500).json({ message: 'Server error' });
    }
    return res.redirect('/a/login');
  });
};















// Login handler
exports.adminPostLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findByUsername(username);
    // const hash = await bcrypt.hash("admin", 10);
    // console.log(hash);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.admin_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Initialize session here
    req.session.sessionAdminID = admin.admin_id;
    req.session.sessionAdminFULLNAME = admin.admin_fullname;
    req.session.sessionAdminROLE= admin.admin_role;
    res.json({ success: true, redirect: '/a/dashboard' });

  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Save Publish Product handler
exports.adminPostPublishProduct = async (req, res) => {
  const { 
    productName,
    productCategory,
    productSubCategory,
    productSKU,
    productDescription,
    productStatus,
    isFeatured,
    variants
  } = req.body;

  try {
    const folder = req.uploadTime;
    const uploadDir = path.join(__dirname,'../public/uploads',String(folder));

    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: false,
        message: "Upload folder does not exist"
      });
    }

    const productImages = (req.files || []).map(file => ({
      filename: file.filename,
      path: `/uploads/${folder}/${file.filename}`
    }));

    const result = await Admin.savePublishProduct({
      productName:productName,
      productCategory:productCategory,
      productSubCategory:productSubCategory,
      productSKU:productSKU,
      productDescription:productDescription,
      productStatus:productStatus,
      isFeatured:isFeatured,
      variants:JSON.parse(variants),
      productImages:productImages
    });

    if(result.success){
      res.json({
        success: true,
        message: "Product added",
        redirect: '/a/products'
      });
    }else{
      res.json({
        success: false,
        message: "failed to add product"
      });
    }
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.json({
      success: false,
      message: "Server Error"
    });
  }
};


// Select Products
exports.adminPostSelectAllProducts = async (req, res) => {
  try {
    const products = await Admin.selectAllProducts();
    if(!products) {
      return res.json({
        success: false,
        message: "No products"
      });
    }

    const grouped = {};

    products.forEach(row => {
      const productID = row.productID;
      const productSKU = row.productSKU;
      const productName = row.productName;
      const productCategory = row.productCategory;
      const productSubCategory = row.productSubCategory;
      const productDescription = row.productDescription;
      const productStatus = row.productStatus;
      const productFeatured = row.productFeatured;
      const productCreated = row.productCreated;
      const productUpdated = row.productUpdated;
      const variantID = row.variantID;
      const variantName = row.variantName;
      const variantSKU = row.variantSKU;
      const variantBarcode = row.variantBarcode;
      const variantStocks = row.variantStocks;
      const variantStockPolicy = row.variantStockPolicy;
      const variantRegularPrice = row.variantRegularPrice;
      const variantSalePrice = row.variantSalePrice;
      const variantCostPrice = row.variantCostPrice;
      const variantUnit = row.variantUnit;
      const variantWeight = row.variantWeight;
      const variantExpirationDate = row.variantExpirationDate;
      const movementID = row.movementID;
      const movementType = row.movementType;
      const movementQuantity = row.movementQuantity;
      const movementRemarks = row.movementRemarks;
      const movementDate = row.movementDate;
      const imageID = row.imageID;
      const imageName = row.imageName;
      const imagePath = row.imagePath;


      // Group Products
      if (!grouped[productID]) {
        grouped[productID] = {
          productID: productID,
          productSKU: productSKU,
          productName: productName,
          productCategory: productCategory,
          productSubCategory: productSubCategory,
          productDescription: productDescription,
          productStatus: productStatus,
          productFeatured: productFeatured,
          productCreated: productCreated,
          productUpdated: productUpdated,
          productVariants: [],
          productImages: []
        };
      }


      // Push Variants
      if (variantID) {
        const variants = grouped[productID].productVariants.some(
          vrnt => vrnt.variantID === variantID
        );

        if (!variants) {
          grouped[productID].productVariants.push({
            variantID: variantID,
            variantName: variantName,
            variantSKU: variantSKU,
            variantBarcode: variantBarcode,
            variantStocks: variantStocks,
            variantStockPolicy: variantStockPolicy,
            variantRegularPrice: variantRegularPrice,
            variantSalePrice: variantSalePrice,
            variantCostPrice: variantCostPrice,
            variantUnit: variantUnit,
            variantWeight: variantWeight,
            variantExpirationDate: variantExpirationDate,
            stocksMovement: []
          });
        }
      }


      // Push Stock movement
      if (movementID && variantID) {
        // find the correct variant
        const currentVariant = grouped[productID].productVariants.find(
          vrnt => vrnt.variantID === variantID
        );

        // safety check
        if (currentVariant) {
          // check if movement already exists
          const movementExist = currentVariant.stocksMovement.some(
            mvmt => mvmt.movementID === movementID
          );
          // push if not existing
          if (!movementExist) {
            currentVariant.stocksMovement.push({
              movementID: movementID,
              movementType: movementType,
              movementQuantity: movementQuantity,
              movementRemarks: movementRemarks,
              movementDate:movementDate
            });
          }
        }
      }

      // Push Images
      if (imageID) {
        const imageExist = grouped[productID].productImages.some(
          img => img.imageID === imageID
        );

        if (!imageExist) {
          grouped[productID].productImages.push({
            imageID: imageID,
            imageName: imageName,
            imagePath: imagePath
          });
        }
      }
    });

    const recompliedProducts = Object.values(grouped);
    console.log(recompliedProducts);
    res.json({
      success: true,
      products: recompliedProducts
    });

  } catch (error) {
    console.error("DEBUG ERROR:", error);
    return res.json({
      success: false,
      message: "Server Error"
    });
  }
};























































// Select Products
















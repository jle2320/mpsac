const User = require('../models/UserModel');
const bcrypt = require('bcrypt');



function recompileUser(user){
  if (!Array.isArray(user) || user.length === 0) return null;
  const grouped = {};
    user.forEach(row => {
      const id = row.userID; 
      if (!grouped[id]) {
        grouped[id] = {
          userID: row.userID,
          userPhone: row.userPhone,
          userEmail: row.userEmail,
          userPassword: row.userPassword,
          userFname: row.userFname,
          userLname: row.userLname,
          userBday: row.userBday,
          userGender: row.userGender,
          userBio: row.userBio,
          userAvatar: row.userAvatar,
          userPhoneVerified: row.userPhoneVerified,
          userEmailVerified: row.userEmailVerified,
          userPasswordLastDateUpdated: row.userPasswordLastDateUpdated,
          userAccountDateCreated: row.userAccountDateCreated,
          userAccountLastDateUpdated: row.userAccountLastDateUpdated,
          deliveryAddress: []
        };
      }

      if (row.addressID) {
        const addressExists = grouped[id].deliveryAddress.some(
          addr => addr.imageID === row.addressID
        );

        if (!addressExists) {
          grouped[id].deliveryAddress.push({
            addressID: row.addressID,
            contactPerson: row.contactPerson,
            contactNumber: row.contactNumber,
            addressRegion: row.addressRegion,
            addressProvince: row.addressProvince,
            addressCity: row.addressCity,
            addressBarangay: row.addressBarangay,
            addressStreet: row.addressStreet,
            addressLandmark: row.addressLandmark,
            addressLabel: row.addressLabel,
            addressDefault: row.addressDefault
          });
        }
      }

    });
    const recompliedUsers = Object.values(grouped);
    return recompliedUsers[0];
}












// Authentication Login
exports.userAccountLoginPage = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  res.render('user_account_login', {
    tabTitle: 'Login Account',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userAccountUserVerify = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await User.findByPhone(phoneNumber);
    const users = recompileUser(user);
    if (!user || user.length === 0) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, users.userPassword);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    req.session.sessionUserDATA = users;
    return res.json({ success: true, message:"Login successfully"});
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};

// Authentication Register
exports.userAccountRegisterPage = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  res.render('user_account_register', {
    tabTitle: 'Register Account',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userAccountUserSave = async (req, res) => {
  const { 
    firstName, 
    lastName,
    birthDate,
    gender,
    email,
    phoneNumber,
    password 
  } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.registerAccount({
      fname:firstName,
      lname:lastName,
      bday:birthDate,
      gender:gender,
      email:email,
      phoneNumber:phoneNumber,
      password:hash
    });
    if (!user) {
      return res.status(401).json({ message: 'Failed to create account' });
    }
    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};















// User Account Page
exports.userAccount = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  if (!activeUser) {
    return res.redirect('/');
  }

  res.render('user_account', {
    title: 'My Account',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userAccountLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    return res.redirect('/');
  });
};

exports.userAccountDeliveryAddressNew = async (req, res) => {
  const { person,number,region,province,city,barangay,street,landmark,label } = req.body;
  try {
    const result = await User.addNewDeliveryAddress({ 
      userID:req.session.sessionUserDATA.userID,
      person:person,
      number:number,
      region:region,
      province:province,
      city:city,
      barangay:barangay,
      street:street,
      landmark:landmark,
      label:label
    });
    if (!result) {
      return res.json({ success: false, message: 'Failed to add delivery address' });
    }

    const userID = req.session.sessionUserDATA.userID;
    const user = await User.findByPhone(userID);
    const users = recompileUser(user);
    req.session.sessionUserDATA = users;

    res.json({ success: true, redirect: '/' });
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};

exports.userAccountDeliveryAddressSetDefault = async (req, res) => {
  const { addressID } = req.body;
  try {
    const result = await User.setDefaultAddress({ addressID:addressID, userID: req.session.sessionUserDATA.userID});
    if (!result) {
      return res.json({ success: false, message: 'Failed to set as default' });
    }
    const userID = req.session.sessionUserDATA.userID;
    const user = await User.findByPhone(userID);
    const users = recompileUser(user);
    req.session.sessionUserDATA = users;
    res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};

















// Landing Page
exports.userIndex = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  res.render('user_index', {
    title: 'Home Page',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userIndexListProducts = async (req, res) => {
  try {
    const products = await User.selectAllProducts();
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
      const productFeatured = row.productFeatured;
      const productCreated = row.productCreated;
      const variantID = row.variantID;
      const variantName = row.variantName;
      const variantSKU = row.variantSKU;
      const variantBarcode = row.variantBarcode;
      const variantStocks = row.variantStocks;
      const variantStockPolicy = row.variantStockPolicy;
      const variantRegularPrice = row.variantRegularPrice;
      const variantSalePrice = row.variantSalePrice;
      const variantUnit = row.variantUnit;
      const variantWeight = row.variantWeight;
      const variantExpirationDate = row.variantExpirationDate;
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
          productFeatured: productFeatured,
          productCreated:productCreated,
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
            variantUnit: variantUnit,
            variantWeight: variantWeight,
            variantExpirationDate: variantExpirationDate
          });
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

// Product View Page
exports.userProductViewPage = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  if(!activeUser) {
    return res.redirect('/');
  }

  const data = JSON.parse(req.body.data);
  res.render('user_product_view', {
    title: 'Home Page',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA,
    productData: data
  });
};

exports.userProductAddToCart = async (req, res) => {
  const { productID, variantID, variantQuantity } = req.body;
  try {
    const result = await User.addToCart({ userID: req.session.sessionUserDATA.userID, productID:productID, variantID:variantID, variantQuantity:variantQuantity });
    if (!result) {
      return res.json({ success: false, message: 'Failed to add to cart' });
    }
    return res.json({ success: true, message: 'Product added to cart' });
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};


// Cart Page
exports.userCartPage = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  if (!activeUser) {
    return res.redirect('/');
  }

  res.render('user_cart', {
    title: 'Your Cart',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userMyCartListProducts = async (req, res) => {
  try {
    const products = await User.selectProductsInCart({ userID: req.session.sessionUserDATA.userID });

    if (!products) {
      return res.json({ success: false, message: 'No products found' });
    }

    const grouped = {};
    products.forEach(row => {
      const productID = row.productID; 
      const productName = row.productName; 
      const variantID = row.variantID; 
      const variantName = row.variantName; 
      const variantStock = row.variantStock; 
      const variantRegularPrice = row.variantRegularPrice; 
      const variantSalePrice = row.variantSalePrice; 
      const variantCostPrice = row.variantCostPrice; 
      const variantUnit = row.variantUnit; 
      const cartID = row.cartID;
      const quantity = row.quantity; 
      const imageID = row.imageID; 
      const imagePath = row.imagePath; 

      if (!grouped[variantID]) {
        grouped[variantID] = {
          productID: productID,
          productName: productName,
          variantID: variantID,
          variantName: variantName,
          variantStock: variantStock,
          variantRegularPrice: variantRegularPrice,
          variantSalePrice: variantSalePrice,
          variantCostPrice: variantCostPrice,
          variantUnit: variantUnit,
          cartID:cartID,
          quantity:quantity,
          images: []
        };
      }


      if (imageID) {
        const imageExists = grouped[variantID].images.some(
          img => img.imageID === imageID
        );
        if (!imageExists) {
          grouped[variantID].images.push({
            imagePath: imagePath
          });
        }
      }

    });

    const recompliedProducts = Object.values(grouped);
    res.json({ success: true, data: recompliedProducts || [] });
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};

exports.userMyCartUpdateProductsQuantity = async (req, res) => {
  const { quantity, operator, cartId } = req.body;
  
  try {
    if (!['+', '-'].includes(operator)) {
      return res.json({ success: false, message: 'Invalid operator. Must be "+" or "-".' });
    }
    const result = await User.updateQuantity({ quantity: quantity, cartId: cartId, operator: operator });
    if (!result) {
      return res.json({ success: false, message: 'Failed to update quantity' });
    }
    res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};

exports.userMyCartDeleteProducts = async (req, res) => {
  const { cartId } = req.body;
  
  try {
    const result = await User.deleteProductInCart({cartId: cartId});
    if (!result) {
      return res.json({ success: false, message: 'Failed to delete product' });
    }
    res.json({ success: true});
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};

exports.userCartBadgeData = async (req, res) => {
  try {
    const cartBadge = await User.selectCartBadgeData({ userID: req.session.sessionUserDATA.userID });
    if (!cartBadge) {
      return res.json({ success: false, message: 'Failed to retrieve cart badge data' });
    }
    return res.json({ success: true, cartBadgeData: cartBadge[0].totalItems });
  } catch (error) {
    return res.json({ success: false, message: 'Server Error' });
  }
};


// Checkout Page
exports.userCheckoutPage = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  if (!activeUser) {
    return res.redirect('/');
  }

  res.render('user_checkout', {
    title: 'Checkout',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userCheckoutPlaceOrder = async (req, res) => {
  const { deliveryAddressPerson, deliveryAddressNumber, deliveryAddressStreet, deliveryAddressBarangay, deliveryAddressCity, deliveryAddressProvince, deliveryAddressLandmark, paymentMethod } = req.body;
  try {
    const placeOrder = await User.placeOrder({ 
      userID: req.session.sessionUserDATA.userID,
      discountTotal: 0,
      shippingFee:0,
      orderNumber: `ORD-${Date.now()}-${req.session.sessionUserDATA.userID}${Math.floor(Math.random() * 1000)}`,
      orderStatus: 'pending',
      paymentMethod: paymentMethod,
      deliveryAddressPerson: deliveryAddressPerson,
      deliveryAddressNumber: deliveryAddressNumber,
      deliveryAddressStreet: deliveryAddressStreet,
      deliveryAddressBarangay: deliveryAddressBarangay,
      deliveryAddressCity: deliveryAddressCity,
      deliveryAddressProvince: deliveryAddressProvince,
      deliveryAddressLandmark: deliveryAddressLandmark,
      createdBy: req.session.sessionUserDATA.userFname + ' ' + req.session.sessionUserDATA.userLname
     });

    if (!placeOrder) {
      return res.status(401).json({ message: 'Failed to place order' });
    }

    const orderID = placeOrder.orderID;
    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Order Page
exports.userOrder = (req, res) => {
  const activeUser = req.session.sessionUserDATA;
  if (!activeUser) {
    return res.redirect('/');
  }

  res.render('user_order', {
    title: 'Orders',
    activeUser: activeUser,
    userData:req.session.sessionUserDATA
  });
};

exports.userOrderListProducts = async (req, res) => {
  try {
    const orders = await User.selectOrders({
      userID: req.session.sessionUserDATA.userID
    });

    if (!orders) {
      return res.status(404).json({ message: 'No orders found' });
    }

    const grouped = {};

    orders.forEach(row => {
      const orderNumber = row.orderNumber;

      // Create order group
      if (!grouped[orderNumber]) {
        grouped[orderNumber] = {
          orderNumber: row.orderNumber,
          orderStatus: row.orderStatus,
          discountTotal: row.discountTotal,
          shippingFee: row.shippingFee,
          orderTotal: row.orderTotal,
          paymentMethod: row.paymentMethod,
          paymentStatus: row.paymentStatus,
          orderItems: []
        };
      }

      // Create order item
      if (row.productID) {

        let existingItem = grouped[orderNumber].orderItems.find(
          item => item.itemID === row.itemID
        );

        if (!existingItem) {
          existingItem = {
            itemID: row.itemID,
            productName: row.productName,
            productCategory: row.productCategory,
            productUnit: row.productUnit,
            regularPrice: row.regularPrice,
            salePrice: row.salePrice,
            productQuantity: row.productQuantity,
            productTotal: row.productTotal,
            images: []
          };

          grouped[orderNumber].orderItems.push(existingItem);
        }

        // Add images to correct item
        if (row.imageID) {

          const imgExists = existingItem.images.some(
            img => img.imageID === row.imageID
          );

          if (!imgExists) {
            existingItem.images.push({
              imageID: row.imageID,
              imagePath: row.imagePath
            });
          }
        }
      }
    });

    const recompliedProducts = Object.values(grouped);

    res.json({
      success: true,
      data: recompliedProducts
    });

  } catch (error) {
    console.error("DEBUG ERROR:", error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};


exports.userOrderCancel = async (req, res) => {
  const { orderNumber, orderStatus } = req.body;
  try {
    const result = await User.updateOrderStatus({ 
      userID: req.session.sessionUserDATA.userID,
      orderStatus:orderStatus, 
      orderNumber:orderNumber,
      createdBy: req.session.sessionUserDATA.userFname + ' ' + req.session.sessionUserDATA.userLname
    });
    if (!result) {
      return res.status(401).json({ message: 'Failed to update to status' });
    }
    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};














































//Logout handler


































// Select Products




























// Select Products
























































// Select orders





















exports.userPostUpdateUserAvatar = async (req, res) => {
  const { userAvatar } = req.body;
  try {
    const result = await User.changeAvatar({ userAvatar:userAvatar, userID: req.session.sessionUserID});
    if (!result) {
      return res.status(401).json({ message: 'Failed to change avatar' });
    }

    const userID = req.session.sessionUserDATA.userID;
    const user = await User.findByPhone(userID);
    const users = recompileUser(user);
    req.session.sessionUserDATA = users;

    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};





exports.userPostUpdateUserInformation = async (req, res) => {
  const { newFirstname,newLastname,newBirthday,newGender,newEmail,newPhone,newBio } = req.body;
  try {
    const result = await User.updateUserInformation({ 
      newPhone:newPhone,
      newEmail:newEmail,
      newFirstname:newFirstname,
      newLastname:newLastname,
      newBirthday:newBirthday,
      newGender:newGender,
      newBio:newBio,
      phoneStatus: req.session.sessionUserDATA.userPhone == newPhone ? req.session.sessionUserDATA.userPhoneVerified : 'false',
      emailStatus:req.session.sessionUserDATA.userEmail == newEmail ? req.session.sessionUserDATA.userEmailVerified : 'false',
      userID:req.session.sessionUserDATA.userID
    });
    if (!result) {
      return res.status(401).json({ message: 'Failed to update personal information' });
    }

    const userID = req.session.sessionUserDATA.userID;
    const user = await User.findByPhone(userID);
    const users = recompileUser(user);
    req.session.sessionUserDATA = users;

    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};




















exports.userPostDeleteDeliveryAddress = async (req, res) => {
  const { addressID } = req.body;
  try {
    const result = await User.deleteDeliveryAddress({ addressID:addressID, userID: req.session.sessionUserID});
    if (!result) {
      return res.status(401).json({ message: 'Failed to delete address' });
    }

    const userID = req.session.sessionUserDATA.userID;
    const user = await User.findByPhone(userID);
    const users = recompileUser(user);
    req.session.sessionUserDATA = users;

    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};





exports.userPostChangePassword = async (req, res) => {
  const { pwCurrent,pwNew,pwConfirm } = req.body;
  try {

    if (pwNew != pwConfirm) {
      return res.status(401).json({ message: 'New password and confirmation password do not match.' });
    }

    const isMatch = await bcrypt.compare(pwCurrent, req.session.sessionUserDATA.userPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password does not match.' });
    }

    const hash = await bcrypt.hash(pwNew, 10);
    const result = await User.changePassword({ pwNew:hash, userID: req.session.sessionUserID});
    if (!result) {
      return res.status(401).json({ message: 'Failed to change passsword' });
    }

    const userID = req.session.sessionUserDATA.userID;
    const user = await User.findByPhone(userID);
    const users = recompileUser(user);
    req.session.sessionUserDATA = users;
    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
const db = require('../config/db');

const User = {
  findByPhone: async (phone_number) => {
    const [rows] = await db.execute(`SELECT 
        u.user_id as userID,
        u.phone_number as userPhone, 
        u.user_email as userEmail,
        u.password as userPassword,
        u.user_fname as userFname,
        u.user_lname as userLname,
        u.user_bday as userBday,
        u.user_gender as userGender,
        u.user_bio as userBio,
        u.user_avatar as userAvatar,
        u.phone_verified as userPhoneVerified,
        u.email_verified as userEmailVerified,
        u.password_updated_at as userPasswordLastDateUpdated,
        u.created_at as userAccountDateCreated,
        u.updated_at as userAccountLastDateUpdated,
        a.address_id as addressID,
        a.address_contact_person as contactPerson,
        a.address_contact_number as contactNumber,
        a.address_region as addressRegion,
        a.address_province as addressProvince,
        a.address_city as addressCity,
        a.address_barangay as addressBarangay,
        a.address_street as addressStreet,
        a.address_landmark as addressLandmark,
        a.address_label as addressLabel,
        a.address_default as addressDefault
      FROM 
        tbl_user u 
      LEFT JOIN 
        tbl_delivery_address a
        ON u.user_id = a.user_id
      WHERE u.phone_number = ? OR u.user_email = ? OR u.user_id = ?`, [phone_number,phone_number,phone_number]);
    return rows;
  }, 
    
  registerAccount: async (data) => {  
    const query = `
      INSERT INTO tbl_user
        (phone_number ,
        user_email ,
        password,
        user_fname,
        user_lname,
        user_bday,
        user_gender,
        user_bio,
        user_avatar,
        password_updated_at,
        phone_verified,
        email_verified) 
      VALUE (?, ?, ?, ?, ?, ?, ?, 'not set', 'not set', NOW(), 'false', 'false')
    `;

    const values = [ 
      data.phoneNumber, 
      data.email,
      data.password,
      data.fname,
      data.lname,
      data.bday,
      data.gender
    ];

    const [result] = await db.execute(query, values);
    return result;
  },
    
  addNewDeliveryAddress: async (data) => {
    const query = `
      INSERT INTO tbl_delivery_address
        (user_id ,
        address_contact_person ,
        address_contact_number,
        address_region,
        address_province,
        address_city,
        address_barangay,
        address_street,
        address_landmark,
        address_label,
        address_default) 
      VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'false')
    `;

    const values = [ 
      data.userID, 
      data.person,
      data.number,
      data.region,
      data.province,
      data.city,
      data.barangay,
      data.street,
      data.landmark,
      data.label
    ];

    const [result] = await db.execute(query, values);
    return result;
  },
    
  setDefaultAddress: async (data) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const query1 = `
          UPDATE tbl_delivery_address
          SET address_default = 'false'
          WHERE user_id = ?
        `;
        await conn.execute(query1, [data.userID]);
        const query2 = `
          UPDATE tbl_delivery_address
          SET address_default = 'true'
          WHERE address_id = ?
        `;
        const [result] = await conn.execute(query2, [data.addressID]);
        await conn.commit();
        return result;
      } catch (error) {
        await conn.rollback();
        throw error;
      }

    },
    
  deleteDeliveryAddress: async (data) => {
    const query = `DELETE FROM tbl_delivery_address WHERE address_id = ?`;
    const values = [data.addressID];
    const [result] = await db.execute(query, values);
    return result;
  },
    
  changePassword: async (data) => {
    const query = `UPDATE tbl_user SET password = ?, password_updated_at = NOW() WHERE user_id = ?`;
    const values = [data.pwNew,data.userID];
    const [result] = await db.execute(query, values);
    return result;
  },
    
  changeAvatar: async (data) => {
    
    const query = `UPDATE tbl_user SET user_avatar = ? WHERE user_id = ?`;

    const values = [ 
      data.userAvatar, 
      data.userID
    ];

    const [result] = await db.execute(query, values);
    return result;
  },
    
  updateUserInformation: async (data) => {
    const query = `UPDATE tbl_user SET 
      phone_number = ?,
      user_email = ?,
      user_fname = ?,
      user_lname = ?,
      user_bday = ?,
      user_gender = ?,
      user_bio = ?,
      phone_verified = ?,
      email_verified = ?
      WHERE user_id = ?`;

    const values = [ 
      data.newPhone, 
      data.newEmail,
      data.newFirstname,
      data.newLastname,
      data.newBirthday,
      data.newGender,
      data.newBio,
      data.phoneStatus,
      data.emailStatus,
      data.userID
    ];

    const [result] = await db.execute(query, values);
    return result;
  },


  selectAllProducts: async () => {
    const [rows] = await db.execute(
      `SELECT
        p.product_id as productID,
        p.product_sku as productSKU,
        p.product_name as productName,
        p.product_category as productCategory,
        p.product_subcategory as productSubCategory,
        p.product_description as productDescription,
        p.product_featured as productFeatured,
        p.product_created_at as productCreated,
        v.variant_id as variantID,
        v.variant_name as variantName,
        v.variant_sku as variantSKU,
        v.variant_barcode as variantBarcode,
        v.variant_stock_qty as variantStocks,
        v.variant_lowstock_alrt as variantLowStockAlert,
        v.variant_stock_plcy as variantStockPolicy,
        v.variant_regular_price as variantRegularPrice,
        v.variant_sale_price as variantSalePrice,
        v.variant_unit as variantUnit,
        v.variant_weight as variantWeight,
        v.variant_exp_date as variantExpirationDate,
        i.image_id as imageID,
        i.image_name as imageName,
        i.image_path as imagePath
      FROM
        tbl_products p
      JOIN
        tbl_product_variants v
          ON p.product_id = v.product_id
      JOIN
        tbl_images i
          ON p.product_id = i.product_id
      WHERE 
        p.product_status = 'Published';`
    );
    return rows;
  },



    
    
  addToCart: async (data) => {
      const query = `
          INSERT INTO tbl_carts (
              user_id,
              product_id,
              variant_id,
              product_quantity
          ) VALUES (?, ?, ?, ?)

          ON DUPLICATE KEY UPDATE
              product_quantity = product_quantity + VALUES(product_quantity)
      `;

      const values = [
          data.userID,
          data.productID,
          data.variantID,
          data.variantQuantity
      ];

      const [result] = await db.execute(query, values);

      return result;
  },
        
    
    
    
    
    
    

    selectCartBadgeData: async (data) => {
      const [rows] = await db.execute(`SELECT COUNT(*) AS totalItems FROM tbl_carts WHERE user_id = ?`, [data.userID]);
      return rows;
    },




    selectProductsInCart: async (data) => {
      const [rows] = await db.execute(`
        SELECT
          p.product_id as productID,
          p.product_name as productName,
          v.variant_id as variantID,
          v.variant_name as variantName,
          v.variant_stock_qty as variantStock,
          v.variant_regular_price as variantRegularPrice,
          v.variant_sale_price as variantSalePrice,
          v.variant_cost_price as variantCostPrice,
          v.variant_unit as variantUnit,
          c.cart_id as cartID,
          c.product_quantity as quantity,
          i.image_id as imageID,
          i.image_path as imagePath
        FROM
          tbl_carts c
        JOIN
          tbl_products p
            ON p.product_id = c.product_id
        JOIN
          tbl_product_variants v
            ON c.variant_id = v.variant_id
        JOIN
          tbl_images i
            ON p.product_id = i.product_id
        WHERE
          c.user_id = ?;`, [data.userID]);
      return rows;
    },
    
    updateQuantity: async (data) => {
      
      const query = `
        UPDATE tbl_carts SET
          product_quantity = product_quantity ${data.operator} ?
        WHERE
          cart_id = ?
      `;
  
      const values = [ data.quantity, data.cartId];
  
      const [result] = await db.execute(query, values);
      return result;
    },
    
    deleteProductInCart: async (data) => {
      const query = `DELETE FROM tbl_carts WHERE cart_id = ?`;
      const values = [data.cartId];
      const [result] = await db.execute(query, values);
      return result;
    },





  placeOrder: async (data) => {

      const conn = await db.getConnection();

      try {
          await conn.beginTransaction();

          // =========================
          // 1. GET SUBTOTAL FIRST
          // =========================
          const getSubtotalQuery = `
              SELECT
                  SUM(
                      IF(
                          v.variant_sale_price = 0,
                          v.variant_regular_price * c.product_quantity,
                          v.variant_sale_price * c.product_quantity
                      )
                  ) AS subtotal
              FROM tbl_carts c
              JOIN tbl_product_variants v ON c.variant_id = v.variant_id
              WHERE c.user_id = ?;
          `;

          const [rows] = await conn.execute(getSubtotalQuery, [
              data.userID
          ]);

          const subtotal = rows[0]?.subtotal || 0;

          const discount = data.discountTotal || 0;
          const shippingFee = data.shippingFee || 0;
          const total = subtotal - discount + shippingFee;


          // =========================
          // 2. INSERT ORDER
          // =========================
          const insertOrderQuery = `
              INSERT INTO tbl_orders 
              (
                  order_number,
                  user_id,
                  order_status,
                  order_subtotal,
                  discount_total,
                  shipping_fee,
                  total_amount,
                  da_person,
                  da_number,
                  da_street,
                  da_barangay,
                  da_city,
                  da_province,
                  da_landmark
              ) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const [orderResult] = await conn.execute(insertOrderQuery, [
              data.orderNumber,
              data.userID,
              data.orderStatus,
              subtotal,
              discount,
              shippingFee,
              total,
              data.deliveryAddressPerson,
              data.deliveryAddressNumber,
              data.deliveryAddressStreet,
              data.deliveryAddressBarangay,
              data.deliveryAddressCity,
              data.deliveryAddressProvince,
              data.deliveryAddressLandmark
          ]);

          const orderID = orderResult.insertId;


          // =========================
          // 3. INSERT ORDER ITEMS
          // =========================
          const insertOrderItemsQuery = `
              INSERT INTO tbl_order_items
              (
                  order_id,
                  variant_id,
                  product_id,
                  product_name,
                  variant_name,
                  order_variant_unit,
                  order_item_regular_price,
                  order_item_sale_price,
                  order_item_quantity,
                  order_item_subtotal
              )
              SELECT
                  ?,
                  v.variant_id,
                  p.product_id,
                  p.product_name,
                  v.variant_name,
                  v.variant_unit,
                  v.variant_regular_price,
                  v.variant_sale_price,
                  c.product_quantity,
                  IF(
                      v.variant_sale_price = 0,
                      v.variant_regular_price * c.product_quantity,
                      v.variant_sale_price * c.product_quantity
                  )
              FROM tbl_products p
              JOIN tbl_carts c ON p.product_id = c.product_id
              JOIN tbl_product_variants v ON c.variant_id = v.variant_id
              WHERE c.user_id = ?;
          `;

          await conn.execute(insertOrderItemsQuery, [
              orderID,
              data.userID
          ]);

          // =========================
          // 4. Update Stocks
          // =========================
          const updateStocksQuery = `
            UPDATE tbl_product_variants v
            JOIN tbl_carts c ON v.variant_id = c.variant_id
            SET v.variant_stock_qty = v.variant_stock_qty - c.product_quantity
            WHERE c.user_id = ?;`;
          await conn.execute(updateStocksQuery, [
              data.userID
          ]);

          // =========================
          // 4. Movement Stocks
          // =========================
          const updateMovementQuery = `
            INSERT INTO tbl_stock_movements
            (
              variant_id,
              product_id,
              movement_type,
              movement_quantity,
              reference_id,
              reference_type,
              movement_remarks,
              created_by
            )
            SELECT
                v.variant_id,
                c.product_id,
                'sale',
                CONCAT('-',c.product_quantity),
                ?,
                'order',
                'Customer purchased items',
                ?
            FROM 
              tbl_carts c 
            JOIN 
              tbl_product_variants v 
              ON c.variant_id = v.variant_id
            WHERE c.user_id = ?;`;
          await conn.execute(updateMovementQuery, [
              data.userID,
              data.createdBy,
              data.userID
          ]);


          // =========================
          // 4. Empty Cart ITEMS
          // =========================
          const deleteProductsInCart = `DELETE FROM tbl_carts WHERE user_id = ?;`;
          await conn.execute(deleteProductsInCart, [
              data.userID
          ]);


          // =========================
          // 4. Add Payment
          // =========================
          const paymentInfo = `
            INSERT INTO tbl_payments
            (
              order_id,
              user_id,
              payment_method,
              payment_status,
              payment_reference,
              transaction_id,
              product_paid,
              shipping_paid,
              payment_date
            ) 
            VALUES (?,?,?,'pending',NULL,NULL,0,0,NULL)
            `;
          await conn.execute(paymentInfo, [
              orderID,
              data.userID,
              data.paymentMethod
          ]);


          // =========================
          // 5. COMMIT
          // =========================
          await conn.commit();
          conn.release();

          return {
              success: true,
              orderID,
              subtotal,
              total
          };

      } catch (error) {
          await conn.rollback();
          conn.release();
          throw error;
      }
  },
  
  
  
  
  
  
  
  
  
  
  
  
  
  selectOrders: async (data) => {
      const [rows] = await db.execute(`SELECT
          p.product_id as productID,
          p.product_name as productName,
          p.product_category as productCategory,
          py.payment_method as paymentMethod,
          py.payment_status as paymentStatus,
          i.order_variant_unit as productUnit,
          i.order_item_regular_price as regularPrice,
          i.order_item_id as itemID,
          i.order_item_sale_price as salePrice,
          i.order_item_quantity as productQuantity,
          i.order_item_subtotal as productTotal,
          o.order_number as orderNumber,
          o.order_status as orderStatus,
          o.discount_total as discountTotal,
          o.shipping_fee as shippingFee,
          o.total_amount as orderTotal,
          img.image_id as imageID,
          img.image_path as imagePath
      FROM 
        tbl_products p
      JOIN
        tbl_order_items i
          ON p.product_id = i.product_id
      JOIN
        tbl_orders o
          ON i.order_id = o.order_id
      JOIN 
      	tbl_images img
        ON i.product_id = img.product_id
      JOIN
      	tbl_payments py
        ON o.order_id = py.order_id
      WHERE
        o.user_id = ?;`, [data.userID]);
      return rows;
    },
    





    updateOrderStatus: async (data) => {
      const conn = await db.getConnection();
      try{
        
        await conn.beginTransaction();

        await conn.execute(`
          UPDATE tbl_orders 
            SET order_status = ? 
          WHERE order_number = ?`, 
          [
            data.orderStatus, 
            data.orderNumber
          ]
        );

        if(data.orderStatus == 'cancelled'){
          await conn.execute(`
            INSERT INTO tbl_stock_movements
            (
              variant_id,
              product_id,
              movement_type,
              movement_quantity,
              reference_id,
              reference_type,
              movement_remarks,
              created_by
            )
            SELECT
              i.variant_id,
              i.product_id,
              ?,
              i.order_item_quantity,
              ?,
              'order',
              'Customer cancelled order',
              ?
            FROM
              tbl_orders o
            JOIN
              tbl_order_items i
                ON o.order_id = i.order_id
            WHERE
              o.order_number = ?;`, 
            [
              data.orderStatus,
              data.userID,
              data.createdBy, 
              data.orderNumber
            ]
          );


          
        await conn.execute(`
          UPDATE tbl_product_variants v
            JOIN (
                SELECT 
                    i.variant_id,
                    i.order_item_quantity
                FROM tbl_orders o
                JOIN tbl_order_items i
                    ON o.order_id = i.order_id
                WHERE o.order_number = ?
            ) x
            ON v.variant_id = x.variant_id
            SET v.variant_stock_qty = v.variant_stock_qty + x.order_item_quantity;`, 
            [
              data.orderNumber
            ]
          );

          await conn.execute(`UPDATE tbl_payments SET payment_status = 'failed' WHERE order_id = (SELECT order_id FROM tbl_orders WHERE order_number = ?);`, [data.orderNumber]);

        }
        
        await conn.commit();
        conn.release();
        return {success: true};

      } catch (error) {
          await conn.rollback();
          conn.release();
          console.log(error);
          return {success: false};
      }
      
    },


};

module.exports = User;
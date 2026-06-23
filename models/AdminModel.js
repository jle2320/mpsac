const db = require('../config/db');

const Admin = {
  findByUsername: async (username) => {
    const [rows] = await db.execute('SELECT * FROM tbl_admins WHERE admin_username = ?', [username]);
    return rows[0];
  },


  savePublishProduct: async (data) => {
    const conn = await db.getConnection();
    try{
      await conn.beginTransaction();

      const [productResult] = await db.execute(
        `INSERT INTO tbl_products
        (
          product_sku,
          product_name,
          product_category,
          product_subcategory,
          product_description,
          product_status,
          product_featured
        ) 
        VALUES (?,?,?,?,?,?,?)`, 
        [
          data.productSKU,
          data.productName,
          data.productCategory,
          data.productSubCategory,
          data.productDescription,
          data.productStatus,
          data.isFeatured
        ]
      );
      const productId = productResult.insertId;

      for (const v of data.variants) {
        const [variantResult] = await db.execute(
          `INSERT INTO tbl_product_variants
          (
            product_id, 
            variant_name, 
            variant_sku, 
            variant_barcode, 
            variant_stock_qty, 
            variant_lowstock_alrt, 
            variant_stock_plcy, 
            variant_regular_price, 
            variant_sale_price, 
            variant_cost_price, 
            variant_unit, 
            variant_weight, 
            variant_exp_date
          ) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
          , [
            productId,
            v.variantName,
            v.variantSKU,
            v.variantBarcode,
            v.variantStock,
            v.variantLowStock,
            v.variantStockPolicy,
            v.variantRegularPrice,
            v.variantSalePrice,
            v.variantCostPrice,
            v.variantUnit,
            v.variantWeight,
            v.variantExpirationDate
          ]);

          const variantId = variantResult.insertId;
          const [movementResult] = await db.execute(
          `INSERT INTO tbl_stock_movements
          (
            variant_id, 
            product_id, 
            movement_type, 
            movement_quantity, 
            reference_id, 
            reference_type, 
            movement_remarks, 
            created_by
          ) VALUES (?,?,'restock',?,NULL,'manual','Admin restocked inventory','Admin')`
          , [
            variantId,
            productId,
            v.variantStock
          ]);
      }

      // save image
      for (const image of data.productImages) {
        await db.execute(
          `INSERT INTO tbl_images 
          (
            product_id,
            image_name,
            image_path
          ) VALUES (?, ?, ?)`, 
          [
            productId,
            image.filename,
            image.path
          ]
        );
      }

      await conn.commit();
      conn.release();

      return {
          success: true,
          productId:productId
      };

    }catch(error){
      await conn.rollback();
      console.error("Transaction failed:", error);
      return {
          success: false,
          message:"Transaction failed"
      };
    } finally {
      conn.release();
    }
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
        p.product_status as productStatus,
        p.product_featured as productFeatured,
        p.product_created_at as productCreated,
        p.product_updated_at as productUpdated,
        v.variant_id as variantID,
        v.variant_name as variantName,
        v.variant_sku as variantSKU,
        v.variant_barcode as variantBarcode,
        v.variant_stock_qty as variantStocks,
        v.variant_lowstock_alrt as variantLowStockAlert,
        v.variant_stock_plcy as variantStockPolicy,
        v.variant_regular_price as variantRegularPrice,
        v.variant_sale_price as variantSalePrice,
        v.variant_cost_price as variantCostPrice,
        v.variant_unit as variantUnit,
        v.variant_weight as variantWeight,
        v.variant_exp_date as variantExpirationDate,
        m.movement_id as movementID,
        m.movement_type as movementType,
        m.movement_quantity as movementQuantity,
        m.movement_remarks as movementRemarks,
        m.created_at as movementDate,
        i.image_id as imageID,
        i.image_name as imageName,
        i.image_path as imagePath
      FROM
        tbl_products p
      JOIN
        tbl_product_variants v
          ON p.product_id = v.product_id
      JOIN
        tbl_stock_movements m
          ON v.variant_id = m.variant_id
          AND m.movement_type = 'restock'
      JOIN
        tbl_images i
          ON p.product_id = i.product_id;`
    );
    return rows;
  },




  selectCustomersData: async () => {
    const [rows] = await db.execute(
      `SELECT
          u.user_id,
          u.phone_number AS userPhone,
          u.user_email AS userEmail,
          u.user_fname AS userFname,
          u.user_lname AS userLname,
          u.phone_verified AS phoneVerified,
          u.email_verified AS emailVerified,
          DATE_FORMAT(u.created_at, '%M %d, %Y') AS createdAt,

          COALESCE(SUM(o.order_subtotal - o.discount_total), 0) AS totalSpent,

          COUNT(o.order_id) AS totalOrders

      FROM tbl_user u

      LEFT JOIN tbl_orders o
          ON u.user_id = o.user_id

      GROUP BY u.user_id

      ORDER BY u.created_at ASC;`
    );
    return rows;
  },




  selectInventoryData: async () => {
    const [rows] = await db.execute(
      `SELECT
          p.product_id as productID,
          p.product_sku as productSKU,
          p.product_name as productName,
          p.product_category as productCategory,
          v.variant_id as variantID,
          v.variant_name variantName,
          v.variant_sku as variantSKU,
          v.variant_barcode as variantBarcode,
          v.variant_stock_plcy as variantStockPlcy,
          v.variant_stock_qty as variantStock,
          v.variant_lowstock_alrt as lowStockAlert,
          v.variant_unit as variantUnit,
          v.variant_regular_price as variantRegularPrice,
          v.variant_sale_price as variantSalePrice,
          v.variant_cost_price as variantCostPrice,
          m.movement_id as movementID,
          m.movement_type as movementType,
          m.movement_quantity as movementQuantity,
          DATE_FORMAT(m.created_at, '%M %d, %Y') as movementDate
      FROM
        tbl_products p
      JOIN
        tbl_product_variants v
          ON p.product_id = v.product_id
      JOIN
        tbl_stock_movements m
          ON v.variant_id = m.variant_id
      ORDER BY 
        v.variant_stock_qty ASC;`
    );
    return rows;
  },















  restockVariant: async (data) => {
    const conn = await db.getConnection();
    try{
      
      await conn.beginTransaction();

      await conn.execute(`
        UPDATE tbl_product_variants 
          SET variant_stock_qty = variant_stock_qty + ? 
        WHERE variant_id = ?`,  
        [data.restockQty, data.variantID]
      );

      await db.execute(
          `INSERT INTO tbl_stock_movements
          (
            variant_id, 
            product_id, 
            movement_type, 
            movement_quantity, 
            reference_id, 
            reference_type, 
            movement_remarks, 
            created_by
          ) VALUES (?,?,'restock',?,NULL,'manual','Admin restocked inventory','Admin')`
          , [
            data.variantID,
            data.productId,
            data.restockQty
          ]
      );
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





  adjustStockVariant: async (data) => {
    const conn = await db.getConnection();
    try{
      
      await conn.beginTransaction();

      await conn.execute(`
        UPDATE tbl_product_variants 
          SET variant_stock_qty = variant_stock_qty + ? 
        WHERE variant_id = ?`,  
        [data.adjustkQty, data.variantID]
      );

      await db.execute(
          `INSERT INTO tbl_stock_movements
          (
            variant_id, 
            product_id, 
            movement_type, 
            movement_quantity, 
            reference_id, 
            reference_type, 
            movement_remarks, 
            created_by
          ) VALUES (?,?,'adjustment',?,NULL,'manual','Admin adjust inventory','Admin')`
          , [
            data.variantID,
            data.productId,
            data.adjustkQty
          ]
      );
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




















  
  
  



  
  
  selectOrders: async () => {
    const [rows] = await db.execute(`
      SELECT
        CONCAT(u.user_fname, ' ', u.user_lname) as customerName,
          u.phone_number as customerPhone,
          u.user_email as customerEmail,
          o.order_number as orderNumber,
          o.order_status as orderStatus,
          o.order_subtotal as orderSubTotal,
          o.discount_total as orderDiscount,
          o.shipping_fee as orderShippingFee,
          o.total_amount as orderTotal,
          o.created_at as orderDate,
          o.da_person as orderContactPerson,
          o.da_number as orderContactNumber,
          o.da_street as orderContactStreet,
          o.da_barangay as orderContactBarangay,
          o.da_city as orderContactCity,
          o.da_province as orderContactProvince,
          o.da_landmark as orderContactLandmark,
          oi.order_item_id as itemID,
          oi.product_name as productName,
          oi.variant_name as variantName,
          oi.order_variant_unit as itemUnit,
          oi.order_item_regular_price as itemRegularPrice,
          oi.order_item_sale_price as itemSalePrice,
          oi.order_item_quantity as itemQuantity,
          oi.order_item_subtotal as itemTotal,
          py.payment_method as orderPayment,
          i.image_id as imageID,
          i.image_path as imagePath
      FROM
        tbl_orders o
      JOIN
        tbl_order_items oi
          ON o.order_id = oi.order_id
      JOIN
        tbl_images i 
          ON oi.product_id = i.product_id
      JOIN
        tbl_user u
          ON u.user_id = o.user_id
      JOIN
      	tbl_payments py
        ON o.order_id = py.order_id;
    `);
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

      // Cancel Order Status
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
            NULL,
            'order',
            'Order was cancelled by the shop.',
            'Admin'
          FROM
            tbl_orders o
          JOIN
            tbl_order_items i
              ON o.order_id = i.order_id
          WHERE
            o.order_number = ?;`, 
          [
            data.orderStatus,
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





      // Completed Order Status
      if(data.orderStatus == 'completed'){
        await conn.execute(`
          UPDATE tbl_payments p
          JOIN tbl_orders o ON o.order_id = p.order_id
          SET 
              p.payment_status = 'paid',
              p.product_paid = (o.order_subtotal - o.discount_total),
              p.shipping_paid = o.shipping_fee,
              p.payment_date = NOW()
          WHERE 
              o.order_number = ?;
          `, [data.orderNumber]);
      }


      
      await conn.commit();
      conn.release();
      return {success: true};

    } catch (error) {
        await conn.rollback();
        conn.release();
        return {success: false};
    }
  },












  // Get  pending orders limit 10
  selectLimit10PendingOrders: async () => {
    const [rows] = await db.execute(`
      WITH latest_orders AS (
          SELECT order_id, order_number
          FROM tbl_orders
          WHERE order_status = 'pending'
          ORDER BY created_at DESC
          LIMIT 10
      )

      SELECT
          o.order_number AS orderNumber,
          CONCAT(u.user_fname, ' ', u.user_lname) AS customerName,
          i.order_item_id AS itemID,
          i.product_name AS productName,
          (o.order_subtotal - o.discount_total) AS totalAmountOrder,
          DATE_FORMAT(o.created_at, '%d %M, %Y') AS orderDate
      FROM latest_orders lo
      JOIN tbl_orders o ON lo.order_id = o.order_id
      JOIN tbl_user u ON o.user_id = u.user_id
      JOIN tbl_order_items i ON o.order_id = i.order_id
      ORDER BY o.created_at ASC;
    `);
    return rows;
  },


  // Get all the low stocks varaints
  selectAllLowStockVariants: async () => {
    const [rows] = await db.execute(`
      SELECT
        p.product_name as productName,
        v.variant_name as variantName,
        v.variant_stock_qty as quantity,
        v.variant_lowstock_alrt as lowStockAlert
      FROM
        tbl_products p
      JOIN
        tbl_product_variants v
          ON p.product_id = v.product_id
      WHERE
        v.variant_stock_qty <= v.variant_lowstock_alrt
      ORDER BY 
        v.variant_stock_qty ASC;
    `);
    return rows;
  },
  
  
  // Get  movement stocks limit 10
  selectLimit10MovementStocks: async () => {
    const [rows] = await db.execute(`
      SELECT 
        p.product_name as productName,
          v.variant_name as variantName,
          m.movement_type as movementType,
          m.movement_quantity as quantity
      FROM 
        tbl_products p
      JOIN
        tbl_product_variants v
          ON p.product_id = v.product_id
      JOIN
        tbl_stock_movements m
          ON p.product_id = m.product_id
          AND v.variant_id = m.variant_id
      ORDER BY
        m.created_at DESC
      LIMIT 5;
    `);
    return rows;
  },


  // Count Total Revenue
  coutTodayTotalRevenue: async () => {
    const [rows] = await db.execute(`
      SELECT
        COALESCE(SUM(CASE 
          WHEN payment_date >= CURDATE() 
          AND payment_date < CURDATE() + INTERVAL 1 DAY 
          THEN product_paid ELSE 0 END), 0) AS today_revenue,

        COALESCE(SUM(CASE 
          WHEN payment_date >= CURDATE() - INTERVAL 1 DAY 
          AND payment_date < CURDATE() 
          THEN product_paid ELSE 0 END), 0) AS yesterday_revenue

      FROM tbl_payments
      WHERE payment_status = 'paid';
    `);
    return rows[0];
  },



  // Count Revenue for 7 days
  coutRevenueFor7Days: async () => {
    const [rows] = await db.execute(`
      SELECT 
          DATE(payment_date) AS revenueDate,
          COALESCE(SUM(product_paid), 0) AS totalRevenue
      FROM tbl_payments
      WHERE 
          payment_status = 'paid'
          AND payment_date IS NOT NULL
          AND payment_date >= CURDATE() - INTERVAL 6 DAY
      GROUP BY DATE(payment_date)
      ORDER BY revenueDate ASC;
    `);
    return rows;
  },

  // Count Revenue for Last 4 Weeks
  countRevenueFor4Weeks: async () => {
    const [rows] = await db.execute(`
      SELECT 
          YEARWEEK(payment_date, 1) AS yearWeek,
          MIN(DATE(payment_date)) AS weekStart,
          MAX(DATE(payment_date)) AS weekEnd,
          COALESCE(SUM(product_paid), 0) AS totalRevenue
      FROM tbl_payments
      WHERE 
          payment_status = 'paid'
          AND payment_date IS NOT NULL
          AND payment_date >= CURDATE() - INTERVAL 3 WEEK
      GROUP BY YEARWEEK(payment_date, 1)
      ORDER BY yearWeek ASC;
    `);
    return rows;
  },

  // Count Revenue for Last 12 months
  countRevenueFor12Months: async () => {
    const [rows] = await db.execute(`
      SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') AS yearMonth,
          DATE_FORMAT(payment_date, '%M %Y') AS monthLabel,
          MIN(DATE(payment_date)) AS monthStart,
          MAX(DATE(payment_date)) AS monthEnd,
          COALESCE(SUM(product_paid), 0) AS totalRevenue
      FROM tbl_payments
      WHERE 
          payment_status = 'paid'
          AND payment_date IS NOT NULL
          AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
      GROUP BY YEAR(payment_date), MONTH(payment_date)
      ORDER BY yearMonth ASC;
    `);
    return rows;
  },



  // Count Ongoing Orders
  coutOngoingOrders: async () => {
    const [rows] = await db.execute(`SELECT order_status as orderStatus FROM tbl_orders WHERE order_status IN ('pending','to_ship','to_receive')`);
    return rows;
  },

  // Count Total products
  coutTotalProducts: async () => {
    const [rows] = await db.execute(`
      SELECT
        p.product_id as productID,
          v.variant_id as variantID,
          v.variant_stock_qty as stockQuantity,
          v.variant_lowstock_alrt as stockLowAlert
      FROM
        tbl_products p
      JOIN
        tbl_product_variants v
          ON p.product_id = v.product_id;
    `);
    return rows;
  },

  // Count Total customers
  coutTotalCustomers: async () => {
    const [rows] = await db.execute(`
      SELECT
        phone_verified as phoneVerified,
        email_verified as emailVerified
      FROM tbl_user
    `);
    return rows;
  },












};




module.exports = Admin;
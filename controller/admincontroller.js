
const userCollection = require("../models/mongoose");
const productCollection = require("../models/product")
const returnCollection = require("../models/returnstatus")
const multer = require("multer");
const excel = require('exceljs')
const pdfkit = require('pdfkit')
const dotenv = require('dotenv').config();

let user;



const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
  },
});



const login = (req, res) => {
  res.render("admin/admin");
}



const loginPost = async (req, res) => {


  if (req.body.email == process.env.ADEMAIL && req.body.password == process.env.ADPASSWORD) {
    req.session.admin = req.body.email;
    console.log("session", req.session.admin);
    const orderCount = await userCollection.aggregate([
      { $unwind: '$orders' },
      { $group: { _id: null, totalOrders: { $sum: 1 } } },
      { $project: { _id: 0, totalOrders: 1 } }
    ]);
    const userCount = await userCollection.countDocuments();
    const [{ totalOrders }] = orderCount;
    console.log(typeof (totalOrders));

    const totalSales = await userCollection.aggregate([
      {
        $unwind: "$orders" // Unwind the orders array to work with individual orders
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$orders.price" } // Calculate the sum of the price field in orders
        }
      }
    ]);

    const [{ totalAmount }] = totalSales;

    console.log("Total Sales Amount:", totalAmount);

    console.log("Total number of orders:", totalOrders);
    res.render("admin/admindashboard", { totalOrders, userCount, totalAmount })
  }
  else {
    res.redirect("/admin/admin")

  }
}


const adminDashboard = async (req, res) => {
  const orderCount = await userCollection.aggregate([
    { $unwind: '$orders' },
    { $group: { _id: null, totalOrders: { $sum: 1 } } },
    { $project: { _id: 0, totalOrders: 1 } }
  ]);
  const userCount = await userCollection.countDocuments();
  const [{ totalOrders }] = orderCount;
  console.log(typeof (totalOrders));

  const totalSales = await userCollection.aggregate([
    {
      $unwind: "$orders" // Unwind the orders array to work with individual orders
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$orders.price" } // Calculate the sum of the price field in orders
      }
    }
  ]);

  const [{ totalAmount }] = totalSales;

  console.log("Total Sales Amount:", totalAmount);

  console.log("Total number of orders:", totalOrders);
  res.render("admin/admindashboard", { totalOrders, userCount, totalAmount })
}



const usersearch = async (req, res) => {


  try {

    const search = req.body.search;

    if (search) {
    }

    const usersData = await userCollection.find({ name: search })


    res.redirect('/admin/usermanagement', { user: usersData });


  } catch (error) {
    console.log(error.message);
  }
}


const ITEMSS_PER_PAGE = 10; // Set the number of items per page

const ordermanagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query string or default to 1

    // Calculate the skip value based on the page number
    const skip = (page - 1) * ITEMSS_PER_PAGE;


    const orders = await userCollection.aggregate([
      { $unwind: "$orders" },
      {
        $project: {
          productName: "$orders.name",
          category: "$orders.category",
          quantity: "$orders.quantity",
          price: "$orders.price",
          image: "$orders.image",
          userId: "$orders.userId",
          id: "$orders._id",
          status: "$orders.status",
          createdAt: { $toDate: "$orders._id" },
        },
      },
      { $sort: { createdAt: 1 } }, // Sort by createdAt in descending order
      { $skip: skip }, // Skip documents based on the page number
      { $limit: ITEMSS_PER_PAGE }, // Limit the number of documents per page
    ]);

    // Count the total number of orders without pagination
    const totalCount = await userCollection.countDocuments({});

    res.render("admin/ordermanagement", {
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalCount / ITEMSS_PER_PAGE),
      ITEMSS_PER_PAGE: ITEMSS_PER_PAGE,
    });
  } catch (error) {
    console.error("Error in ordermanagement:", error);
    res.status(500).send("Internal Server Error");
  }
};





const orderstatus = async (req, res) => {
  const id = req.body.id;
  const status = req.body.productcategory;


  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": id },

    { $set: { "orders.$.status": status } },
    { new: true })
  if (updatestatus) (

    res.redirect("/admin/ordermanagement")
  )


}



const returnOrders = async (req, res) => {
  const returndata = await returnCollection.find()

  res.render("admin/return", { returndata })

}

const returnApprove = async (req, res) => {
  const { id, user, price, qty, pname, cartid } = req.query;



  const wallettotal1 = await userCollection.findOne({ _id: user }, { wallet: 1 })
  const wallettotal = wallettotal1.wallet.total

  const returnamount1 = price * qty
  const returnamount = wallettotal + returnamount1

  const status1 = 'refund'

  wallethistory = {
    productName: pname,
    amount: returnamount1,
    status: status1
  }

  await userCollection.findOneAndUpdate(
    { _id: user },
    { $push: { 'wallet.wallethistory': wallethistory } },
    { new: true }
  );

  await userCollection.updateOne({ _id: user }, { $set: { 'wallet.total': returnamount } })

  const status = 'approved'


  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": cartid },

    { $set: { "orders.$.status": status } },
    { new: true })



  const product = await productCollection.findOne({ name: pname });



  if (product) {
    const returnedQuantity = Number(qty);

    product.stock += returnedQuantity;

    await product.save();

  } else {
    // Handle the case where the product with the given name is not found.
    console.error('Product not found for name:', pname);
  }


  await returnCollection.deleteOne({ cartid: cartid })

  res.redirect('/admin/returnorder')

}

const returnReject = async (req, res) => {
  const { id, user, price, qty, pname, cartid } = req.query;
  const status = 'return rejected'


  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": cartid },

    { $set: { "orders.$.status": status } },
    { new: true })

  await returnCollection.deleteOne({ cartid: cartid })


  res.redirect('/admin/returnorder')
}



// ------------------------reports----------------------

const reports = async (req, res) => {
  res.render('admin/report', { message: " " })
}



// ------------------------sales month excell-------------------------


const generateExcelReportMonth = async (req, res) => {

  const { selectedDate } = req.query;

  try {
    if (!selectedDate) {
      return res.status(400).json({ error: 'Selected date is required.' });
    }

    const selectedMonth = new Date(selectedDate).getMonth() + 1; // Adjust month index

    const pipeline = [
      {
        $unwind: '$orders',
      },
      {
        $addFields: {
          orderMonth: { $month: '$orders.date' },
        },
      },
      {
        $match: { orderMonth: selectedMonth },
      },
    ];

    const result = await userCollection.aggregate(pipeline)

    if (result.length === 0) {
      return res.status(404).json({ error: 'No data found for the selected month.' });
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Price', key: 'totalPrice', width: 20 },
    ];

    result.forEach(order => {
      const productName = order.orders.name;
      const quantity = order.orders.quantity;
      const totalprice = order.orders.price;

      worksheet.addRow({ productName, quantity, totalPrice: totalprice });
    });

    const fileName = `sales_report_${selectedDate}.xlsx`;

    // Set response headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Write the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ---------------------------sales year excell---------------------------


const yearaleexcellreport = async (req, res) => {
  const { selectedDate } = req.query;


  if (!selectedDate) {
    return res.status(400).json({ error: 'Selected date is required.' });
  }
  const selectedYear = new Date(selectedDate).getFullYear();

  const pipeline = [
    {
      $unwind: '$orders'
    },
    {
      $addFields: {
        orderYear: { $year: '$orders.date' }
      }
    },
    {
      $match: { orderYear: selectedYear }
    }
  ];

  try {
    const result = await userCollection.aggregate(pipeline);
    console.log(result);
    if (result == '') {
      return;
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: ' Price', key: 'totalPrice', width: 20 },
    ];

    result.forEach(order => {
      const productName = order.orders.name;
      const quantity = order.orders.quantity;
      const totalprice = order.orders.price;

      worksheet.addRow({ productName, quantity, totalPrice: totalprice });
    });

    const fileName = `sales_report_${selectedDate}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const editImageDelete = async (req, res) => {
  try {
    const id = req.params.id;
    const productid = req.params.productid;
    const product = await productCollection.findById(productid)

    // Check if the product ID and image ID are valid
    if (!productid || !id) {
      return res.status(400).json({ message: 'Invalid product or image ID' });
    }

    const updatedProduct = await productCollection.findByIdAndUpdate(
      productid,
      { $pull: { image: id } },
      { new: true }
    );

    if (updatedProduct) {
      req.session.message1 = {
        type: 'success',
        message: 'Image deleted successfully',
      };
      return res.render('admin/edit_products', { product });



    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error deleting image: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const saleReportWeek = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);




    const pipeline = [
      {
        $unwind: '$orders',
      },
      {
        $addFields: {
          orderMonth: { $month: '$orders.date' },
        },
      },
      {
        $match: {
          'orders.date': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ];




    const result = await userCollection.aggregate(pipeline);

    if (result.length === 0) {
      const errorMessage = "Please add a valid date.";
      return res.render('admin/report', { message: errorMessage });
    } else {



      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      worksheet.columns = [
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: ' Price', key: 'totalPrice', width: 20 },
      ];

      result.forEach(order => {
        const productName = order.orders.name;
        const quantity = order.orders.quantity;
        const totalprice = order.orders.price;

        worksheet.addRow({ productName, quantity, totalPrice: totalprice });
      });

      const fileName = `sales_report_${startDate}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      await workbook.xlsx.write(res);
      res.end();
      return res.redirect('/admin/report')
    }


  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}




const monthPdf = async (req, res) => {

  const { selectedDate } = req.query;

  if (!selectedDate) {
    return res.status(400).json({ error: 'Selected date is required.' });
  }

  const selectedMonth = new Date(selectedDate).getMonth() + 1; // Adjust month index

  const pipeline = [
    {
      $unwind: '$orders',
    },
    {
      $addFields: {
        orderMonth: { $month: '$orders.date' },
      },
    },
    {
      $match: { orderMonth: selectedMonth },
    },
  ];

  try {
    const result = await userCollection.aggregate(pipeline);

    if (result.length === 0) {
      return res.status(404).json({ error: 'No data found for the selected month.' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${selectedDate}.pdf`);

    doc.pipe(res);

    // Add Sales Report heading
    doc.fontSize(16).text(`Sales Report for ${selectedDate}`, { align: 'center' });
    doc.moveDown(); // Add a gap

    // Set up table headers with bold text
    const headerY = doc.y; // Store the y-coordinate for the header
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Product Name', 50, headerY)
      .text('Quantity', 250, headerY)
      .text('Total Price', 350, headerY);

    // Draw table header borders
    doc
      .moveTo(50, headerY + 15)
      .lineTo(200, headerY + 15)
      .stroke();

    doc
      .moveTo(250, headerY + 15)
      .lineTo(350, headerY + 15)
      .stroke();

    doc
      .moveTo(350, headerY + 15)
      .lineTo(450, headerY + 15)
      .stroke();

    // Add table rows
    let yOffset = headerY + 15; // Start from the bottom of the header
    result.forEach(order => {
      const productName = order.orders.name;
      const quantity = order.orders.quantity;
      const totalPrice = order.orders.price;

      // Draw cell borders
      doc
        .rect(50, yOffset, 200, 20)
        .stroke();

      doc
        .rect(250, yOffset, 100, 20)
        .stroke();

      doc
        .rect(350, yOffset, 100, 20)
        .stroke();

      // Add content
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(productName, 55, yOffset + 5) // Adjusted x-coordinate
        .text(quantity.toString(), 255, yOffset + 5)
        .text(totalPrice.toString(), 355, yOffset + 5);

      // Draw table row borders
      doc
        .moveTo(50, yOffset + 20)
        .lineTo(200, yOffset + 20)
        .stroke();

      doc
        .moveTo(250, yOffset + 20)
        .lineTo(350, yOffset + 20)
        .stroke();

      doc
        .moveTo(350, yOffset + 20)
        .lineTo(450, yOffset + 20)
        .stroke();

      yOffset += 20;
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};







const generatePDFReportYear = async (req, res) => {
  console.log('year');
  const { selectedDate } = req.query;

  if (!selectedDate) {
    return res.status(400).json({ error: 'Selected date is required.' });
  }

  const pipeline = [
    {
      $unwind: '$orders',
    },
    {
      $addFields: {
        orderYear: { $year: '$orders.date' },
      },
    },
    {
      $match: { orderYear: parseInt(selectedDate) },
    },
  ];

  try {
    const result = await userCollection.aggregate(pipeline);

    if (result.length === 0) {
      return res.status(404).json({ error: 'No data found for the selected year.' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${selectedDate}.pdf`);

    doc.pipe(res);

    // Add Sales Report heading
    doc.fontSize(16).text(`Sales Report for ${selectedDate}`, { align: 'center' });
    doc.moveDown(); // Add a gap

    // Set up table headers with bold text
    const headerY = doc.y; // Store the y-coordinate for the header
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Product Name', 50, headerY)
      .text('Quantity', 250, headerY)
      .text('Total Price', 350, headerY);

    // Draw table header borders
    doc
      .moveTo(50, headerY + 15)
      .lineTo(200, headerY + 15)
      .stroke();

    doc
      .moveTo(250, headerY + 15)
      .lineTo(350, headerY + 15)
      .stroke();

    doc
      .moveTo(350, headerY + 15)
      .lineTo(450, headerY + 15)
      .stroke();

    // Add table rows
    let yOffset = headerY + 15; // Start from the bottom of the header
    result.forEach(order => {
      const productName = order.orders.name;
      const quantity = order.orders.quantity;
      const totalPrice = order.orders.price;

      // Draw cell borders
      doc
        .rect(50, yOffset, 200, 20)
        .stroke();

      doc
        .rect(250, yOffset, 100, 20)
        .stroke();

      doc
        .rect(350, yOffset, 100, 20)
        .stroke();

      // Add content
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(productName, 55, yOffset + 5) // Adjusted x-coordinate
        .text(quantity.toString(), 255, yOffset + 5)
        .text(totalPrice.toString(), 355, yOffset + 5);

      // Draw table row borders
      doc
        .moveTo(50, yOffset + 20)
        .lineTo(200, yOffset + 20)
        .stroke();

      doc
        .moveTo(250, yOffset + 20)
        .lineTo(350, yOffset + 20)
        .stroke();

      doc
        .moveTo(350, yOffset + 20)
        .lineTo(450, yOffset + 20)
        .stroke();

      yOffset += 20;
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const generatePDFReportDate = async (req, res) => {

  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);

    const pipeline = [
      {
        $unwind: '$orders',
      },
      {
        $addFields: {
          orderMonth: { $month: '$orders.date' },
        },
      },
      {
        $match: {
          'orders.date': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ];

    const result = await userCollection.aggregate(pipeline);

    if (result.length === 0) {
      const errorMessage = "Please add a valid date.";
      return res.render('admin/report', { message: errorMessage });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${startDate.toDateString()}.pdf`);

    doc.pipe(res);

    // Add Sales Report heading
    doc.fontSize(16).text(`Sales Report from ${startDate.toDateString()} to ${endDate.toDateString()}`, { align: 'center' });
    doc.moveDown(); // Add a gap

    // Set up table headers with bold text
    const headerY = doc.y; // Store the y-coordinate for the header
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Product Name', 50, headerY)
      .text('Quantity', 250, headerY)
      .text('Total Price', 350, headerY);

    // Draw table header borders
    doc
      .moveTo(50, headerY + 15)
      .lineTo(200, headerY + 15)
      .stroke();

    doc
      .moveTo(250, headerY + 15)
      .lineTo(350, headerY + 15)
      .stroke();

    doc
      .moveTo(350, headerY + 15)
      .lineTo(450, headerY + 15)
      .stroke();

    // Add table rows
    let yOffset = headerY + 15; // Start from the bottom of the header
    result.forEach(order => {
      const productName = order.orders.name;
      const quantity = order.orders.quantity;
      const totalPrice = order.orders.price;

      // Draw cell borders
      doc
        .rect(50, yOffset, 200, 20)
        .stroke();

      doc
        .rect(250, yOffset, 100, 20)
        .stroke();

      doc
        .rect(350, yOffset, 100, 20)
        .stroke();

      // Add content
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(productName, 55, yOffset + 5) // Adjusted x-coordinate
        .text(quantity.toString(), 255, yOffset + 5)
        .text(totalPrice.toString(), 355, yOffset + 5);

      // Draw table row borders
      doc
        .moveTo(50, yOffset + 20)
        .lineTo(200, yOffset + 20)
        .stroke();

      doc
        .moveTo(250, yOffset + 20)
        .lineTo(350, yOffset + 20)
        .stroke();

      doc
        .moveTo(350, yOffset + 20)
        .lineTo(450, yOffset + 20)
        .stroke();

      yOffset += 20;
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const logout = (req, res) => {
  req.session.admin = null;
  res.redirect("/admin")
}




const adminRouter = {
  login, loginPost, adminDashboard, usersearch,
  ordermanagement, orderstatus, returnOrders, returnApprove, returnReject,
  reports, monthPdf, generatePDFReportYear, generatePDFReportDate,
  generateExcelReportMonth, yearaleexcellreport, editImageDelete, saleReportWeek, logout
}
module.exports = adminRouter
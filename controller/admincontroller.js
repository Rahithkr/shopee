const express = require("express");
const router = express.Router();
const userCollection = require("../models/mongoose");
const productCollection = require("../models/product")
const category = require("../models/category")
const couponCollection = require("../models/coupon")
const returnCollection = require("../models/returnstatus")
const multer = require("multer");
const bannerCollection = require("../models/banner");
const excel = require('exceljs')
const brandCollection = require("../models/brand")
const pdfkit = require('pdfkit')
const dotenv=require('dotenv').config();

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



const loginPost = (req, res) => {


  if(req.body.email==process.env.ADEMAIL&&req.body.password==process.env.ADPASSWORD){
   
    res.render("admin/admindashboard")
}
else{
  res.redirect("/admin/admin")
  
}
}


const admindashboard = (req, res) => {
  res.render('admin/admindashboard')
}


const usermanagement = async (req, res) => {
  try {

    const user = await userCollection.find()
    res.render("admin/usermanagement", { user })

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}





// editing the user
const edituser = (req, res) => {
  let id = req.params.id;
  userCollection.findById(id)
    .then(user => {
      if (!user) {
        res.redirect('/admin/usermanagement')
      } else {
        res.render('admin/edit_user', { user: user })
      }
    })
    .catch(err => {
      console.log("Error in finding the user : ", err);
      res.redirect('/admin')
    })
}



// updating the user
const updateuser = async (req, res) => {
  try {
    let id = req.params.id
    const result = await userCollection.findByIdAndUpdate(id, {
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      mobile: req.body.mobile,
    })
    if (!result) {
      res.json({ message: 'User not found', type: 'danger' })
    } else {
      req.session.message = {
        type: 'success',
        message: 'User updated sucessfully'
      }
      res.redirect('/admin/usermanagement')
    }
  } catch (err) {
    console.log('Error updating the user : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}



// delete user
// router.get('/usermanagement/delete/:id', async (req, res) => {
//     try {
//       const id = req.params.id;
//       const result = await userCollection.findByIdAndRemove({_id: id});

//       if (result) {
//         req.session.message1 = {
//           type: 'success',
//           message: 'User deleted successfully',

//         }
//         res.redirect('/admin/usermanagement');
//       } else {
//         res.json({ message: 'User not found' });
//       }

//     } catch (err) {
//       console.error('Error deleting user: ', err);
//       res.json({ message: err.message });
//     }
//   });




const blockuser = async (req, res) => {
  const id = req.params.id;
  try {
    await userCollection.findByIdAndUpdate({ _id: id }, { blocked: true });
    res.redirect('/admin/usermanagement');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error blocking user');
  }

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



const unblockuser = async (req, res) => {
  const id = req.params.id;
  try {
    await userCollection.findByIdAndUpdate({ _id: id }, { blocked: false });
    res.redirect('/admin/usermanagement');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error unblocking user');
  }



}


const productmanagement = (req, res) => {
  const errorMessage = req.query.error
  res.render("admin/productmanagement", { errorMessage })
}


// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: storage });

const productadd = async (req, res) => {
  const productName = req.body.name

  existProduct = await productCollection.findOne({ name: productName })

  if (existProduct) {

    const errorMessage = "product is already exist"


    res.redirect(`/admin/productmanagement?error=${encodeURIComponent(errorMessage)}`)
  }
  else {
    try {

      const productData = {
        name: req.body.name,
        description: req.body.description,
        // image: req.file.filename,
        image: req.files.map(file => file.filename),
        price: req.body.price,
        brand: req.body.brand,
        category: req.body.category,
        stock: req.body.stock
      };
      console.log("req.file:", req.file);
      //   const imagePath = req.file.path;
      await productCollection.insertMany([productData])
      res.redirect('/admin/productdetails')
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error"); // Handle the error appropriately
    }

  }

}



const ITEMS_PER_PAGE = 6; // Define the number of items to display per page

const productlists = async (req, res) => {
  const page = +req.query.page || 1; // Get the current page from the query parameter

  const totalProducts = await productCollection.countDocuments();
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const categories = await category.find();

  const product = await productCollection
    .find({})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .exec();

  res.render('admin/productdetails', { product, categories, currentPage: page, totalPages, ITEMS_PER_PAGE });
};






// editing the product
const productedit = (req, res) => {
  let id = req.params.id;

  productCollection.findById(id)
    .then(product => {
      if (!product) {
        res.redirect('/admin/productdetails')
      } else {
        res.render('admin/edit_products', { product: product })
      }
    })
    .catch(err => {
      console.log("Error in finding the product : ", err);
      res.redirect('/admin')
    })
}









const deleteimg = async (req, res) => {


  try {
    const id = req.params.id;
    const filename = req.params.filename;

    // Find the product in the database
    const product = await productCollection.findById(id);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove the image from the product's image array
    const index = product.image.indexOf(filename);
    if (index > -1) {
      product.image.splice(index, 1);
    }

    // Save the updated product to the database
    await product.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.log('Error deleting the image: ', err);
    res.status(500).json({ message: err.message });
  }
};








// updating the product
const updateproduct = async (req, res) => {
  try {

    let id = req.params.id
    const deletedImages = req.body.deletedImages



    if (req.files.length === 0) {

      const oldProduct = await productCollection.findById(id);


      const existingImages = oldProduct.image || [];


      const result = await productCollection.findByIdAndUpdate(id, {
        name: req.body.name,
        category: req.body.category,
        image: existingImages,
        price: req.body.price,
        brand: req.body.brand,
        stock: req.body.stock,
        description: req.body.description,
      })
      const updatedProduct = await productCollection.findByIdAndUpdate(
        id,
        { $pull: { image: req.body.deletedImage } },
        { new: true } // Return the updated document
      );
      if (!result) {
        res.json({ message: 'product not found', type: 'danger' })
      } else {
        req.session.message = {
          type: 'success',
          message: 'product updated sucessfully'
        }
        res.redirect('/admin/productdetails')
      }


    } else {


      const result = await productCollection.findByIdAndUpdate(id, {
        name: req.body.name,
        category: req.body.category,
        image: req.files.map(file => file.filename),
        price: req.body.price,
        stock: req.body.stock,
        description: req.body.description,
      })
      if (!result) {
        res.json({ message: 'product not found', type: 'danger' })
      } else {
        req.session.message = {
          type: 'success',
          message: 'product updated sucessfully'
        }
        res.redirect('/admin/productdetails')
      }
    }


  } catch (err) {
    console.log('Error updating the product : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}


// products delete
const productdelete = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await productCollection.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'product deleted successfully',

      }
      res.redirect('/admin/productdetails');
    } else {
      res.json({ message: 'product not found' });
    }

  } catch (err) {
    console.error('Error deleting product: ', err);
    res.json({ message: err.message });
  }
};




const addcategory = (req, res) => {
  const errorMessage = req.query.error
  res.render("admin/addcategory", { errorMessage })
}





const addcategorypost = async (req, res) => {
  const categoryName = req.body.category.toLowerCase();
  try {

    const existCategory = await category.findOne({ category: { $regex: new RegExp('^' + categoryName + '$', 'i') } });

    if (existCategory) {
      const errorMessage = "Category already exists";
      return res.redirect(`/admin/addcategory?error=${encodeURIComponent(errorMessage)}`);
    } else {
      const categoryData = {
        category: req.body.category,
        description: req.body.description,
      };

      await category.insertMany([categoryData]);
      return res.redirect("/admin/addcategory");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred");
  }
};


const ITEM_PER_PAGE = 2;

const categorylist = async (req, res) => {
  try {
    const page = +req.query.page || 1;

    const totalProducts = await category.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEM_PER_PAGE);

    const categories = await category
      .find({})
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE)
      .exec();

    res.render("admin/categorylist", { categories, currentPage: page, totalPages, ITEM_PER_PAGE });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




// const ITEM_PER_PAGE = 2;
// const categorylist=async(req,res)=>{
//   const page = +req.query.page || 1; // Get the current page from the query parameter


//   const totalProducts = await category.countDocuments();

//   const totalPages = Math.ceil(totalProducts / ITEM_PER_PAGE);


//   const categories = await category
//   .find({})
//   .skip((page - 1) * ITEM_PER_PAGE)
//   .limit(ITEM_PER_PAGE)
//   .exec();


//   // const categories = await category.find()
//   res.render("admin/categorylist",{categories,currentPage: page, totalPages})
// }



// editing the product
const categoryedit = (req, res) => {
  let id = req.params.id;
  category.findById(id)
    .then(categories => {
      if (!categories) {
        res.redirect('/admin/categorylist')
      } else {
        res.render('admin/edit_category', { categories: categories })
      }
    })
    .catch(err => {
      console.log("Error in finding the product : ", err);
      res.redirect('/admin')
    })
}



// updating the product
const updatecategory = async (req, res) => {
  try {
    let id = req.params.id
    const result = await category.findByIdAndUpdate(id, {

      category: req.body.category,
      description: req.body.description,
    })
    if (!result) {
      res.json({ message: 'category not found', type: 'danger' })
    } else {
      req.session.message = {
        type: 'success',
        message: 'category updated sucessfully'
      }
      res.redirect('/admin/categorylist')
    }
  } catch (err) {
    console.log('Error updating the product : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}




// products delete
const categorydelete = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await category.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'category deleted successfully',

      }
      res.redirect('/admin/categorylist');
    } else {
      res.json({ message: 'category not found' });
    }

  } catch (err) {
    console.error('Error deleting category: ', err);
    res.json({ message: err.message });
  }
};


const ordermanagement = async (req, res) => {

  const orders = await userCollection.aggregate([{ $unwind: "$orders" }, {
    $project: {
      productName: "$orders.name",
      category: "$orders.category",
      quantity: "$orders.quantity",
      price: "$orders.price",
      image: "$orders.image",
      userId: "$orders.userId",
      id: "$orders._id",
      status: "$orders.status",



    }
  }])


  res.render("admin/ordermanagement", { orders })

}


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
const addcouponget = (req, res) => {
  res.render("admin/couponmanagement")
}


const addcouponpost = async (req, res) => {
  try {
    const couponData = {
      code: req.body.code,
      discount: req.body.discount,
      minValue: req.body.minValue,
      description: req.body.description,
    };

    const newCoupon = await couponCollection.create(couponData);

    if (newCoupon) {
      res.redirect("/admin/couponlist");
      // Or send a success message or status if required
    } else {
      // Handle the case if the newCoupon is not created
      res.redirect("/admin/couponmanagement");
      // Or redirect to an error page
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    res.status(500).redirect('/500');
  }
};

const couponlist = async (req, res) => {

  const coupon = await couponCollection.find()
  res.render("admin/couponlist", { coupon })
}

const couponedit = (req, res) => {
  let id = req.params.id;
  couponCollection.findById(id)
    .then(coupon => {
      if (!coupon) {
        res.redirect('/admin/couponlist')
      } else {
        res.render('admin/edit_coupon', { coupon: coupon })
      }
    })
    .catch(err => {
      console.log("Error in finding the product : ", err);
      res.redirect('/admin')
    })
}

const updatecoupon = async (req, res) => {
  try {
    let id = req.params.id
    const result = await couponCollection.findByIdAndUpdate(id, {

      code: req.body.code,
      discount: req.body.discount,
      minValue: req.body.minValue,
      description: req.body.description,
    })
    if (!result) {
      res.json({ message: 'coupon not found', type: 'danger' })
    } else {
      req.session.message = {
        type: 'success',
        message: 'category updated sucessfully'
      }
      res.redirect('/admin/couponlist')
    }
  } catch (err) {
    console.log('Error updating the product : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}

const deletecoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await couponCollection.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'coupon deleted successfully',

      }
      res.redirect('/admin/couponlist');
    } else {
      res.json({ message: 'coupon not found' });
    }

  } catch (err) {
    console.error('Error deleting coupon: ', err);
    res.json({ message: err.message });
  }
};


const returnorders = async (req, res) => {
  const returndata = await returnCollection.find()

  res.render("admin/return", { returndata })

}

const returnapprove = async (req, res) => {
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

  await returnCollection.deleteOne({ cartid: cartid })

  res.redirect('/admin/returnorder')

}

const returnreject = async (req, res) => {
  const { id, user, price, qty, pname, cartid } = req.query;
  const status = 'return rejected'


  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": cartid },

    { $set: { "orders.$.status": status } },
    { new: true })

  await returnCollection.deleteOne({ cartid: cartid })


  res.redirect('/admin/returnorder')
}

const addbanner = (req, res) => {
  res.render("admin/bannermanagement")
}


const storages = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
  },
});
const uploads = multer({ storage: storages });

const addbannerpost = async (req, res) => {
  try {
    bannerData = {
      description: req.body.description,
      image: req.files.map(file => file.filename),
    }

    await bannerCollection.insertMany([bannerData])
    res.redirect("/admin/bannerlist")
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}

const bannerlist = async (req, res) => {
  try {

    const banner = await bannerCollection.find()
    res.render("admin/bannerlist", { banner })
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}


// products delete
const bannerdelete = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await bannerCollection.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'banner deleted successfully',

      }
      res.redirect('/admin/bannerlist');
    } else {
      res.json({ message: 'product not found' });
    }

  } catch (err) {
    console.error('Error deleting product: ', err);
    res.json({ message: err.message });
  }
};








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


const addbrandget = async (req, res) => {
  res.render("admin/addbrand")
}

const addbrandpost = async (req, res) => {

  const data = {
    brand: req.body.brand,
    description: req.body.description
  }

  await brandCollection.insertMany(data)

  res.redirect("/admin/brandlist")
}




const brandlist = async (req, res) => {
  try {

    const brand = await brandCollection.find()
    res.render("admin/brandlist", { brand })
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}






const branddelete = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await brandCollection.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'brand deleted successfully',

      }
      res.redirect('/admin/brandlist');
    } else {
      res.json({ message: 'brand not found' });
    }

  } catch (err) {
    console.error('Error deleting brand: ', err);
    res.json({ message: err.message });
  }
};




const editimagedelete = async (req, res) => {
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

const salereportweek = async (req, res) => {
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





const monthpdf = async (req, res) => {

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







const adminRouter = {
  login, loginPost, admindashboard, usermanagement, edituser, updateuser, blockuser, usersearch,
  unblockuser, productmanagement, productadd, productlists, productedit, updateproduct, productdelete, addcategory, addcategorypost,
  categorylist, categoryedit, updatecategory, categorydelete, ordermanagement, orderstatus, addcouponget, addcouponpost, couponlist,
  couponedit, updatecoupon, deletecoupon, returnorders, returnapprove, returnreject, addbanner, addbannerpost, bannerlist, bannerdelete,
  reports, monthpdf, generatePDFReportYear, generatePDFReportDate,
  generateExcelReportMonth, yearaleexcellreport, addbrandget, addbrandpost, brandlist, branddelete, editimagedelete, salereportweek
}
module.exports = adminRouter
const express = require("express");
const router = express.Router();
const easyinvoice = require('easyinvoice');
const userCollection = require("../models/mongoose");
const { log } = require("console");
const nodemailer = require("nodemailer");
const generateOtp = require("generate-otp");
const otpGenerator = require("otp-generator");
const productCollection = require("../models/product");
const couponCollection = require("../models/coupon")
const Razorpay = require('razorpay');
const { render } = require("ejs");
const returnCollection = require("../models/returnstatus");
const bannerCollection = require("../models/banner")
const categoryCollection = require("../models/category");
const brandCollection = require("../models/brand");
const category = require("../models/category");


const razorpay = new Razorpay({
  key_id: "rzp_test_s3i2foc9AExQlF",
  key_secret: "v1RU4mlsH0Nqv4ARqyAj78sL"
})
let otp;
let user = false
let userData;
let transporter;
let newPassword;
let email;


function sentOtp (otp,email){

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testtdemoo11111@gmail.com',
      pass: 'wikvaxsgqyebphvh',
    },
  });

  const mailOptions = {
    from: "rahithkr3@gmail.com",
    to: "rahithkr3@gmail.com",
    subject: "Your OTP code",
    text: `Your OTP code is:${otp}`
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP:', error);
    } else {
      console.log('OTP sent:', info.response);

    }
  });

}



const login = async (req, res) => {
  try {
    const error = '';
    if (req.session.userId) {
      res.redirect('/')
    } else {

      res.render("user/login", { error })
    }
  } catch (error) {
    console.error(error)
    res.send('hii')
  }
}
const signup = async (req, res) => {
  try {


    if (req.session.userId) {
      res.redirect('/')
    } else {
      const errorMessage = req.query.error
      res.render("user/signup", { errorMessage })
    }
  }
  catch (error) {
    console.error(error)
    res.send("hii")
  }
}

const signupPost = async (req, res) => {
  try {
    const check = await userCollection.findOne({ email: req.body.email })
    if (check) {
      const errorMessage = 'Email already exist'
      res.redirect(`/user/signup?error=${encodeURIComponent(errorMessage)}`)

    }
    else {

      user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        mobile: req.body.mobile,
      }


      otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });

      sentOtp (otp,user.email)


      // transporter = nodemailer.createTransport({
      //   service: 'gmail',
      //   auth: {
      //     user: 'testtdemoo11111@gmail.com',
      //     pass: 'wikvaxsgqyebphvh',
      //   },
      // });

      // const mailOptions = {
      //   from: "rahithkr3@gmail.com",
      //   to: "rahithkr3@gmail.com",
      //   subject: "Your OTP code",
      //   text: `Your OTP code is:${otp}`
      // };


      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.error('Error sending OTP:', error);
      //   } else {
      //     console.log('OTP sent:', info.response);

      //   }
      // });







      res.redirect("/user/otp")
    }
  } catch (error) {
    console.error(error)
    res.send("hii")
  }
}

const newOtp = async (req, res) => {
  try {


    otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });


    sentOtp (otp)

    // console.log(otp)

    // const mailOptions = {
    //   from: "rahithkr3@gmail.com",
    //   to: "rahithkr3@gmail.com",
    //   subject: "Your OTP code",
    //   text: `Your OTP code is:${otp}`
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error('Error sending OTP:', error);
    //   } else {
    //     console.log('OTP sent:', info.response);
    //     // Store the OTP and user's email in your database for verification
    //   }
    // });


    res.redirect("/user/otp")
  }


  catch (error) {
    console.error(error)
    res.send("hii")
  }
}







const getOtp = async (req, res) => {
  try {

    res.render("user/otp");
  }
  catch (error) {
    console.error(error)
    res.send("hii")
  }
}




const passOtp = (req, res) => {
  const check = req.session.check
  console.log(check);
  res.render("user/passotp");
}


const otpPost = async (req, res) => {
  try {

    const enteredOtp = req.body.otp;
    console.log(enteredOtp)
    console.log(otp)
    if (otp == enteredOtp) {
      console.log("completed")
      await userCollection.insertMany([user]);

      res.redirect("/user/login")
      // res.send("done")
    }
    else {
      res.redirect("/user/otp")
      // res.send("fail")
    }
  }
  catch (error) {
    console.error(error);
    // Handle any errors that occurred during the database query
    res.status(500).send("Internal server error");
  }


}





const loginPost = async (req, res) => {
  try {
    const check = await userCollection.findOne({ email: req.body.email, password: req.body.password });
    if (check) {
      if (check && check.password === req.body.password) {
        req.session.userId = check._id.toString();
        console.log("Login successful. User ID:", req.session.userId);
        const isUserBlocked1 = await userCollection.findOne({ _id: req.session.userId }, { blocked: 1 })
        const isUserBlocked = isUserBlocked1.blocked

        if (isUserBlocked == false) {
          console.log("Login successful. User ID:", req.session.userId);
          res.redirect("/");
        }
        else {
          res.render('user/login')
        }


      } else {
        // Prepare  error messages for email and password
        res.render("user/login", { error: "Invalid Password" })
      }
    } else {
      res.render("user/login", { error: "Email not found" })
    }


  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};



const forgotPass = (req, res) => {
  res.render("user/forgotpass")
}

const forgotPassPost = async (req, res) => {
  try {
    email = req.body.email

    const check = await userCollection.findOne({ email: req.body.email });
    req.session.check = check

    if (check.email == req.body.email) {


      otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });

      sentOtp (otp)
      // transporter = nodemailer.createTransport({
      //   service: 'gmail',
      //   auth: {
      //     user: 'testtdemoo11111@gmail.com',
      //     pass: 'wikvaxsgqyebphvh',
      //   },
      // }); const mailOptions = {
      //   from: "rahithkr3@gmail.com",
      //   to: "rahithkr3@gmail.com",
      //   subject: "Your OTP code",
      //   text: `Your OTP code is:${otp}`
      // };


      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.error('Error sending OTP:', error);
      //   } else {
      //     console.log('OTP sent:', info.response);
      //     // Store the OTP and user's email in your database for verification
      //   }
      // });
      res.redirect("/user/passotp")



    }
    else {
      // Handle login failure, e.g., show an error message
      res.send("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    // Handle any errors that occurred during the database query
    res.status(500).send("Internal server error");

  }

}



const newPassOtp = (req, res) => {
  try {

    otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });
    sentOtp (otp)

    // const mailOptions = {
    //   from: "rahithkr3@gmail.com",
    //   to: "rahithkr3@gmail.com",
    //   subject: "Your OTP code",
    //   text: `Your OTP code is:${otp}`
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error('Error sending OTP:', error);
    //   } else {
    //     console.log('OTP sent:', info.response);
    //     // Store the OTP and user's email in your database for verification
    //   }
    // });


    res.redirect("/user/passotp")

  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server error");
  }
}



const reOtp = (req, res) => {
  res.render("user/otp");
}




const repassotp = (req, res) => {
  const check = req.session.check
  console.log(check);
  res.render("user/passotp");
}

const repassotppost = async (req, res) => {
  try {

    const enterOtp = req.body.otp;
    console.log(enterOtp)
    console.log(otp)
    if (otp == enterOtp) {
      console.log("completed")


      res.render("user/newpass")
      //  res.send("done")
    }
    else {
      res.redirect("/user/passotp")
      // res.send("fail")
    }
  }
  catch (error) {
    console.error(error);
    // Handle any errors that occurred during the database query


    res.status(500).send("Internal server error");
  }


}


const renewpass = (req, res) => {
  res.render("user/newpass")
}
const renewpasspost = async (req, res) => {
  try {
    console.log(email)
    newPassword = req.body.password
    await userCollection.updateOne({ email: email }, { $set: { password: newPassword } })
    res.redirect('/user/login')

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}


const productpage = async (req, res) => {

  const id = req.params.id;

  const product = await productCollection.findOne({ _id: id });
  if (req.session.userId) {

    res.render("user/productpage", { user, product })
  } else {

    res.redirect("/user/login")
  }
}




const productlist = async (req, res) => {

  const category = await categoryCollection.find();
  const brand = await brandCollection.find();

  const productsPerPage = 4;
  const currentPage = parseInt(req.query.page) || 1;

  const product = await productCollection.find();

  const totalProducts = product.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = product.slice(start, end);

  res.render('user/productlists', {
    product: paginatedProducts,
    currentPage: currentPage,
    totalPages: totalPages,
    category,
    brand,
  });
};







const home = async (req, res) => {

  const user1 = req.session.userId
  const product = await productCollection.find();
  const banner = await bannerCollection.find();
  const categorydata = await category.find()
  const brand=await brandCollection.find()


  // Set up pagination data
  const page = parseInt(req.query.page) || 1;
  const perPage = 4; // Number of products per page
  const totalProducts = product.length;
  const totalPages = Math.ceil(totalProducts / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedProducts = product.slice(startIndex, startIndex + perPage);

  res.render('user/index', {
    product: paginatedProducts,
    totalPages,
    currentPage: page,
    user1,
    banner, categorydata,brand
  });
};




const logout = (req, res) => {
  req.session.userId = null;
  res.redirect("/user/login")

}







// profile render
const profile = async (req, res) => {
  const userId = req.session.userId;
  try {

    const user = await userCollection.findOne({ _id: userId });


    res.render("user/profile", { user });
  }



  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }
};


let addressData;
const profileaddaddress = async (req, res) => {
  const userId = req.session.userId;
  const users = await userCollection.findOne({ _id: userId })

  res.render("user/addaddress", { users })
}

const profileaddaddresspost = async (req, res) => {


  try {
    const filter = { email: req.body.email }
    addressData = {
      address: [{

        fulladdress: req.body.fulladdress,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        mobile: req.body.mobile,
        pincode: req.body.pincode,
      }]
    }
    const option = { upsert: true };

    await userCollection.updateOne(filter, addressData, option)
    res.redirect("/user/profile/showaddress");

  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}

const profileshowaddress = async (req, res) => {
  const userId = req.session.userId;


  const useraddress = await userCollection.findOne({ _id: userId })
  const userData = useraddress.address;




  res.render("user/showaddress", { userData, useraddress })
}







const editprofile = async (req, res) => {


  let id = req.params.id;
  userCollection.findById(id)
    .then(user => {
      if (!user) {
        res.redirect('/user/profile')
      } else {
        res.render('user/editprofile', { user: user })
      }
    })
    .catch(err => {
      console.log("Error in finding the user : ", err);
      res.redirect('/user/profile')
    })
}

// updating the user
const editprofilepost = async (req, res) => {
  try {
    let id = req.params.id
    const result = await userCollection.findByIdAndUpdate(id, {
      name: req.body.name,

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
      res.redirect('/user/profile')
    }
  } catch (err) {
    console.log('Error updating the user : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}

const updateprofile = async (req, res) => {
  try {
    let id = req.params.id
    const result = await userCollection.findByIdAndUpdate(id, {
      name: req.body.name,

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
      res.redirect('/user/profile')
    }
  } catch (err) {
    console.log('Error updating the user : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}





const profileaddresseditget = async (req, res) => {

  const userId = req.session.userId;


  const userDataa = await userCollection.findOne({ _id: userId })


  res.render("user/profileeditaddress", { userDataa })
}

const profileaddressedit = async (req, res) => {


  try {
    const filterr = { email: req.body.email }
    addressDetails = {
      address: [{

        fulladdress: req.body.fulladdress,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        mobile: req.body.mobile,
        pincode: req.body.pincode,
      }]
    }
    const options = { upsert: true };

    await userCollection.updateOne(filterr, addressDetails, options)
    res.redirect("/user/profile/showaddress")

  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}


const profileaddressdeletepost = async (req, res) => {
  try {
    const userId = req.session.userId
    const addressId = req.params.id;

    const resultd = await userCollection.findOneAndUpdate(
      { _id: userId },
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    if (resultd) {


      res.redirect('/user/profile/showaddress');
    } else {
      console.log("error")
    }

  } catch (err) {
    console.error('Error deleting address: ', err);
    res.json({ message: err.message });
  }
};













const orderstatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await userCollection.findOne({ _id: userId });

    const ITEM_PER_PAGE = 3;
    const page = +req.query.page || 1;

    // Sort orders by date in descending order
    user.orders.sort((a, b) => b.date - a.date);

    const totalOrders = user.orders.length;
    const totalPages = Math.ceil(totalOrders / ITEM_PER_PAGE);

    // Use slice to get the orders for the current page
    const orders = user.orders.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE);

    res.render("user/orderstatus", { user, orders, currentPage: page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};






const ordercancel = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId;
  const user = await userCollection.findOne({ _id: userId })
  // const orderqt= user.orders[0].quantity;
  const canceledOrder = user.orders.find((order) => order._id.toString() === id);
  const canceledQuantities = canceledOrder.quantity;
  const canceledProductIds = canceledOrder.productId;
  const price = canceledOrder.price
  const pname = canceledOrder.name

  const wallettotal1 = await userCollection.findOne({ _id: userId }, { wallet: 1 })
  const wallettotal = wallettotal1.wallet.total

  const returnamount1 = price * canceledQuantities
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

  await userCollection.updateOne({ _id: userId }, { $set: { 'wallet.total': returnamount } })










  // const existingqty = user.orders.find((item) => item.orders._id ===id);

  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": id },
    { $set: { "orders.$.status": "cancelled" } },
    { new: true })


  if (canceledProductIds) {
    const product = await productCollection.findOne({ _id: canceledProductIds });
    product.stock += canceledQuantities;


    await product.save();
  }

  if (updatestatus) (

    res.redirect("/profile/orderstatus")
  )


}


const removeproduct = async (req, res) => {
  const id = req.params.id;



  const updateStatus = await userCollection.findOneAndUpdate(
    { "cart.items._id": id }, // Match the item within the cart with the specified _id
    { $pull: { "cart.items": { _id: id } } }, // Remove the item from the cart.items array
    { new: true }
  );
  if (updateStatus) (

    res.redirect("/user/cart")
  )


}


const cartid = async (req, res) => {

  const id = req.params.id;
  let userId = req.session.userId;
  try {
    const user = await userCollection.findOne({ _id: userId }, { 'cart.items': 1 })


    let product = await productCollection.findOne({ _id: id });

    const productData = {
      name: product.name,
      description: product.description,
      image: product.image[0],
      category: product.category,
      productId: product._id,
      price: product.price,
      stock: product.stock,
      userId: userId


    }

    const existingCartItem = user.cart.items.find(item => item.productId.toString() === id);
    if (!existingCartItem) {


      const result = await userCollection.findOneAndUpdate({ _id: userId }, { $push: { "cart.items": [productData] } });
      res.redirect(`/user/productpage/${id}`);
    }
    else {

      res.redirect("/user/cart")


    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }



};






const productedit = async (req, res) => {

  const cartid = req.params.cartid;
  const newQuantity = parseInt(req.params.count);
  const productId = req.params.productId;
  const userId = req.session.userId
  const cartqty = await userCollection.findOne({ _id: userId }, { "cart.items": 1 })
  // const cartQuantity=cartqty.
  const cartquantity = cartqty.cart.items

  const cartQuantity = cartquantity.map((cart) => {
    return cart.quantity
  });

  const resultqty = parseInt(cartQuantity.join(''));


  try {
    const stockqty = await productCollection.findOne({ _id: productId })

    let stockUpdate = stockqty.stock

    if (resultqty > newQuantity) {
      stockqty.stock += 1;
      await stockqty.save();
    } else {
      stockqty.stock -= 1;
      await stockqty.save();
    }
    if (newQuantity > stockUpdate) {
      console.log('out of stock');

      const errorMessage = 'Out of Stock';
      return res.redirect('/user/cart', { cartData });
    } else {
      console.log('valid stock')
    }
    const result = await userCollection.findOneAndUpdate(
      {
        _id: userId,
        "cart.items._id": cartid,
      },
      {
        $set: { "cart.items.$.quantity": newQuantity },
      }
    );



    if (result) {

      console.log("Quantity updated successfully.");
      res.sendStatus(200);
    } else {
      console.log("Cart item not found.");
      res.sendStatus(404);
    }


  } catch (error) {
    console.error("Error updating quantity:", error);
    res.sendStatus(500);
  }
};





const cart = async (req, res) => {
  const userId = req.session.userId;


  try {

    const userData = await userCollection.findOne({ _id: userId }, { cart: 1, _id: 1 });

    if (userData) {
      const cartData = userData.cart;
      const userId = userData.id


      // Calculate the total price
      const totalPrice = cartData.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // Update the user's cart with the total price
      const result = await userCollection.findOneAndUpdate(
        { _id: userId },
        {
          'cart.totalPrice': totalPrice
        }

      );
      const errorMessage = ""
      res.render("user/cart", { cartData, userId, totalPrice, errorMessage });
    } else {
      // Handle the case where user data is not found.
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).send("Error fetching cart data");
  }


};

const checkout = async (req, res) => {
  const userId = req.session.userId;
  const coupons = await couponCollection.find()

  const userData1 = await userCollection.findOne({ _id: userId })

  const userData = userData1.address
  const userData2 = await userCollection.findOne({ _id: userId }, { cart: 1, _id: 1 });
  const totalPrice = userData2.cart.totalPrice;
  res.render("user/checkout", { userData, totalPrice, userData2, coupons })
}


const checkoutaddaddress = async (req, res) => {
  try {
    const filter = { email: req.body.email };
    const newAddress = {
      street: req.body.street,
      city: req.body.city,
      fulladdress: req.body.fulladdress,
      state: req.body.state,
      mobile: req.body.mobile,
      pincode: req.body.pincode,

    };
    const update = {
      $push: {
        'address': newAddress // Use the $push operator to add the new address to the array
      }
    };

    const options = { upsert: true };
    await userCollection.updateOne(filter, update, options);

    res.redirect("/user/checkout");
  } catch (error) {
    console.log("Address data error:", error);
    // Handle the error and send an error response
  }
};




const editaddress = async (req, res) => {

  const userId = req.session.userId;


  const userDataa = await userCollection.findOne({ _id: userId })


  res.render("user/edit_address", { userDataa })
}


const editaddresspost = async (req, res) => {


  try {
    const filterr = { email: req.body.email }
    addressDataa = {
      address: [{

        fulladdress: req.body.fulladdress,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        mobile: req.body.mobile,
        pincode: req.body.pincode,
      }]
    }
    const options = { upsert: true };

    await userCollection.updateOne(filterr, addressDataa, options)
    res.redirect("/user/checkout")

  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }


}








const addressdeletepost = async (req, res) => {
  try {
    const userId = req.session.userId
    const addressId = req.params.id;

    const result = await userCollection.findOneAndUpdate(
      { _id: userId },
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    if (result) {


      res.redirect('/user/checkout');
    } else {
      console.log("error")
    }

  } catch (err) {
    console.error('Error deleting address: ', err);
    res.json({ message: err.message });
  }
};

// ---------------------------cod--------------------

const confirmorder = async (req, res) => {


  const data = req.query.data

  const parsedData = JSON.parse(data);

  const userId = req.session.userId;
  const address = req.query.address
  req.session.address = address ? address : null
  const addressObj = JSON.parse(address);

  const payment = "cod"



  try {
    // Fetch user data and cart dat
    const userData3 = await userCollection.findOne({ _id: userId });
    const userData2 = await userCollection.findOne({ _id: userId }, { 'cart.items': 1, _id: 0 });



    const paymentmethod = 'cod';

    const user = await userCollection.findOne({ _id: userId });

    if (user) {

      let orders = [];

      for (const item of parsedData.cartItems) {
        const orderItem = {
          userId: userId,
          quantity: item.quantity,
          paymentmethod: paymentmethod,
          price: item.price,
          name: item.name,
          image: item.image,
          category: item.category,
          address: [{
            street: addressObj.street,
            city: addressObj.city,
            fulladdress: addressObj.fulladdress,
            mobile: addressObj.mobile,
            state: addressObj.state,
            pincode: addressObj.pincode,
            _id: addressObj._id
          }]
        };

        orders.push(orderItem);
      }



      // Update the user's cart items with the modified item data in the orders field
      await userCollection.updateOne(
        { _id: userId },
        { $push: { orders: { $each: orders } } }
      );
    } else {
      console.log('User not found');
    }

    await userCollection.updateOne(
      { _id: userId },
      { $set: { 'cart.items': [] } }
    );

    res.status(200).json({ userData3, userData2 })

  } catch (error) {
    console.error('Error updating user data:', error);

  }

};


const codThankyou = (req, res) => {
  res.render("user/thankyou")
}


// --------------------------wallet payment-----------------

const walletPayment = async (req, res) => {

  const data = req.query.data


  const parsedData = JSON.parse(data);


  const userId = req.session.userId;
  const address = req.query.address;
  const payment = "wallet"

  const addressObj = JSON.parse(address);


  try {

    const userData2 = await userCollection.findOne({ _id: userId }, { 'cart.items': 1, _id: 0, 'cart.totalPrice': 1 });
    const cartTotal = userData2.cart.totalPrice

    const wallettotal1 = await userCollection.findOne({ _id: userId }, { wallet: 1 })
    const wallettotal = wallettotal1.wallet.total

    if (wallettotal == 0 || cartTotal > wallettotal) {
      res.status(400).json({ message: 'no balance' })
      return
    }

    // Fetch user data and cart dat
    const userData3 = await userCollection.findOne({ _id: userId });


    // Push cart data to the 'orders' array

    const paymentmethod = 'wallet';

    const user = await userCollection.findOne({ _id: userId });

    if (user) {
      let orders = [];

      for (const item of parsedData.cartItems) {
        const orderItem = {
          userId: userId,
          quantity: item.quantity,
          paymentmethod: paymentmethod,
          price: item.price,
          name: item.name,
          image: item.image,
          category: item.category,
          address: [{
            street: addressObj.street,
            city: addressObj.city,
            fulladdress: addressObj.fulladdress,
            mobile: addressObj.mobile,
            state: addressObj.state,
            pincode: addressObj.pincode,
            _id: addressObj._id
          }]
        };

        orders.push(orderItem);
      }



      // Update the user's cart items with the modified item data in the orders field
      await userCollection.updateOne(
        { _id: userId },
        { $push: { orders: { $each: orders } } }
      );
    } else {
      console.log('User not found');
    }



    await userCollection.updateOne(
      { _id: userId },
      { $set: { 'cart.items': [] } }
    );

    const status1 = 'paid';
    const wallethistory = user.cart.items.map(item => {
      const { name: productName, price: amount } = item;
      return { productName, amount, status: status1 };
    });


    // Update the user's wallethistory with the modified data
    await userCollection.updateOne(
      { _id: userId },
      { $push: { 'wallet.wallethistory': { $each: wallethistory } } }
    );



    const newwallettotal = wallettotal - cartTotal

    await userCollection.updateOne({ _id: userId }, { $set: { 'wallet.total': newwallettotal } })

    res.status(200).json({ userData3, userData2 })

  } catch (error) {
    console.error('Error updating user data:', error);

  }
}


const confirmorderget = async (req, res) => {
  const userId = req.session.userId;
  const address = req.body;


  const userData3 = await userCollection.findOne({ _id: userId });
  const userData2 = await userCollection.findOne({ _id: userId }, { 'cart.items': 1, _id: 0 });
  res.render("user/confirmorder", { userData3, userData2 })


}



const razorpayOrder = async (req, res) => {

  try {
    const email = req.session.userId;
    const name = await userCollection.findOne({ email: email }, { _id: 0, name: 1 });

    const totalAmount1 = req.params.a;
    const totalAmount = totalAmount1.replace(/\s/g, '');


    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
    };

    razorpay.orders.create(options, function (err, order) {
      if (err) {
        res.status(500).json({ error: 'Razorpay order creation failed' });
      } else {
        res.status(200).json({ order, name });
      }

    });
  }

  catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// payment done

const paymentDone = async (req, res) => {
  const data = req.query.data


  const parsedData = JSON.parse(data);

  const { razorpay_payment_id } = req.body;

  const paymentDocument = await razorpay.payments.fetch(razorpay_payment_id);

  if (paymentDocument.status === 'captured') {


    const userId = req.session.userId;
    const address = req.query.address;

    req.session.address = address ? address : null
    const addressObj = JSON.parse(address);


    try {
      // Fetch user data and cart dat
      const userData3 = await userCollection.findOne({ _id: userId });
      const userData2 = await userCollection.findOne({ _id: userId }, { 'cart.items': 1, _id: 0 });



      const paymentmethod = 'online';

      const user = await userCollection.findOne({ _id: userId });

      if (user) {

        let orders = [];

        for (const item of parsedData.cartItems) {
          const orderItem = {
            userId: userId,
            quantity: item.quantity,
            paymentmethod: paymentmethod,
            price: item.price,
            name: item.name,
            image: item.image,
            category: item.category,
            address: [{
              street: addressObj.street,
              city: addressObj.city,
              fulladdress: addressObj.fulladdress,
              mobile: addressObj.mobile,
              state: addressObj.state,
              pincode: addressObj.pincode,
              _id: addressObj._id
            }]
          };

          orders.push(orderItem);
        }

        console.log('bbbb', orders);

        // Update the user's cart items with the modified item data in the orders field
        await userCollection.updateOne(
          { _id: userId },
          { $push: { orders: { $each: orders } } }
        );
      } else {
        console.log('User not found');
      }



      await userCollection.updateOne(
        { _id: userId },
        { $set: { 'cart.items': [] } }
      );
      res.render('user/thankyou')
      // res.status(200).json({ userData3, userData2 })

    } catch (error) {
      console.error('Error updating user data:', error);

    }
  } else {
    res.send('Payment failed');
  }
};




const verifyCoupon = async (req, res) => {
  try {
    const { coupenValue, grandtotalValue } = req.body;

    const coupon = await couponCollection.findOne({ code: coupenValue });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid Coupon' });
    }

    const minValue = coupon.minValue;
    const couponID = coupon._id;
    const discount = coupon.discount;

    const total = parseFloat(grandtotalValue);

    const newTotal = Math.floor((discount / 100) * total);
    const total2 = Math.floor(total - newTotal);

    if (total < minValue) {
      return res.status(400).json({ message: 'Minimum amount is needed', minValue });
    }

    const couponExisting = await userCollection.findOne({
      email: req.session.userId,
      'usedCoupons.code': coupenValue,
    });

    if (couponExisting) {
      return res.status(400).json({ message: 'Coupon Already Used' });
    }

    await userData.updateOne(
      { email: req.session.userId },
      {
        $push: {
          usedCoupons: { code: coupenValue, couponId: couponID },
        },
      }
    );

    return res.status(200).json({
      message: 'Coupon Applied',
      data: {
        couponId: couponID,
        discount: discount,
        minValue: minValue,
        newTotal: newTotal,
        total2: total2,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).redirect('/500');
  }
};


const wallet = async (req, res) => {
  const userId = req.session.userId
  const user = await userCollection.findOne({ _id: userId }, { name: 1, email: 1 });
  const userdata = user.name;

  const walletdata = await userCollection.findOne({ _id: userId }, { wallet: 1 })

  res.render("user/wallet", { user, walletdata, userdata })
}

const returnorder = async (req, res) => {

  const user = req.session.userId
  const { productName, price, quantity, paymentmethod, cartid } = req.query;
  const data = { productName, price, quantity, paymentmethod, user, cartid }


  const status = 'return status pending'

  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": cartid },

    { $set: { "orders.$.status": status } },
    { new: true })

  await returnCollection.insertMany([data])
  res.redirect("/profile/orderstatus")

}


// ------------------------coupen-------------------

const verifycoupen = async (req, res) => {

  try {
    const coupenvalue = req.query.coupenvalue
    const grandtotal = req.query.grandtotal
    const userId = req.session.userId


    let newtotal1
    let newtotal

    let discount
    let coupenid
    let minvalue


    const coupendb = await couponCollection.findOne({ code: coupenvalue });



    if (coupendb != null) {
      discount = coupendb.discount;
      // coupenid = coupendb._id
      minvalue = coupendb.minValue
      newtotal1 = (discount / 100) * grandtotal
      newtotal = grandtotal - newtotal1
    }
    else if (coupendb == null) {
      req.session.coupen = ''
      res.status(400).json({ message: 'invalid coupon', discount, grandtotal });
      return;
    }
    else if (req.session.coupen == coupenvalue) {
      res.status(400).json({ message: 'alredy in input', discount, newtotal });
      return;
    }


    const data = {
      isused: 'false',
      code: coupendb.code,
      discount: coupendb.discount,
      minvalue: coupendb.minvalue,
      coupenid: coupendb._id,
      expirydate: coupendb.expirydate,
      discription: coupendb.discription
    }





    const coupenExists = await userCollection.findOne({
      _id: userId,
      'usedcoupens.coupenid': coupenid
    });


    if (coupenExists) {

      req.session.coupen = ''
      res.status(400).json({ message: 'invalid coupon', discount, grandtotal });
      return

    }

    else if (grandtotal < minvalue) {

      res.status(400).json({ message: 'minimum 2000', discount, minvalue });
      return

    }
    else {
      await userCollection.findOneAndUpdate(
        { _id: userId },
        { $push: { coupens: data } },
        { new: true }

      );

      req.session.coupen == coupenvalue



      res.status(200).json({ message: 'coupon matching', discount, coupenid, newtotal });
    }

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// -------------------clear coupen---------------------

const clearcoupen = async (req, res) => {
  req.session.coupen = ''
  const coupenId = req.query.coupenid
  const userId = req.session.userId
  await userCollection.updateOne(
    { _id: userId },
    { $pull: { coupens: { coupenid: coupenId } } }
  );
  res.status(200).json({ message: 'removed' })
}


const wishlistget = async (req, res) => {
  const userId = req.session.userId;
  try {
    const wishdata = await userCollection.findOne({ _id: userId }, { wishlist: 1, _id: 1 });
    const wishlistData = wishdata.wishlist;


    res.render("user/wishlist", { wishlistData })
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }

}


const wishlist = async (req, res) => {

  const id = req.params.id;
  let userId = req.session.userId;
  try {
    const user = await userCollection.findOne({ _id: userId }, { 'wishlist.items': 1 })


    let product = await productCollection.findOne({ _id: id });

    const productData = {
      name: product.name,

      image: product.image[0],

      productId: product._id,
      price: product.price,

      userId: userId,


    }
    const existingCartItem = user.wishlist.items.find(item => item.productId.toString() === id);
    if (!existingCartItem) {


      const result = await userCollection.findOneAndUpdate({ _id: userId }, { $push: { "wishlist.items": [productData] } });
      res.redirect(`/user/productpage/${id}`);
    }
    else {

      res.redirect("/user/wishlist")


    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send('An error ooccurred');
  }



};

const removewishlist = async (req, res) => {
  const id = req.params.id;



  const updateStatuss = await userCollection.findOneAndUpdate(
    { "wishlist.items._id": id }, // Match the item within the cart with the specified _id
    { $pull: { "wishlist.items": { _id: id } } }, // Remove the item from the cart.items array
    { new: true }
  );
  if (updateStatuss) (

    res.redirect("/user/wishlist")
  )


}




const invoice = async (req, res) => {
  try {

    const orderId = req.params.id;

    const email = req.session.userId;



    const userdata = await userCollection.findOne({ _id: email, });

    if (!userdata) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = userdata.orders.find((order) => order._id == orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const address2 = order.address[0]



    const username = userdata.name;
    const address = address2.fulladdress;
    const pincode = address2.pincode;
    const city = address2.city;
    const district = address2.state;
    const productName = order.name;
    const quantity = order.quantity;
    // const total = order.totalPrice
    const price = order.price


    let data = {

      "currency": "INR",
      "taxNotation": "",
      "marginTop": 25,
      "marginRight": 25,
      "marginLeft": 25,
      "marginBottom": 25,
      "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
      "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      "sender": {
        "company": "e_Shopee",
        "address": "e_Shopee tvm",
        "zip": "695501",
        "city": "Trivandrum",
        "country": "India"

      },
      "client": {
        "company": username,
        "address": address,
        "zip": pincode,
        "city": city,
        "country": "India"

      },
      "information": {
        "number": "2021.0001",
        "date": "21-11-2023",
        "due-date": "30-11-2023"
      },
      "products": [
        {
          "product Name": productName,
          "quantity": quantity,
          "description": productName,
          "tax-rate": 0,
          "price": price,
          "Shipping": 40
        },

      ],
      "bottomNotice": "Your invoice for the product",

    };
    console.log('ggg', data);
    res.json(data)

  } catch (error) {
    console.error(error)
    res.redirect('/500')
  }
}


const categorypage = async (req, res) => {

  const categoryname = req.params.id;


  try {

    const categories = await categoryCollection.findOne({ category: categoryname });

    if (!categories) {
      console.log("Category not found");
      return res.redirect("back");
    }

    let categoryProducts;

    if (categories.list) {
      categoryProducts = null;
    } else {
      // Find products in the specified category
      categoryProducts = await productCollection.find({ category: categories });
    }

    // Render the productlists view and pass category and products as variables
    res.render("user/productlists", { product: categories, products: categoryProducts });
  } catch (error) {
    console.error("Error in categorypage:", error);
    res.status(500).send("Internal Server Error");
  }
};

const brandpage = async (req, res) => {
  const brandName = req.params.id;

  try {
    // Correct the variable name from brands to brand
    const category = await categoryCollection.find();
  const brand = await brandCollection.find();

  const productsPerPage = 4;
  const currentPage = parseInt(req.query.page) || 1;

  const product = await productCollection.find();

  const totalProducts = product.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = product.slice(start, end);

    if (!brand || brand.length === 0) {
      console.log("Brand not found");
      return res.redirect("back");
    }

    // Render the productlists view and pass brand and products as variables
    res.render("user/productlists", { product: paginatedProducts,
      currentPage: currentPage,
      totalPages: totalPages,category,brand});
  } catch (error) {
    console.error("Error in brandpage:", error);
    res.status(500).send("Internal Server Error");
  }
};


const userRouter = {
  login, signup, signupPost, newOtp, getOtp, passOtp, otpPost, loginPost, forgotPass, forgotPassPost, newPassOtp,
  reOtp, repassotp, repassotppost, renewpass, renewpasspost, productpage, productlist, home, logout, profile, profileaddaddress, profileaddaddresspost, profileshowaddress,
  editprofile, editprofilepost, updateprofile, orderstatus, ordercancel, removeproduct, cartid, productedit,
  cart, checkout, editaddress, editaddresspost, addressdeletepost, checkoutaddaddress, confirmorder, confirmorderget, razorpayOrder, paymentDone, wallet,
  verifyCoupon, codThankyou, walletPayment, returnorder, verifycoupen, clearcoupen, wishlist, wishlistget, removewishlist, profileaddressedit,
  profileaddresseditget, profileaddressdeletepost, invoice, categorypage,brandpage
}

module.exports = userRouter;
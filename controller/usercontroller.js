const express = require("express");
const router = express.Router();
const easyinvoice = require('easyinvoice');
const userCollection = require("../models/mongoose");
const nodemailer = require("nodemailer");
const generateOtp = require("generate-otp");
const productCollection = require("../models/product");
const couponCollection = require("../models/coupon")
const Razorpay = require('razorpay');
const bannerCollection = require("../models/banner")
const categoryCollection = require("../models/category");
const brandCollection = require("../models/brand");
const category = require("../models/category");
const dotenv = require('dotenv').config()


const razorpay = new Razorpay({
  key_id: process.env.RAZOR_ID,
  key_secret: process.env.RAZOR_SECRET,
})
let otp;
let user = false
let userData;
let transporter;
// let newPassword;
let email;


function sentOtp(otp, email) {

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testtdemoo11111@gmail.com',
      pass: 'wikvaxsgqyebphvh',
    },
  });

  const mailOptions = {
    from: "rahithkr3@gmail.com",
    to: `${email}`,
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
      const email = user.email;
      req.session.email = email;



      otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });

      sentOtp(otp, user.email)




      res.redirect("/user/otp")
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server error");
  }
}

const newOtp = async (req, res) => {
  try {

    const email = req.session.email;
    console.log("22222", email);
    otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });


    sentOtp(otp, email)



    res.redirect("/user/otp")
  }


  catch (error) {
    console.error(error)
    res.status(500).send("Internal server error");
  }
}







const getOtp = async (req, res) => {
  try {

    res.render("user/otp");
  }
  catch (error) {
    console.error(error)
    res.status(500).send("Internal server error");
  }
}




const passOtp = (req, res) => {
  const otp = req.session.otp
  console.log('potp od', otp);
  const check = req.session.check
  console.log('chec i dd', check)
  if(req.session.invalid){
    req.session.invalid = false
    res.render("user/passotp",{message :req.session.errmsg });

  }
  res.render("user/passotp",{message:''});
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
  if (req.session.invalid) {
    req.session.invalid = false
    res.render("user/forgotpass", { message: req.session.errmsg })

  }
  res.render("user/forgotpass", { message: '' })
}

const forgotPassPost = async (req, res) => {
  try {
    const email = req.body.email;

    // Check if the email exists in the database
    const check = await userCollection.findOne({ email });

    if (!check) {
      // User not found
      req.session.invalid = true;
      req.session.errmsg = 'Invalid Email';
      return res.redirect("/user/forgotpass");
      ;
    }

    // Generate OTP and send it to the user
    const otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });
    sentOtp(otp, email);
    console.log('oto is', otp);

    // Store the check result in the session (if needed)
    req.session.check = check;
    req.session.otp = otp

    // Redirect to the OTP verification page
    res.redirect("/user/passotp");
  } catch (error) {
    console.error(error);
    // Handle any errors that occurred during the database query
    res.status(500).send("Internal server error");
  }
};




const newPassOtp = (req, res) => {
  try {
    const email = req.session.check.email
    console.log('check isdf rf r',email);
      otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });
    sentOtp(otp,email)
    req.session.otp = otp
    res.redirect("/user/passotp")

  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server error");
  }
}



const reOtp = (req, res) => {
  res.render("user/otp");
}


const rePassOtpPost = async (req, res) => {
  try {
    const otp = req.session.otp
    const enterOtp = req.body.otp;
    console.log('enterdotp is', enterOtp)
    console.log('otp is', otp)
    // console.log(otp)
    if (otp == enterOtp) {
      console.log("completed")
      res.redirect("/user/newpass")
      //  res.send("done")
    }
    else {
      req.session.invalid = true
      req.session.errmsg = 'Invalid OTP'
      return res.redirect("/user/passotp");
      
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }


}


const renewPass = (req, res) => {
  res.render("user/newpass")
}
const renewPassPost = async (req, res) => {
  try {
    const email = req.session.check.email
    console.log('check is un',email)
    const newPassword = req.body.password
    console.log('body password',newPassword);
    await userCollection.updateOne({ email: email }, { $set: { password: newPassword } })
    res.redirect('/user/login')

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}


const productPage = async (req, res) => {

  const id = req.params.id;

  const product = await productCollection.findOne({ _id: id });
  if (req.session.userId) {

    res.render("user/productpage", { user, product })
  } else {

    res.redirect("/user/login")
  }
}




const productList = async (req, res) => {

  const category = await categoryCollection.find();
  const brand = await brandCollection.find();

  const productsPerPage = 6;
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
  const brand = await brandCollection.find()


  // Set up pagination data
  const page = parseInt(req.query.page) || 1;
  const perPage = 8; // Number of products per page
  const totalProducts = product.length;
  const totalPages = Math.ceil(totalProducts / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedProducts = product.slice(startIndex, startIndex + perPage);

  res.render('user/index', {
    product: paginatedProducts,
    totalPages,
    currentPage: page,
    user1,
    banner, categorydata, brand
  });
};




const logout = (req, res) => {
  req.session.userId = null;
  res.redirect("/user/login")

}







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



// ------------------------coupen-------------------

const verifyCoupen = async (req, res) => {

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

const clearCoupen = async (req, res) => {
  req.session.coupen = ''
  const coupenId = req.query.coupenid
  const userId = req.session.userId
  await userCollection.updateOne(
    { _id: userId },
    { $pull: { coupens: { coupenid: coupenId } } }
  );
  res.status(200).json({ message: 'removed' })
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
      "logo": "",
      "background": "",
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

      information: {
        date: new Date().toLocaleDateString(),
        number: `INV_${order._id}`,
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

    res.json(data)

  } catch (error) {
    console.error(error)
    res.redirect('/500')
  }
}
const categoryPage = async (req, res) => {
  const categoryname = req.params.id;
  const productsPerPage = 4;
  const currentPage = parseInt(req.query.page) || 1;

  try {
    const brand = await brandCollection.find()
    const category = await categoryCollection.findOne({ category: categoryname });

    if (!category) {
      console.log("Category not found");
      return res.redirect("back");
    }

    const products = await productCollection.find({ category: categoryname });
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);

    // Fetch all categories for the dropdown
    const allCategories = await categoryCollection.find();

    // Render the productlists view and pass category and products as variables
    res.render("user/productlists", {
      product: paginatedProducts,
      currentPage: currentPage,
      totalPages: totalPages,
      category: allCategories,
      selectedCategory: category,
      brand: brand,
    });
  } catch (error) {
    console.error("Error in categorypage:", error);
    res.status(500).send("Internal Server Error");
  }
};




const brandPage = async (req, res) => {
  const brandName = req.params.id;

  try {
    const category = await categoryCollection.find();
    const brand = await brandCollection.find();

    const productsPerPage = 4;
    const currentPage = parseInt(req.query.page) || 1;

    // Filter products by brand
    const products = await productCollection.find({ brand: brandName });

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);

    if (!brand || brand.length === 0) {
      console.log("Brand not found");
      return res.redirect("back");
    }

    // Render the productlists view and pass brand and products as variables
    res.render("user/productlists", {
      product: paginatedProducts,
      currentPage: currentPage,
      totalPages: totalPages,
      category,
      brand,
    });
  } catch (error) {
    console.error("Error in brandpage:", error);
    res.status(500).send("Internal Server Error");
  }
};


const userRouter = {
  login, signup, signupPost, newOtp, getOtp, passOtp, otpPost, loginPost, forgotPass, forgotPassPost, newPassOtp,
  reOtp, rePassOtpPost, renewPass, renewPassPost, productPage, productList, home, logout,
  verifyCoupon, verifyCoupen, clearCoupen, invoice, categoryPage, brandPage
}

module.exports = userRouter;
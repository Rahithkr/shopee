const userCollection = require("../models/mongoose");
const couponCollection = require("../models/coupon")
const Razorpay = require('razorpay');
const dotenv = require('dotenv').config()












const checkout = async (req, res) => {
  const userId = req.session.userId;
  const coupons = await couponCollection.find()

  const userData1 = await userCollection.findOne({ _id: userId })

  const userData = userData1.address
  const userData2 = await userCollection.findOne({ _id: userId }, { cart: 1, _id: 1 });
  const totalPrice = userData2.cart.totalPrice;
  res.render("user/checkout", { userData, totalPrice, userData2, coupons })
}


const checkoutAddAddress = async (req, res) => {
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




const editAddress = async (req, res) => {

  const userId = req.session.userId;


  const userDataa = await userCollection.findOne({ _id: userId })


  res.render("user/edit_address", { userDataa })
}


const editAddressPost = async (req, res) => {


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








const addressDeletePost = async (req, res) => {
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





module.exports = {
  checkout, editAddress, editAddressPost, addressDeletePost, checkoutAddAddress,
}
const easyinvoice = require('easyinvoice');
const userCollection = require("../models/mongoose");
const productCollection = require("../models/product");
const returnCollection = require("../models/returnstatus");



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
const profileAddAddress = async (req, res) => {
  const userId = req.session.userId;
  const users = await userCollection.findOne({ _id: userId })

  res.render("user/addaddress", { users })
}

const profileAddAddressPost = async (req, res) => {


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

const profileShowAddress = async (req, res) => {
  const userId = req.session.userId;


  const useraddress = await userCollection.findOne({ _id: userId })
  const userData = useraddress.address;




  res.render("user/showaddress", { userData, useraddress })
}







const editProfile = async (req, res) => {


  const id = req.params.id;
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
const editProfilePost = async (req, res) => {
  try {
    const id = req.params.id
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

const updateProfile = async (req, res) => {
  try {
    const id = req.params.id
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





const profileAddressEditGet = async (req, res) => {

  const userId = req.session.userId;


  const userDataa = await userCollection.findOne({ _id: userId })


  res.render("user/profileeditaddress", { userDataa })
}

const profileAddressEdit = async (req, res) => {


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


const profileAddressDeletePost = async (req, res) => {
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













const orderStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await userCollection.findOne({ _id: userId });

    const ITEM_PER_PAGE = 3;
    const page = +req.query.page || 1;

    // Sort orders by date in descending order
    user.orders.sort((a, b) => a.date - b.date);

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






const orderCancel = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId;
  const user = await userCollection.findOne({ _id: userId })

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



  const updatestatus = await userCollection.findOneAndUpdate({ "orders._id": id },
    { $set: { "orders.$.status": "cancelled" } },
    { new: true })


  if (canceledProductIds) {

    const product = await productCollection.findOne({ _id: canceledProductIds });

    if (product) {
      product.stock += canceledQuantities;
      await product.save();
    } else {
      // Handle product not found
      console.error('Product not found:', canceledProductIds);
    }
  }



  if (updatestatus) (

    res.redirect("/profile/orderstatus")
  )


}



const wallet = async (req, res) => {
  const userId = req.session.userId
  const user = await userCollection.findOne({ _id: userId }, { name: 1, email: 1 });
  const userdata = user.name;

  const walletdata = await userCollection.findOne({ _id: userId }, { wallet: 1 })

  res.render("user/wallet", { user, walletdata, userdata })
}

const returnOrder = async (req, res) => {

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




module.exports = {
  profile, profileAddAddress, profileAddAddressPost, profileShowAddress,
  editProfile, editProfilePost, updateProfile, orderStatus, orderCancel, profileAddressEdit,
  profileAddressEditGet, profileAddressDeletePost, returnOrder, wallet
}
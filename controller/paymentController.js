const userCollection = require("../models/mongoose");
const productCollection = require("../models/product");
const Razorpay = require('razorpay');
const dotenv = require('dotenv').config()


const razorpay = new Razorpay({
  key_id: process.env.RAZOR_ID,
  key_secret: process.env.RAZOR_SECRET,
})






// ---------------------------cod--------------------

const confirmorder = async (req, res) => {


  const data = req.query.data

  const parsedData = JSON.parse(data);
  console.log("parsedData", parsedData);
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

        const product = await productCollection.findOne({
          _id: item.productId,
        });
        if (product && product.stock >= item.quantity) {
          // Update stock in the product schema
          await productCollection.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } } // Decrement stock by the ordered quantity
          );

          const orderItem = {
            userId: userId,
            quantity: item.quantity,
            paymentmethod: paymentmethod,
            price: item.price,
            name: item.name,
            image: item.image,
            category: item.category,
            productId: item.productId,
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
        } else {
          // Handle insufficient stock (e.g., return an error)
          console.error('Insufficient stock for product:', item.productId);
        }
      }



      // Update the user's cart items with the modified item data in the orders field
      await userCollection.updateOne(
        { _id: userId },
        { $push: { orders: { $each: orders } } }
      );

      console.log("orders", orders)
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


        const product = await productCollection.findOne({
          _id: item.productId,
        });
        if (product && product.stock >= item.quantity) {
          // Update stock in the product schema
          await productCollection.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } } // Decrement stock by the ordered quantity
          );


          const orderItem = {
            userId: userId,
            quantity: item.quantity,
            paymentmethod: paymentmethod,
            price: item.price,
            name: item.name,
            image: item.image,
            category: item.category,
            productId: item.productId,
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
        else {
          // Handle insufficient stock (e.g., return an error)
          console.error('Insufficient stock for product:', item.productId);
        }
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


const confirmorderGet = async (req, res) => {
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

          const product = await productCollection.findOne({
            _id: item.productId,
          });
          if (product && product.stock >= item.quantity) {
            // Update stock in the product schema
            await productCollection.updateOne(
              { _id: item.productId },
              { $inc: { stock: -item.quantity } } // Decrement stock by the ordered quantity
            );


            const orderItem = {
              userId: userId,
              quantity: item.quantity,
              paymentmethod: paymentmethod,
              price: item.price,
              name: item.name,
              image: item.image,
              category: item.category,
              productId: item.productId,
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
          else {
            // Handle insufficient stock (e.g., return an error)
            console.error('Insufficient stock for product:', item.productId);
          }
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
      res.render('user/thankyou')
      // res.status(200).json({ userData3, userData2 })

    } catch (error) {
      console.error('Error updating user data:', error);

    }
  } else {
    res.send('Payment failed');
  }
};





module.exports = {
  confirmorder, confirmorderGet, razorpayOrder, paymentDone, codThankyou, walletPayment,
}
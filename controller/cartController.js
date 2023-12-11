const userCollection = require("../models/mongoose");
const productCollection = require("../models/product");




const cartid = async (req, res) => {

  const id = req.params.id;
  const userId = req.session.userId;
  try {
    const user = await userCollection.findOne({ _id: userId }, { 'cart.items': 1 })


    const product = await productCollection.findOne({ _id: id });

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






const productEdit = async (req, res) => {

  // console.log('ppp');
  const cartid = req.params.cartid;
  const newQuantity = parseInt(req.params.count);
  const productId = req.params.productId;
  const userId = req.session.userId
  const cartqty = await userCollection.findOne({ _id: userId }, { "cart.items": 1 })


  const stock1 = await productCollection.findOne({ _id: productId })

  const stock = stock1.stock




  try {

    const data = productId

    if (newQuantity > stock) {
      // console.log(1);
      return res.status(404).json({ data, success: false, message: 'Out Of Stock' });
    }
    // console.log(2);

    // const cartQuantity=cartqty.
    const cartquantity = cartqty.cart.items


    const cartQuantity = cartquantity.map((cart) => {
      return cart.quantity
    });

    const resultqty = parseInt(cartQuantity.join(''));





    const stockqty = await productCollection.findOne({ _id: productId })
    const stockUpdate = stockqty.stock

    const result = await userCollection.findOneAndUpdate(
      {
        _id: userId,
        "cart.items._id": cartid,
      },
      {
        $set: { "cart.items.$.quantity": newQuantity },
      },
      { new: true }
    );
    // console.log("result",result)


    const data1 = await userCollection.findOne(
      { _id: userId, 'cart.items': { $elemMatch: { _id: cartid } } },
      { 'cart.items': 1 }
    );
    // console.log("data1",data1);

    const grandTotal1 = await userCollection.findOne(
      { _id: userId },
      { 'cart.totalPrice': 1 }
    );

    // console.log("grandTotal1",grandTotal1);
    const user = await userCollection.findById(userId)
    console.log(user)
    // const grandTotal = grandTotal1.cart.totalPrice


    const grandTotal = user.cart.items.reduce((acc, curr) => {
      return acc + (curr.price * curr.quantity);
    }, 0);

    const grandtotalUpdate = await userCollection.findByIdAndUpdate(userId, {
      $set: { 'cart.totalPrice': grandTotal }
    })


    let matchedItem;

    if (data1 && data1.cart && data1.cart.items && data1.cart.items.length > 0) {
      matchedItem = Array.isArray(data1.cart.items) ? data1.cart.items : [data1.cart.items];


    } else {
      console.log('No matching item found.');
    }



    if (result) {

      console.log("Quantity updated successfully.", grandTotal);
      return res.status(200).json({ matchedItem, grandTotal, message: 'successfully' });
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
      // console.log("cartData",cartData);

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
      res.redirect("/user/login")
    }
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).send("Error fetching cart data");
  }


};


const removeProduct = async (req, res) => {
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



module.exports = {
  cartid, productEdit,
  cart, removeProduct
}

const userCollection = require("../models/mongoose");
const productCollection = require("../models/product");





const wishlistGet = async (req, res) => {
  const userId = req.session.userId;
  try {
    const wishdata = await userCollection.findOne({ _id: userId }, { wishlist: 1, _id: 1 });
    const wishlistData = wishdata.wishlist;


    res.render("user/wishlist", { wishlistData })
  }
  catch (error) {
    console.error("Error:", error);
    res.redirect("/user/login")

  }

}


const wishlist = async (req, res) => {

  const id = req.params.id;
  const userId = req.session.userId;
  try {
    const user = await userCollection.findOne({ _id: userId }, { 'wishlist.items': 1 })


    const product = await productCollection.findOne({ _id: id });

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

const removeWishlist = async (req, res) => {
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







module.exports = {
  wishlist, wishlistGet, removeWishlist,
}
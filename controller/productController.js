const productCollection = require("../models/product")
const category = require("../models/category")
const multer = require("multer");
const brandCollection = require("../models/brand")


const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
  },
});


const productManagement = async (req, res) => {
  const categorys = await category.find();
  const brand = await brandCollection.find();
  const errorMessage = req.query.error
  res.render("admin/productmanagement", { categorys, brand, errorMessage })
}


// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: storage });

const productAdd = async (req, res) => {
  const productName = req.body.name.trim(); // Trim whitespace from the name

  if (!productName) {
    const errorMessage = "Product name cannot be empty or contain only spaces.";
    return res.redirect(`/admin/productmanagement?error=${encodeURIComponent(errorMessage)}`);
  }

  const existProduct = await productCollection.findOne({ name: productName });

  if (existProduct) {
    const errorMessage = "Product is already exist.";
    return res.redirect(`/admin/productmanagement?error=${encodeURIComponent(errorMessage)}`);
  }

  try {
    const productData = {
      name: productName, // Use the trimmed name
      description: req.body.description,
      image: req.files.map(file => file.filename),
      price: req.body.price,
      brand: req.body.brand,
      category: req.body.category,
      stock: req.body.stock
    };

    await productCollection.insertMany([productData]);
    res.redirect('/admin/productdetails');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}





const ITEMS_PER_PAGE = 10; // Define the number of items to display per page

const productLists = async (req, res) => {
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
const productEdit = (req, res) => {
  const id = req.params.id;
  const errorMessage = "";
  productCollection.findById(id)
    .then(product => {
      if (!product) {
        res.redirect('/admin/productdetails')
      } else {
        res.render('admin/edit_products', { product: product, errorMessage })
      }
    })
    .catch(err => {
      console.log("Error in finding the product : ", err);
      res.redirect('/admin')
    })
}















// updating the product


const updateProduct = async (req, res) => {
  try {
    const id = req.params.id
    const product = await productCollection.findById(id)
    const deletedImages = req.body.deletedImages


    const productName = req.body.name.trim().toLowerCase();

    // Check if the product name already exists
    const existProduct = await productCollection.findOne({
      name: productName,
      _id: { $ne: id }, // Exclude the current product being updated
    });

    if (existProduct) {
      const errorMessage = "Product name already exists.";
      return res.render("admin/edit_products", { errorMessage, product });
    }




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

const productDelete = async (req, res) => {
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





module.exports = {
  productManagement, productAdd, productLists, productEdit, updateProduct, productDelete,

}
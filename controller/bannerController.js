const multer = require("multer");
const bannerCollection = require("../models/banner");





const addBanner = (req, res) => {
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

const addBannerPost = async (req, res) => {
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

const bannerList = async (req, res) => {
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
const bannerDelete = async (req, res) => {
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








module.exports = {
  addBanner, addBannerPost, bannerList, bannerDelete,
}
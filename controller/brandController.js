const brandCollection = require("../models/brand")





const addBrandGet = async (req, res) => {
  const errorMessage = "";
  res.render("admin/addbrand", { errorMessage })
}

const addBrandPost = async (req, res) => {

  const data = {
    brand: req.body.brand,
    description: req.body.description
  }
  const brands = data.brand


  const existingBrand = await brandCollection.findOne({ brand: { $regex: new RegExp('^' + brands + '$', 'i') } });
  if (existingBrand) {
    // If the coupon code already exists, render the coupon management view with an error message
    res.render('admin/addbrand', { errorMessage: 'Brand  already exists' });
    return;
  }


  await brandCollection.insertMany(data)

  res.redirect("/admin/brandlist")
}






const brandList = async (req, res) => {
  const ITEMS_PER_PAGE = 10;
  const page = +req.query.page || 1;

  try {
    const totalBrands = await brandCollection.countDocuments();
    const totalPages = Math.ceil(totalBrands / ITEMS_PER_PAGE);

    const brand = await brandCollection
      .find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .exec();

    res.render("admin/brandlist", {
      brand,
      currentPage: page,
      totalPages,
      ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};





const brandDelete = async (req, res) => {
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







module.exports = {
  addBrandGet, addBrandPost, brandList, brandDelete,
}
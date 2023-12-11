const category = require("../models/category")





const addCategory = (req, res) => {
  const errorMessage = req.query.error
  res.render("admin/addcategory", { errorMessage })
}








const addCategoryPost = async (req, res) => {
  const categoryName = req.body.category.trim().toLowerCase();

  try {
    // Check if the trimmed category name is empty
    if (!categoryName) {
      const errorMessage = "Category name cannot be empty or contain only spaces.";
      return res.redirect(`/admin/addcategory?error=${encodeURIComponent(errorMessage)}`);
    }

    const existCategory = await category.findOne({ category: { $regex: new RegExp('^' + categoryName + '$', 'i') } });

    if (existCategory) {
      const errorMessage = "Category already exists";
      return res.redirect(`/admin/addcategory?error=${encodeURIComponent(errorMessage)}`);
    } else {
      const categoryData = {
        category: req.body.category,
        description: req.body.description,
      };

      await category.insertMany([categoryData]);
      return res.redirect("/admin/categorylist");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred");
  }
};


const ITEM_PER_PAGE = 6;

const categorylist = async (req, res) => {
  try {
    const page = +req.query.page || 1;

    const totalProducts = await category.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEM_PER_PAGE);

    const categories = await category
      .find({})
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE)
      .exec();

    res.render("admin/categorylist", { categories, currentPage: page, totalPages, ITEM_PER_PAGE });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};






// editing the product
const categoryEdit = (req, res) => {
  const errorMessage = "";

  const id = req.params.id;
  category.findById(id)
    .then(categories => {
      if (!categories) {
        res.redirect('/admin/categorylist')
      } else {
        res.render('admin/edit_category', { categories: categories, errorMessage })
      }
    })
    .catch(err => {
      console.log("Error in finding the product : ", err);
      res.redirect('/admin')
    })
}



// updating the product
const updateCategory = async (req, res) => {
  try {
    const id = req.params.id


    const categories = await category.findById(id)
    const categoryName = req.body.category.trim().toLowerCase();

    const existCategory = await category.findOne({
      category: { $regex: new RegExp('^' + categoryName + '$', 'i') },
      _id: { $ne: id }
    });

    if (existCategory) {
      const errorMessage = "Category already exists";
      return res.render('admin/edit_category', { errorMessage, type: 'danger', categories });
    } else {








      const result = await category.findByIdAndUpdate(id, {

        category: req.body.category,
        description: req.body.description,
      })


      if (!result) {
        res.json({ message: 'category not found', type: 'danger' })
      } else {
        req.session.message = {
          type: 'success',
          message: 'category updated sucessfully'
        }
        res.redirect('/admin/categorylist')
      }
    }
  } catch (err) {
    console.log('Error updating the product : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}




// products delete
const categoryDelete = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await category.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'category deleted successfully',

      }
      res.redirect('/admin/categorylist');
    } else {
      res.json({ message: 'category not found' });
    }

  } catch (err) {
    console.error('Error deleting category: ', err);
    res.json({ message: err.message });
  }
};





module.exports = {
  addCategory, addCategoryPost,
  categorylist, categoryEdit, updateCategory, categoryDelete

}
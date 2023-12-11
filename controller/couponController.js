const couponCollection = require("../models/coupon")



const addCouponGet = (req, res) => {
  const errorMessage = '';
  res.render("admin/couponmanagement", { errorMessage })
}





const addCouponPost = async (req, res) => {
  try {
    const code = req.body.code;
    const discount = req.body.discount;
    const minValue = req.body.minValue;
    const description = req.body.description;



    const existingCoupon = await couponCollection.findOne({ code: code });
    if (existingCoupon) {
      // If the coupon code already exists, render the coupon management view with an error message
      res.render('admin/couponmanagement', { errorMessage: 'Coupon code already exists' });
      return;
    }


    const couponData = {
      code: code,
      discount: discount,
      minValue: minValue,
      description: description,
    };

    const newCoupon = await couponCollection.create(couponData);

    if (newCoupon) {
      res.redirect("/admin/couponlist");
      // Or send a success message or status if required
    } else {
      // Handle the case if the newCoupon is not created
      res.redirect("/admin/couponmanagement");
      // Or redirect to an error page
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    res.status(500).redirect('/500');
  }
};




const couponlist = async (req, res) => {

  const coupon = await couponCollection.find()
  res.render("admin/couponlist", { coupon })
}

const couponEdit = (req, res) => {
  const id = req.params.id;
  const errorMessage = "";
  couponCollection.findById(id)
    .then(coupon => {
      if (!coupon) {
        res.redirect('/admin/couponlist')
      } else {
        res.render('admin/edit_coupon', { coupon: coupon, errorMessage })
      }
    })
    .catch(err => {
      console.log("Error in finding the product : ", err);
      res.redirect('/admin')
    })
}

const updateCoupon = async (req, res) => {
  try {
    const id = req.params.id
    const couponCode = req.body.code;

    const coupon = await couponCollection.findById(id)

    const existingCoupon = await couponCollection.findOne({ code: couponCode, _id: { $ne: id } });

    if (existingCoupon) {
      // If the coupon code already exists, render the coupon management view with an error message
      res.render('admin/edit_coupon', { errorMessage: 'Coupon code already exists', coupon });
      return;
    }


    const result = await couponCollection.findByIdAndUpdate(id, {

      code: req.body.code,
      discount: req.body.discount,
      minValue: req.body.minValue,
      description: req.body.description,
    })
    if (!result) {
      res.json({ message: 'coupon not found', type: 'danger' })
    } else {
      req.session.message = {
        type: 'success',
        message: 'category updated sucessfully'
      }
      res.redirect('/admin/couponlist')
    }
  } catch (err) {
    console.log('Error updating the product : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}

const deleteCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await couponCollection.findByIdAndRemove({ _id: id });

    if (result) {
      req.session.message1 = {
        type: 'success',
        message: 'coupon deleted successfully',

      }
      res.redirect('/admin/couponlist');
    } else {
      res.json({ message: 'coupon not found' });
    }

  } catch (err) {
    console.error('Error deleting coupon: ', err);
    res.json({ message: err.message });
  }
};





module.exports = {
  addCouponGet, addCouponPost, couponlist,
  couponEdit, updateCoupon, deleteCoupon,
}
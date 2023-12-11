
const userCollection = require("../models/mongoose");


let user;




const usermanagement = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const perPage = 10; // Number of users per page


    const skip = (page - 1) * perPage;

    const user = await userCollection.find().skip(skip).limit(perPage).exec();


    const totalUsers = await userCollection.countDocuments();


    const startSerialNumber = (page - 1) * perPage + 1;

    res.render("admin/usermanagement", {
      user,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / perPage),
      startSerialNumber,
      perPage, // Pass perPage variable to the template
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error"); // Handle the error appropriately
  }
};



// editing the user
const editUser = (req, res) => {
  const id = req.params.id;
  userCollection.findById(id)
    .then(user => {
      if (!user) {
        res.redirect('/admin/usermanagement')
      } else {
        res.render('admin/edit_user', { user: user })
      }
    })
    .catch(err => {
      console.log("Error in finding the user : ", err);
      res.redirect('/admin')
    })
}



// updating the user
const updateUser = async (req, res) => {
  try {
    const id = req.params.id
    const result = await userCollection.findByIdAndUpdate(id, {
      name: req.body.name,
      password: req.body.password,
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
      res.redirect('/admin/usermanagement')
    }
  } catch (err) {
    console.log('Error updating the user : ', err);
    res.json({ message: err.message, type: 'danger' })
  }
}




const blockUser = async (req, res) => {
  const id = req.params.id;
  try {
    await userCollection.findByIdAndUpdate({ _id: id }, { blocked: true });
    res.redirect('/admin/usermanagement');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error blocking user');
  }

}

const unblockUser = async (req, res) => {
  const id = req.params.id;
  try {
    await userCollection.findByIdAndUpdate({ _id: id }, { blocked: false });
    res.redirect('/admin/usermanagement');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error unblocking user');
  }



}




module.exports = {
  usermanagement, editUser, updateUser, blockUser, unblockUser,
}
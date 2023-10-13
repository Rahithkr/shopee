const express=require("express");
const router=express.Router();
const userCollection=require("../models/mongoose");
const productCollection=require("../models/product")
const category=require("../models/category")
const multer=require("multer");

let user;  


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null,"./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
    },
    filename: (req, file, callback) => {
      callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
    },
  });
  
 

router.get("/",(req,res)=> {
    res.render("admin/admin");
})

router.post("/",(req,res)=> {


    res.render("admin/admindashboard")
})
router.get('/admindashboard',(req,res)=>{
    res.render('admin/admindashboard')
})


router.get("/usermanagement", async (req,res)=>{
    try{

        const user = await userCollection .find()
        res.render("admin/usermanagement",{user})

    }catch{
    console.log('error usermanagement');
    }
})

// editing the user
router.get('/edit_user/edit/:id',(req, res)=>{
    let id = req.params.id;
    userCollection.findById(id)
    .then(user=>{
        if(!user){
            res.redirect('/admin/usermanagement')
        } else {
            res.render('admin/edit_user',{user : user})
        }
    })
    .catch(err =>{
        console.log("Error in finding the user : ", err);
        res.redirect('/admin')
    })
})

// updating the user
router.post('/updateuser/:id', async (req, res) => {
    try{
        let id = req.params.id
        const result = await userCollection.findByIdAndUpdate(id, {
            name : req.body.name,
            password : req.body.password,
            email : req.body.email,
            mobile : req.body.mobile,
        })
        if(!result){
            res.json({message : 'User not found', type : 'danger'})
        } else { 
            req.session.message ={
                type : 'success',
                message : 'User updated sucessfully'
            }
            res.redirect('/admin/usermanagement')
        }
    }catch(err){
        console.log('Error updating the user : ',err);
        res.json({message : err.message, type :'danger'})
    }
})
// delete user
// router.get('/usermanagement/delete/:id', async (req, res) => {
//     try {
//       const id = req.params.id;
//       const result = await userCollection.findByIdAndRemove({_id: id});
  
//       if (result) {
//         req.session.message1 = {
//           type: 'success',
//           message: 'User deleted successfully',
          
//         }
//         res.redirect('/admin/usermanagement');
//       } else {
//         res.json({ message: 'User not found' });
//       }
  
//     } catch (err) {
//       console.error('Error deleting user: ', err);
//       res.json({ message: err.message });
//     }
//   });
  



router.post("/usermanagement/block/:id",async(req,res)=>{
  const id = req.params.id;
  try {
      await userCollection.findByIdAndUpdate({_id:id}, { blocked: true });
      res.redirect('/admin/usermanagement');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error blocking user');
  }
  
})
// router.get("/usermanagement/search",async(req,res)=>{
//      await userCollection.find({user:user})
//      res.render("/admin/usermanagement/search")
// })

// router.get("/usermanagement/search",async(req,res)=>{


//     let search="";
//     if(req.query.search){
//         search=req.query.search
    

//     try{

//         const user= await userCollection.find({_id:id},{name:{$regex:'.*'+search+'.*'}})

//         res.render("/admin/usermanagement/search",{user:user})
//     }
//     catch(error)
//     {
//         console.log("error")

//     }
// }
//     else{
//         console.log("erororrr")
//     }
// })

router.get("/admin/usermanagement/search", async (req, res) => {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
  
      try {
        const users = await userCollection.find({
          $or: [
            { name: { $regex: search, $options: 'i' } }, // Case-insensitive search for the name
            { email: { $regex: search, $options: 'i' } }, // Case-insensitive search for the email
          ],
        });
  
        res.render("admin/usermanagement/search", { users: users, searchTerm: search });
      } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error"); // Handle the error appropriately
      }
    } else {
      console.log("No search query provided");
      res.status(400).send("Bad Request: No search query provided"); // Handle the case when no search query is provided
    }
  });
  

router.post("/usermanagement/unblock/:id",async(req,res)=>{
  const id = req.params.id;
  try {
      await userCollection.findByIdAndUpdate({_id:id}, { blocked: false });
      res.redirect('/admin/usermanagement');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error unblocking user');
  }
 


})
router.get("/productmanagement",(req,res)=>{
  const errorMessage=req.query.error
    res.render("admin/productmanagement",{errorMessage})
})

// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: storage });

router.post("/productmanagement",upload.array('image'),async(req,res) => { 
  const productName=req.body.name
 
  existProduct= await productCollection.findOne({name:productName})

  if(existProduct){

    const errorMessage="product is already exist"


    res.redirect(`/admin/productmanagement?error=${encodeURIComponent(errorMessage)}`)
  }
  else{
    try{
       
        const productData = {
            name: req.body.name,
            description: req.body.description,
            // image: req.file.filename,
            image:req.files.map(file =>file.filename),
            price: req.body.price,
            category: req.body.category,
            stock: req.body.stock
          };
          console.log("req.file:", req.file);
        //   const imagePath = req.file.path;
          await productCollection.insertMany([productData])
          res.redirect('/admin/productdetails')
    }catch(error){
        console.error(error)
        res.send('hiii')
    }
  }
  
})



// products details
 

router.get("/productdetails",async(req,res) =>{
    

   const product= await productCollection.find();
  

    res.render("admin/productdetails",{product})


})

// editing the product
router.get('/edit_products/edit/:id',(req, res)=>{
    let id = req.params.id;
    productCollection.findById(id)
    .then(product=>{
        if(!product){
            res.redirect('/admin/productdetails')
        } else {
            res.render('admin/edit_products',{product : product})
        }
    })
    .catch(err =>{
        console.log("Error in finding the product : ", err);
        res.redirect('/admin')
    })
})

// updating the product
router.post('/updateproduct/:id', async (req, res) => {
    try{
        let id = req.params.id
        const result = await productCollection.findByIdAndUpdate(id, {
            name : req.body.name,
            category : req.body.category,
            image : req.body.image,
            price : req.body.price,
            stock: req.body.stock,
            description:req.body.description,
        })
        if(!result){
            res.json({message : 'product not found', type : 'danger'})
        } else { 
            req.session.message ={
                type : 'success',
                message : 'product updated sucessfully'
            }
            res.redirect('/admin/productdetails')
        }
    }catch(err){
        console.log('Error updating the product : ',err);
        res.json({message : err.message, type :'danger'})
    }
})

// products delete
router.get('/productdetails/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const result = await productCollection.findByIdAndRemove({_id: id});
  
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
  });
  



  router.get("/addcategory",(req,res)=>{
    const errorMessage=req.query.error
    res.render("admin/addcategory",{errorMessage})
  })

  router.post("/addcategory",async(req,res)=>{
    const categoryName= req.body.category
     existCategory=await category.findOne({category:categoryName})

     if(existCategory){

      const errorMessage="Categorym already exists"
      res.redirect(`/admin/addcategory?error=${encodeURIComponent(errorMessage)}`)

     }
     else{
 
    try{
        const categoryData={
            category:req.body.category,
            description:req.body.description,
        }
    
    await category.insertMany([categoryData]);
    
    res.redirect("/admin/addcategory")
    }
    catch(error){
        console.error(error)
        res.send("hello")
    }
  }
  })


  router.get("/categorylist",async(req,res)=>{
    
    const categories = await category.find()
    res.render("admin/categorylist",{categories})
  })



  // editing the product
router.get('/edit_category/edit/:id',(req, res)=>{
    let id = req.params.id;
   category.findById(id)
    .then(categories=>{
        if(!categories){
            res.redirect('/admin/categorylist')
        } else {
            res.render('admin/edit_category',{categories : categories})
        }
    })
    .catch(err =>{
        console.log("Error in finding the product : ", err);
        res.redirect('/admin')
    })
})

// updating the product
router.post('/updatecategory/:id', async (req, res) => {
    try{
        let id = req.params.id
        const result = await category.findByIdAndUpdate(id, {
           
            category : req.body.category,
            description: req.body.description,
        })
        if(!result){
            res.json({message : 'category not found', type : 'danger'})
        } else { 
            req.session.message ={
                type : 'success',
                message : 'category updated sucessfully'
            }
            res.redirect('/admin/categorylist')
        }
    }catch(err){
        console.log('Error updating the product : ',err);
        res.json({message : err.message, type :'danger'})
    }
})
// products delete
router.get('/categorylist/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const result = await category.findByIdAndRemove({_id: id});
  
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
  });
  




const adminRouter=router;
module.exports=adminRouter
const express=require("express");
const router = express.Router();
const userCollection=require("../models/mongoose");
const { log } = require("console");
const nodemailer=require("nodemailer");
const generateOtp = require("generate-otp");
const otpGenerator=require("otp-generator");  
const productCollection = require("../models/product");
let otp;
let user=false
let userData;
let transporter;
let newPassword;
let email;




router.get("/login",(req,res)=>{
    if(req.session.userId){
        res.redirect('/')
    }else{

        res.render("user/login")
    }
})

router.get("/signup",(req,res)=>{
    if(req.session.userId){
        res.redirect('/')
    }else{
         const errorMessage=req.query.error
        res.render("user/signup",{errorMessage})
    }
})

router.post("/signup",async(req,res)=>{
    try{
        const check=await userCollection.findOne({email:req.body.email})
        if(check){
            const errorMessage='Email already exist'
            res.redirect(`/user/signup?error=${encodeURIComponent(errorMessage)}`)

        }
        else{

        

         user={
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            mobile:req.body.mobile,
        }
        console.log(user)
        // await userCollection.insertMany([user]);
        console.log('hii');

         otp=generateOtp.generate(6, {digits:true ,alphabets:false ,specialChars:false} );


         transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'testtdemoo11111@gmail.com',
              pass: 'wikvaxsgqyebphvh',
            },
          });
console.log("2")

        const mailOptions={
            from:"rahithkr3@gmail.com",
            to:"rahithkr3@gmail.com",
            subject:"Your OTP code",
            text:`Your OTP code is:${otp}`
        };

        console.log("3")
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending OTP:', error);
            } else {
              console.log('OTP sent:', info.response);
              // Store the OTP and user's email in your database for verification
            }
          });
       

          
          console.log(mailOptions)
    console.log("successfully send")



        res.redirect("/user/otp")
    }


    router.get("/newotp",(req,res)=>{
console.log("running5")
        otp=generateOtp.generate(6, {digits:true ,alphabets:false ,specialChars:false} );
console.log(otp)
        const mailOptions={
            from:"rahithkr3@gmail.com",
            to:"rahithkr3@gmail.com",
            subject:"Your OTP code",
            text:`Your OTP code is:${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending OTP:', error);
            } else {
              console.log('OTP sent:', info.response);
              // Store the OTP and user's email in your database for verification
            }
          });


        res.redirect("/user/otp")
      })

    }catch(error){
        console.error(error)
    }
})  
router.get("/otp",(req,res)=>{
    res.render("user/otp");
})
router.get("/passotp",(req,res)=>{
      const check=req.session.check
      console.log(check);
    res.render("user/passotp");
})
router.post("/otp",async(req,res)=> {
   try{

    const enteredOtp=req.body.otp;
console.log(enteredOtp)
console.log(otp)
   if(otp==enteredOtp){
    console.log("completed")
     await userCollection.insertMany([user ]);
   
   res.redirect("/user/login")
// res.send("done")
   }
   else{
    res.redirect("/user/otp")
    // res.send("fail")
   }
   }
   catch (error) {
    console.error(error);
    // Handle any errors that occurred during the database query
    res.status(500).send("Internal server error");
}
   

})





router.post("/login", async (req, res) => {
    try {
        const check = await userCollection.findOne({ email: req.body.email, password: req.body.password });
        // console.log(check);

        if ( check && check.password === req.body.password) {
            // email=req.body.email
        
        //    const email= check.email
        user=true
            req.session.userId = check._id.toString();
            const user123=req.session.userId
            console.log('hiiiiiiiiiiiiiiiiiiiii',user123);
            console.log("login:",req.session.userId);
            
            res.redirect("/");
        } else {
            // Handle login failure, e.g., show an error message
            res.send("Invalid email or password");
        }
    } catch (error) {
        console.error(error);
        // Handle any errors that occurred during the database query
        res.status(500).send("Internal server error");
    }
});

router.get("/forgotpass",(req,res)=>{
    res.render("user/forgotpass")
})

router.post("/forgotpass",async(req,res)=>{
    try {
        email=req.body.email

        const check = await userCollection.findOne({ email: req.body.email});
        req.session.check=check

    if(check.email==req.body.email){
       

        otp=generateOtp.generate(6, {digits:true ,alphabets:false ,specialChars:false} );


        transporter = nodemailer.createTransport({
           service: 'gmail',
           auth: {
             user: 'testtdemoo11111@gmail.com',
             pass: 'wikvaxsgqyebphvh',
           },
         });  const mailOptions={
            from:"rahithkr3@gmail.com",
            to:"rahithkr3@gmail.com",
            subject:"Your OTP code",
            text:`Your OTP code is:${otp}`
        };

        console.log("3")
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending OTP:', error);
            } else {
              console.log('OTP sent:', info.response);
              // Store the OTP and user's email in your database for verification
            }
          });
          res.redirect("/user/passotp")
          
       

    }
    else {
        // Handle login failure, e.g., show an error message
        res.send("Invalid email or password");
    }
}catch (error) {
    console.error(error);
    // Handle any errors that occurred during the database query
    res.status(500).send("Internal server error");
    console.log("nooop")
}

})



router.get("/newpassotp",(req,res)=>{
      try{
        console.log("running5")
            otp=generateOtp.generate(6, {digits:true ,alphabets:false ,specialChars:false} );
    console.log(otp)
            const mailOptions={
                from:"rahithkr3@gmail.com",
                to:"rahithkr3@gmail.com",
                subject:"Your OTP code",
                text:`Your OTP code is:${otp}`
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Error sending OTP:', error);
                } else {
                  console.log('OTP sent:', info.response);
                  // Store the OTP and user's email in your database for verification
                }
              });
    
    
            res.redirect("/user/passotp")
        
        }catch(error){
            console.error(error)
        }
    })  
    router.get("/otp",(req,res)=>{
        res.render("user/otp");
    })
    router.get("/passotp",(req,res)=>{
          const check=req.session.check
          console.log(check);
        res.render("user/passotp");
    })

router.post("/passotp",async(req,res)=> {
    try{
 
     const enterOtp=req.body.otp;
 console.log(enterOtp)
 console.log(otp)
    if(otp==enterOtp){
     console.log("completed")
      
    
    res.render("user/newpass")
//  res.send("done")
    }
    else{
     res.redirect("/user/passotp")
     // res.send("fail")
    }
    }
    catch (error) {
     console.error(error);
     // Handle any errors that occurred during the database query
     console.log("thissss")

     res.status(500).send("Internal server error");
 }
    
 
 })
 

router.get("/newpass",(req,res)=>{
    res.render("user/newpass")
})
router.post("/newpass",async(req,res)=>{
    try{
        console.log(email)
        newPassword =req.body.password
        await userCollection.updateOne({email:email},{$set:{password:newPassword}})
        res.redirect('/user/login')

    }  catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
            }
})


router.get("/productpage/:id",async(req,res)=>{
    console.log("runnig")
    const id=req.params.id;
    console.log(id);
    const product= await productCollection.findOne({_id:id});
    if(req.session.userId ){
        console.log("jodi");
        res.render("user/productpage",{user,product})
    }else{
 
        res.redirect("/user/login")
    }
})




router.get("/productlist",async(req,res)=>{

    const product= await productCollection.find()

    res.render("user/productlist",{user,product})
})


//HOME
router.get('/',async(req,res)=>{
    console.log("home: ", req.session.userId);

const user1 =req.session.userId
   const product = await productCollection.find()


       res.render('user/index',{user1,product})  
  

  
})



router.get("/logout",(req,res)=>{
    req.session.userId=null;
    res.redirect("/user/login")
 
    })
        

  




// profile render

router.get("/profile", async (req, res) => {
    const userId=req.session.userId;
    try {
      
      const user = await userCollection.findOne({_id:userId });

        console.log(user)

        res.render("user/profile",{user});
        }
               
                  
    
     catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error"); // Handle the error appropriately
    }
});
let addressData;
router.get("/profile/addaddress",(req,res)=>{
    res.render("user/addaddress")
})

router.post("/profile/addaddress",async(req,res)=>{
    

  try{
    const filter={email:req.body.email}
     addressData={
        address:[{
      
        fulladdress:req.body.fulladdress,
        street:req.body.street,
        city:req.body.city,
        state:req.body.state, 
        pincode:req.body.pincode,
    }]
    }
    const option={upsert:true};
    console.log(addressData)
    await userCollection.updateOne(filter,addressData,option)
    res.redirect("/user/profile")

  }
  catch(error){
    console.log("address data eroor")
  }

})

router.get("/profile/showaddress",async(req,res)=>{
    const userId=req.session.userId;
    console.log("running one");

   const userData= await userCollection.findOne({_id:userId})
 
    res.render("user/showaddress",{userData})
})

router.get("/profile/editprofile/:id",async(req,res)=>{
 

    let id = req.params.id;
    userCollection.findById(id)
    .then(user=>{
        if(!user){
            res.redirect('/user/profile')
        } else {
            res.render('user/editprofile',{user : user})
        }
    })
    .catch(err =>{
        console.log("Error in finding the user : ", err);
        res.redirect('/user/profile')
    })
})

// updating the user
router.post('/profile/editprofile/:id', async (req, res) => {
    try{
        let id = req.params.id
        const result = await userCollection.findByIdAndUpdate(id, {
            name : req.body.name,
         
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
            res.redirect('/user/profile')
        }
    }catch(err){
        console.log('Error updating the user : ',err);
        res.json({message : err.message, type :'danger'})
    }
})

router.post('/profile/updateprofile/:id', async (req, res) => {
    try{
        let id = req.params.id
        const result = await userCollection.findByIdAndUpdate(id, {
            name : req.body.name,
          
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
            res.redirect('/user/profile')
        }
    }catch(err){
        console.log('Error updating the user : ',err);
        res.json({message : err.message, type :'danger'})
    }
})















router.get("/profile/orderstatus",async(req,res)=>{

    const userId=req.session.userId
    const user=await userCollection.findOne({_id:userId})

   

    const orders= await userCollection.aggregate([{$unwind:"$orders"},{
        $project:{
          productName:"$orders.name",
          category:"$orders.category",
          quantity:"$orders.quantity",
          price:"$orders.price",
          image:"$orders.image",
          
         
       
  
        }
      }])


      const order=user.orders;
      console.log("ordersss:",order)
    res.render("user/orderstatus",{order})
     
 
})


router.get("/ordercancel/:id",async(req,res)=>{
    const id=req.params.id;
  
  
console.log("id;",id)
const updatestatus= await userCollection.findOneAndUpdate( { "orders._id":id},

{ $set: { "orders.$.status": "cancelled" } },
{ new: true })
if(updatestatus)(

    res.redirect("/profile/orderstatus")
)


  })


  router.get("/removeproduct/:id",async(req,res)=>{
    const id=req.params.id;
  
  
console.log("id;",id)
const updateStatus = await userCollection.findOneAndUpdate(
    { "cart.items._id": id }, // Match the item within the cart with the specified _id
    { $pull: { "cart.items": { _id: id } } }, // Remove the item from the cart.items array
    { new: true }
);
if(updateStatus)(

    res.redirect("/user/cart",)
)


  })

// router.get("/cart/:id/:image",async(req,res)=> {
//     try{

        
//             const image = req.params.image
//             const id=req.params.id;
        
//             const product =await productCollection.findById(id)
        
//             console.log(image);
//             const productData={
//                 name:product.name,
//                 description:product.description,
//                 image:image,
//                 category:product.category,
               
//                 productId:product._id,
//                 price:product.price,
//             }
//             await userCollection.findOneAndUpdate({email:email},{$push:{"cart.items":productData}},{new:true})
            
//             const user=await userCollection.find({email:email},{'cart.items':1})
//             console.log(user);
        
//             const cartItem=user.cart.items
//             console.log(cartItem);
            
//             res.render('user/cart',{cartItem})
//     }catch(error){
//         console.error(error.message)
//         res.send('hii')
//     }

// })


router.get("/cart/:id",async(req,res)=>{
   
    console.log('im in');
    const id = req.params.id;
    console.log(id);
  let userId =  req.session.userId;
  console.log("userid:",userId);
  try{
    const user = await userCollection.findOne({_id: userId},{'cart.items':1})
    console.log(user);
    

    let product = await productCollection.findOne({_id: id});

    const productData={
        name:product.name,
        description:product.description,
        image:product.image[0],
        category:product.category,
        productId:product._id,
        price:product.price,
        stock:product.stock,
        userId:userId
    

    }
    console.log(productData);
    const existingCartItem = user.cart.items.find(item => item.productId.toString() === id);
    console.log("exitingcartitem:",existingCartItem)
    if (!existingCartItem) {


     const result= await userCollection.findOneAndUpdate({_id: userId},{ $push: { "cart.items": [productData] } });
     console.log("rsult:",result)
     res.redirect(`/user/productpage/${id}`);
    }
    else{

        res.redirect("/user/cart")
       

    }
}
    catch (error)  {
        console.error(error);
        res.status(500).send('An error occurred');
    }

    

});
// router.post("/productlist/search",async(req,res)=>{



  
//     try {

//         const search = req.body.search;
      
//         if(search){
//         }
       
//         const product = await productCollection.find({name:search})

       
//         res.redirect('/user/productlist', {product:product });

      
//     } catch (error) {
//         console.log(error.message);
//     }
// })









router.post("/product/cart/update/:cartid/:count/:productId", async (req, res) => {
    const cartid=req.params.cartid;
    const newQuantity = parseInt(req.params.count);
    const productId = req.params.productId;
    const userId = req.session.userId

    console.log(cartid)
    console.log(newQuantity)
    console.log(productId)
    console.log(userId)
    

    try {
        const stockqty = await productCollection.findOne({_id:productId})
        console.log(stockqty)
        const stockUpdate=stockqty.stock
        console.log(stockUpdate)
        if(newQuantity > stockUpdate){
            console.log('out of stock');
       
            const errorMessage = 'Out of Stock';
            return res.redirect('user/cart', { cartData });
        }else{
            console.log('valid stock')
        }
      const result = await userCollection.findOneAndUpdate(
        {
          _id: userId,
          "cart.items._id": cartid,
        },
        {
          $set: { "cart.items.$.quantity": newQuantity },
        }
      );

      
  
      if (result) {

        console.log("Quantity updated successfully.");
        res.sendStatus(200);
      } else {
        console.log("Cart item not found.");
        res.sendStatus(404);
      }

   
    } catch (error) {
      console.error("Error updating quantity:", error);
      res.sendStatus(500);
    }
  });
  




router.get("/cart", async (req, res) => {
    console.log("carting");
    const userId = req.session.userId;

    try {
        const userData = await userCollection.findOne({ _id: userId },{cart:1,_id:1});
        console.log('hiii');
        console.log(userData);
        if (userData) {
            const cartData = userData.cart;
            const userId=userData.id
            console.log("userIdCart:",userId)
            console.log(" cart : ",cartData);
            console.log("cartData:",cartData)

            // Calculate the total price
const totalPrice = cartData.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
}, 0);
console.log("totalPrice:",totalPrice)

// Update the user's cart with the total price
const result = await userCollection.findOneAndUpdate(
    { _id: userId },
    { 
        'cart.totalPrice': totalPrice
    }
   
);
            res.render("user/cart", { cartData ,userId,totalPrice});
        } else {
            // Handle the case where user data is not found.
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).send("Error fetching cart data");
    }


});

router.get("/checkout",async(req,res)=>{
    const userId=req.session.userId;
   const userData1= await userCollection.findOne({_id:userId})

   const userData = userData1.address
  const userData2 = await userCollection.findOne({ _id: userId },{cart:1,_id:1});
  const totalPrice= userData2.cart.totalPrice;
  console.log(userData2)
  console.log("userDatapassing:",userData)
    res.render("user/checkout",{userData,totalPrice,userData2})
})


router.post("/checkout/addaddress", async (req, res) => {
    try {
        const filter = { email: req.body.email };
        const newAddress = {
            street: req.body.street,
            city: req.body.city,
            fulladdress: req.body.fulladdress,
            state: req.body.state,
            pincode: req.body.pincode,
    
        };
        console.log("newAddress:",newAddress)
        const update = {
            $push: {
                'address': newAddress // Use the $push operator to add the new address to the array
            }
        };

        const options = { upsert: true };
console.log("update:",update)
        await userCollection.updateOne(filter, update, options);
      
        res.redirect("/user/checkout");
    } catch (error) {
        console.log("Address data error:", error);
        // Handle the error and send an error response
    }
});



router.post("/confirmorder", async (req, res) => {

    const address = req.body.address;
    console.log('selected : ',address);
 
    // const address = {
    //     street: "thala",
    //     city: "thalaa",
    //     fulladdress: "thala",
    //     state: "thalaa",
    //     pincode: "343543",
    //     _id: "652f70e4e3fd97d90467f43c"
    // };
    



    // const selectedAddress = req.query.selectedAddress;
    // console.log("Selected Address:", selectedAddress);


    const userId = req.session.userId;
    // const address = req.query.address;
    const payment = "COD";
    // console.log("address:",address)

    try {
        // Fetch user data and cart data
        const userData3 = await userCollection.findOne({ _id: userId });
        const userData2 = await userCollection.findOne({ _id: userId }, { 'cart.items': 1, _id: 0 });
console.log("userData2.cart:",userData2)
console.log("userData2:",userData3)

        // Push cart data to the 'orders' array
        await userCollection.updateOne(
            { _id: userId },
            { $push: { orders: userData2.cart.items , userData3 } }
        );

        // await userCollection.updateOne(
        //     { _id: userId },
        //     { $push: { 'orders.address' : address } }
        // );
        // Clear the cart items
        await userCollection.updateOne(
            { _id: userId },
            { $set: { 'cart.items': [] } }
        );

        

        // Rendering the view
        res.render("user/confirmorder", { userData3, userData2 });

    } catch (error) {
        console.error('Error updating user data:', error);
        // Handle the error
    }
});





const userRouter=router

module.exports=userRouter
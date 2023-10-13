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

// router.post("/login",async(req,res)=>{
//    const check=await userCollection.findOne({email:req.body.email,password:req.body.password})
//     console.log(check)
//     if(check.email===req.body.email && check.req.body.password){
        
//         res.redirect("/user/homepage")
//     }
   
// })

router.post("/login", async (req, res) => {
    try {
        const check = await userCollection.findOne({ email: req.body.email, password: req.body.password });
        // console.log(check);

        if ( check && check.password === req.body.password) {
            // email=req.body.email
        
        //    const email= check.email
        user=true
            req.session.userId = check._id.toString();
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


// router.get("/productpage",(req,res)=>{
//     res.render("user/productpage")
// })
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

   const product = await productCollection.find()
    res.render('user/index',{user,product})  
})

router.get("/logout",(req,res)=>{
    user=false
    res.redirect("/user/login")

    // req.session.destroy(function(err){
    //     if(err){
    //         console.log("err")
    //     }
    //     else{
    //         console.log("logout success");
    //         res.redirect("/user/login")
    //     }
    // })
   
})

// router.get("/profile",async(req,res)=>{
//     name=req.session.user;
//  const user=await userCollection.findOne({name})
//     res.render("user/profile",{user})
// })


router.get("/profile", async (req, res) => {
    try {
        // if (!req.session.user) {
        //     return res.redirect("/login"); // Redirect to login if the user is not authenticated
        // }

        // const name = req.session.user;
        const user = await userCollection.findOne({ email:email });

        // if (user) {
             // Handle the case when the user is not found
        console.log(user)

        res.render("user/profile", { user });
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
    const address=req.session.user;
    console.log("running one");

   const userData= await userCollection.findOne({email})
 
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
    const id = req.params.id;
    let userId =  req.session.userId
    const user = await userCollection.findOne({_id: userId},{cart:1, _id:0})

    let product = await productCollection.findOne({_id: id});

    const productData={
        name:product.name,
        description:product.description,
        image:product.image[0],
        category:product.category,
        productId:product._id,
        price:product.price,

    }
    
     const result= await userCollection.findOneAndUpdate({_id:userId},{ $push: { 'cart.items': productData } });

     res.redirect(`/user/productpage/${id}`);

})

// router.get("/cart/:id",(req,res)=>{
//     res.render("user/cart")
// })
// router.get("/cart/:id",async(req,res)=>{
//     id=req.params.id;

//     const result=await userCollection.insertOne(id,{
//         productName:req.body.productName,
//         price:req.body.price,
//         quantity:req.body.quantity,
//     })

//     res.redirect("/user/cart")

// })



// router.post("/update", async (req, res) => {
//     try {
//         // if (!req.session.user) {
//         //     return res.redirect("/login"); // Redirect to login if the user is not authenticated
//         // }

//         // const name = req.session.user;
//         const user = await userCollection.updateOne({ email:email });

//         // if (user) {
//              // Handle the case when the user is not found
//         console.log(user)

//         res.render("user/profile", { user });
//         }
    
            
    
//      catch (error) {
//         console.error("Error:", error);
//         res.status(500).send("Internal Server Error"); // Handle the error appropriately
//     }
// });


// router.get("/cart",async(req,res)=>{
//     console.log("carting")
// const userId=req.session.userId;
//     const cartData= await userCollection.findOne({_id:userId})

//     if(cartData){

//         res.render("user/cart",{cartData: cartData})
//     }
//     else
//     {
//         res.render("")
//     }
   



    
// })


router.get("/cart", async (req, res) => {
    console.log("carting");
    const userId = req.session.userId;

    try {
        const userData = await userCollection.findOne({ _id: userId },{cart:1});
        if (userData) {
            const cartData = userData.cart;
            console.log(" cart : ",cartData);
            res.render("user/cart", { cartData });
        } else {
            // Handle the case where user data is not found.
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).send("Error fetching cart data");
    }
});

// router.post("/cart/:id",async(req,res)=>{
//     const id=req.params.id;
    
 
//     const product =await productCollection.findOne({_id:id})

//    res.redirect("user/cart",{user,product})
// })
const userRouter=router

module.exports=userRouter
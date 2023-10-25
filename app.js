const express=require("express");
const app=express();
const path= require("path");
const mongoose=require("./models/mongoose");
const adminRouter=require('./routes/adminRouter')
const userRouter=require('./routes/userRouter')
// const session=require("express-session")
const session = require('express-session');
const crypto = require('crypto')





app.use((req,res,next)=>{
    res.header("cache-control","private,no-cache,no-store,must-revalidate");
    next();
})
 

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: crypto.randomUUID(),
    saveUninitialized:true,
    resave:false,
    cookie:{
      
        secure: false
    }
}))










app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, 'assets'))); 
app.use('/assets', express.static(path.join(__dirname, 'assets')));





// app.get("/",(req,res)=>{
//     // if(req,session,user){
//     //     user=req.session.user
//     // }
//     const user=req.session.user
//     if(user){
//         console.log('user');
//         console.log(user);
//         // const user=req.session.user
//         res.render("user/index",{user})
//     }else{
//         console.log("nouser");
//         const user=false
//        res.render('user/index',{user})
//     }
// })

app.use('/',userRouter)
app.use("/admin",adminRouter);
app.use("/user",userRouter);



app.listen(3000,()=>{
    console.log("server started")
});
const express=require("express");
const app=express();
const path= require("path");
const mongoose=require("./models/mongoose");
const adminRouter=require('./routes/adminRouter')
const userRouter=require('./routes/userRouter')
// const session=require("express-session")
const session = require('express-session');
const crypto = require('crypto');
const userCollection = require("./models/mongoose");
const productCollection = require("./models/product");
const categoryCollection = require('./models/category')





app.use((req,res,next)=>{
    res.header("cache-control","private,no-cache,no-store,must-revalidate");
    next();
})
 

// app.use(express.static("public"));

app.use(session({
    secret: crypto.randomUUID(),
    saveUninitialized:true,
    resave:false,
    cookie:{
      
        secure: false
    }
}))










app.set("view engine","ejs");
app.use(express.urlencoded({ extended: false }))
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

app.post('/admin/sales-data', async (req, res) => {
    try {
      const pipeline = [
        {
          $unwind: '$orders',
        },
        {
          $project: {
            month: { $month: '$orders.date' },
          },
        },
        {
          $group: {
            _id: '$month',
            ordersCount: { $sum: 1 },
          },
        },
      ];
  
      const result = await userCollection.aggregate(pipeline);
  
      // Ensure data for all months from January to December
      const finalResult = Array.from({ length: 12 }, (_, i) => {
        const monthData = result.find(item => item._id === (i + 1));
        return {
          month: i + 1,
          ordersCount: monthData ? monthData.ordersCount : 0,
        };
      });
  
      res.json(finalResult);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Endpoint to get yearly sales data
  app.post('/admin/saleyearly', async (req, res) => {
    try {
      const pipeline = [
        {
          $unwind: '$orders',
        },
        {
          $project: {
            year: { $year: '$orders.date' },
          },
        },
        {
          $group: {
            _id: { year: '$year' },
            ordersCount: { $sum: 1 },
          },
        },
      ];
  
      const result = await userCollection.aggregate(pipeline);
  
      // Ensure data for all years from the start year to the current year
      const currentYear = new Date().getFullYear();
    const startYear = 2023; // Change this to the desired start year

    const finalResult = Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
    const yearData = result.find(item => item._id.year === (startYear + i));
    return {
        year: startYear + i,
        ordersCount: yearData ? yearData.ordersCount : 0,
    };
    });
  
      res.json(finalResult);
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  app.post('/admin/revenue',async (req,res)=>{
    try {
        const aggregateResult = await productCollection.aggregate([
          {
            $group: {
              _id: '$name', // Assuming 'productName' is the field representing product names
              totalStock: { $sum: '$stock' }
            }
          }
        ]);
    
        const products = [];
        const totalStocks = [];
    
        aggregateResult.forEach((result) => {
          products.push(result._id);
          totalStocks.push(result.totalStock);
        });
    
        const data = {
          products: products,
          totalStocks: totalStocks,
        };
    
        res.json(data);
      } catch (error) {
        console.error('Error calculating total stock: ' + error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  })
  
  


app.use('/',userRouter)
app.use("/admin",adminRouter);
app.use("/user",userRouter);

app.use((req, res) => {
    res.status(404).render('404');
  });

app.listen(3000,()=>{
    console.log("server started")
});
const mongoose=require("mongoose");



const returnDetail = new mongoose.Schema({

    user:{
        type:String,
      
    }, 
      productName:{
        type:String,
      
    },
    price:{
        type:Number, 

    },
    paymentmethod:{
        type:String,
      
    },
    quantity:{
        type:String,
      
    },
    cartid:{
        type:String
    },
    
   
   
})


const returnCollection=new mongoose.model("return",returnDetail)


module.exports=returnCollection
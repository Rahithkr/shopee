const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/userRegister")
.then(()=>{
    console.log("mongodb connected properly")
})
.catch(()=>{
    console.log("mongodb doesn't connect properly")
})

const userRegister= new mongoose.Schema({

    name:{
        type:String,
        required:true,
},
    email:{
        type:String,
        required:true,
        unique:true,
       
},
    blocked:{
        type:Boolean,
        required:true,
        default:false,
    },

    password:{
        type:String,
        required:true,
    },
    mobile:{
        type:Number,
        required:true,
},
address: [
    {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    fulladdress:{
        type:String,
        required:true,
    },
    mobile:{
        type:Number,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
}
],
cart:{
    items:[{
       quantity :{
            type:Number,
            default:1
        },
        price:{
            type:Number,
        },
     
        name:{
            type:String,
        },
        productId:{
            type:mongoose.Schema.Types.ObjectId,
           
        },
        image:[{
            type:String,
            
        }],
        category:{
            type:String,
           
        },
        address:{
            type:String,

        },
        stock:{
            type:Number,

        },

        userId:{
            type:mongoose.Schema.Types.ObjectId
        }
    }],
    totalPrice:{
        type:Number,
    },
},
orders:[{
    date: {
        type: Date,
        default: Date.now
    },
    userId:{
      type:mongoose.Schema.Types.ObjectId,
    },
    quantity :{
        type:Number,
        default:1
    },
    status:{
        type:String,
        default:"Pending",
    },
    paymentmethod:{
        type: String
    },
    price:{
        type:Number,
    },
    name:{
        type:String,
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
       
    },
    image:[{
        type:String,
        
    }],
    category:{
        type:String,
       
    }, 
     address:[{
        street: { type: String },
        city: { type: String },
        fulladdress: { type: String },
        mobile: { type: Number },
        state: { type: String },
        pincode: { type: Number },
        _id: { type: String },
    }],
}],
    wallet:{
        total:{
            type:Number,
            default:0,
        },
        wallethistory:[{
            amount:{
                type:Number,
            },
            productName:{
                type:String,
            },
            status:{
                type:String
            }
        }]
    },
    coupens:[{
        isused:{
            type: String
        },
        coupenid:{
            type: String,
            // unique:true, 
            
        },
        code: {
            type: String,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        minvalue: {
            type: Number,
            require:true
        },
        expirydate: {
            type: String,
            required: true
        },
        discription: {
            type: String,
            required: true
        }
    }],
    usedcoupens:[{
        coupenid:{
            type: String
        }
    }],

wishlist:{
    items:[{
        price:{
            type:Number,
        },
        name:{
            type:String,
        },
        productId:{
            type:mongoose.Schema.Types.ObjectId,
           
        },
        image:[{
            type:String,
            
        }],
  
        
        userId:{
            type:mongoose.Schema.Types.ObjectId
        }
    }]
}

})

 


const userCollection=new mongoose.model("user",userRegister);
module.exports=userCollection

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
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
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
            required:true,
        },
        image:{
            type:String,
            
        },
        category:{
            type:String,
            required:true,
        }
    }]
}
})

 


const userCollection=new mongoose.model("user",userRegister);
module.exports=userCollection

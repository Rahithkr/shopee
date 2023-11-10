const mongoose =require("mongoose")


const banners =new mongoose.Schema({

    description:{
        type:String,
        required:true,
    },
   image:[{
        type:String,
        // required:true,
   }]

})


const bannerCollection=new mongoose.model("banner",banners)
module.exports=bannerCollection
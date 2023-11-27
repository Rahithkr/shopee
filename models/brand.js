const mongoose =require("mongoose")


const brands =new mongoose.Schema({

   brand:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    }

})


const brandCollection=new mongoose.model("brand",brands)
module.exports=brandCollection
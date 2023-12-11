const mongoose = require("mongoose")


const categories = new mongoose.Schema({

    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }

})


const category = new mongoose.model("category", categories)
module.exports = category
const mongoose = require("mongoose");



const productDetail = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
    },
    price: {
        type: Number,
        required: true,

    },
    category: {
        type: String,
        required: true,
    },
    image: [{

        type: String,
        // required:true,
    }],
    stock: {
        type: Number,
        required: true,
    }
})


const productCollection = new mongoose.model("products", productDetail)


module.exports = productCollection

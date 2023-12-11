const userCollection = require("../models/mongoose");

const isBlocked = async (req, res, next) => {
    const userId = req.session.userId
    const isUserBlocked1 = await userCollection.findOne({ _id: userId }, { blocked: 1 })

    const isUserBlocked = isUserBlocked1.blocked

    if (isUserBlocked == false) {
        next()
    }
    else {
        res.redirect('/user/logout')
    }
}

module.exports = isBlocked
const express= require('express')
const path = require ('path')
const router = express.Router()

const userRouter = require('../controller/usercontroller')
const isBlocked = require('../middleware/isBlocked')

router.get('/login',userRouter.login)
router.get('/signup',userRouter.signup)
router.post('/signup',userRouter.signuppost)
router.get('/newotp',userRouter.newotp)
router.get('/otp',userRouter.getotp)
router.get('/passotp',userRouter.passotp)
router.post('/otp',userRouter.otppost)
router.post('/login',userRouter.loginpost)
router.get('/forgotpass',userRouter.forgotpass)
router.post('/forgotpass',userRouter.forgotpasspost)
router.get('/newpassotp',userRouter.newpassotp)
router.get('/otp',userRouter.reotp)
router.get('/passotp',userRouter.repassotp)
router.post('/passotp',userRouter.repassotppost)
router.get('/newpass',userRouter.renewpass)
router.post('/newpass',userRouter.renewpasspost)
router.get('/productpage/:id',userRouter.productpage)
router.get('/productlists',userRouter.productlist)
router.get('/',userRouter.home)
router.get('/logout',userRouter.logout)
router.get('/profile',isBlocked,userRouter.profile)
router.get('/profile/addaddress',userRouter.profileaddaddress)
router.post('/profile/addaddress',userRouter.profileaddaddresspost)
router.get('/profile/showaddress',userRouter.profileshowaddress)
// router.post('/profile/showaddress/:id',userRouter.profileshowaddresspost)
router.get('/profile/editprofile/:id',userRouter.editprofile)
router.post('/profile/editprofile/:id',userRouter.editprofilepost)
router.post('/profile/updateprofile/:id',userRouter.updateprofile)
router.get('/profile/orderstatus',userRouter.orderstatus)
router.get('/ordercancel/:id',userRouter.ordercancel)
router.get('/removeproduct/:id',userRouter.removeproduct)
router.get('/cart/:id',userRouter.cartid)
router.post('/product/cart/update/:cartid/:count/:productId',userRouter.productedit)
router.get('/cart',userRouter.cart)
router.get('/checkout',userRouter.checkout)
router.post('/checkout/addaddress',userRouter.checkoutaddaddress)
router.get('/checkout/edit_address',userRouter.editaddress)
router.post('/checkout/edit_address',userRouter.editaddresspost)
router.get('/checkout/delete/:id',userRouter.addressdeletepost)
router.post('/confirmorder',userRouter.confirmorder)
router.get('/confirmorder',userRouter.confirmorderget)
router.get('/profile/wallet',userRouter.wallet)
router.post('/payorder/:a',userRouter. razorpayOrder)
router.post('/paymentdone',userRouter. paymentDone)
// router.post('/verifyCoupon',userRouter.verifyCoupon)
router.get('/codconfirmorder',userRouter.codThankyou)
router.post('/walletconfirmorder',userRouter.walletPayment)
router.get('/return', userRouter.returnorder);
router.post('/verifycoupen',userRouter.verifycoupen)
router.post('/clearcoupen',userRouter.clearcoupen)
router.get('/wishlist/:id',userRouter.wishlist)
router.get('/wishlist',userRouter.wishlistget)
router.get('/removewishlist/:id',userRouter.removewishlist)
router.get('/showaddress/editaddress',userRouter.profileaddresseditget)
router.post('/showaddress/editaddress',userRouter.profileaddressedit)
router.get('/showaddress/delete/:id',userRouter.profileaddressdeletepost)
router.get('/invoice/:id',userRouter.invoice)

module.exports= router
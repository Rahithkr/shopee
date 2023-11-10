const express= require('express')
const path = require ('path')
const router = express.Router()

const adminRouter = require('../controller/admincontroller')

const multer=require("multer")


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null,"./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
    },
    filename: (req, file, callback) => {
      callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
    },
  });

const upload = multer({ storage: storage });





const storages = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null,"./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
  },
});

const uploads = multer({ storage: storages });


router.get('/',adminRouter.login)
router.post('/',adminRouter.loginpost)
router.get('/admindashboard',adminRouter.admindashboard)
router.get('/usermanagement',adminRouter.usermanagement)
router.get('/edit_user/edit/:id',adminRouter.edituser)
router.post('/updateuser/:id',adminRouter.updateuser)
router.post('/usermanagement/block/:id',adminRouter.blockuser)
router.post('/usermanagement/search',adminRouter.usersearch)
router.post('/usermanagement/unblock/:id',adminRouter.unblockuser)
router.get('/productmanagement',adminRouter.productmanagement)
router.post("/productmanagement",upload.array('image'),adminRouter.productadd)
router.get('/productdetails',adminRouter.productlists)
router.get('/edit_products/edit/:id',adminRouter.productedit)
router.post('/updateproduct/:id',adminRouter.updateproduct)
router.get('/productdetails/delete/:id',adminRouter.productdelete)
router.get('/addcategory',adminRouter.addcategory)
router.post('/addcategory',adminRouter.addcategorypost)
router.get('/categorylist',adminRouter.categorylist)
router.get('/edit_category/edit/:id',adminRouter.categoryedit)
router.post('/updatecategory/:id',adminRouter.updatecategory)
router.get('/categorylist/delete/:id',adminRouter.categorydelete)
router.get('/ordermanagement',adminRouter.ordermanagement)
router.post('/orderstatus',adminRouter.orderstatus)
router.get('/couponmanagement',adminRouter.addcouponget)
router.post('/addcoupon',adminRouter.addcouponpost)
router.get('/couponlist',adminRouter.couponlist)
router.get('/edit_coupon/edit/:id',adminRouter.couponedit)
router.post('/updatecoupon/:id',adminRouter.updatecoupon)
router.get('/couponlist/delete/:id',adminRouter.deletecoupon)
router.get('/returnorder',adminRouter.returnorders)
router.get('/returnapprove',adminRouter.returnapprove)
router.get('/returnreject',adminRouter.returnreject)
router.get('/bannermanagement',adminRouter.addbanner)
router.post('/bannermanagement',uploads.array('image'),adminRouter.addbannerpost)
router.get('/bannerlist',adminRouter.bannerlist)
router.get('/bannerlist/delete/:id',adminRouter.bannerdelete)








module.exports=router;
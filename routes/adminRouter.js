const express = require('express')
const path = require('path')
const router = express.Router()

const adminRouter = require('../controller/adminController')
const productController = require("../controller/productController")
const categoryController = require("../controller/categoryController")
const couponController = require("../controller/couponController")
const bannerController = require("../controller/bannerController")
const brandController = require("../controller/brandController")
const userManageController = require("../controller/userManageController")
const chart = require('../models/chart')
const adminSession = require("../middleware/adminSession")
const multer = require("multer")


const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
  },
});

const upload = multer({ storage: storage });





const storages = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./assets/images/img"); // Uploads will be stored in the 'uploads/' directory
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname); // Rename the uploaded file with a unique name
  },
});

const uploads = multer({ storage: storages });


router.get('/', adminRouter.login)
router.post('/', adminRouter.loginPost)
router.get('/admindashboard', adminSession.isLogin, adminRouter.adminDashboard)
router.get('/usermanagement', adminSession.isLogin, userManageController.usermanagement)
router.get('/edit_user/edit/:id', adminSession.isLogin, userManageController.editUser)
router.post('/updateuser/:id', adminSession.isLogin, userManageController.updateUser)
router.post('/usermanagement/block/:id', adminSession.isLogin, userManageController.blockUser)
router.post('/usermanagement/search', adminSession.isLogin, adminRouter.usersearch)
router.post('/usermanagement/unblock/:id', adminSession.isLogin, userManageController.unblockUser)
router.get('/productmanagement', adminSession.isLogin, productController.productManagement)
router.post("/productmanagement", adminSession.isLogin, upload.array('image'), productController.productAdd)
router.get('/productdetails', adminSession.isLogin, productController.productLists)
router.get('/edit_products/edit/:id', adminSession.isLogin, productController.productEdit)
router.post('/updateproduct/:id', adminSession.isLogin, upload.array('image'), productController.updateProduct)
router.get('/productdetails/delete/:id', adminSession.isLogin, productController.productDelete)
router.get('/addcategory', adminSession.isLogin, categoryController.addCategory)
router.post('/addcategory', adminSession.isLogin, categoryController.addCategoryPost)
router.get('/categorylist', adminSession.isLogin, categoryController.categorylist)
router.get('/edit_category/edit/:id', adminSession.isLogin, categoryController.categoryEdit)
router.post('/updatecategory/:id', adminSession.isLogin, categoryController.updateCategory)
router.get('/categorylist/delete/:id', adminSession.isLogin, categoryController.categoryDelete)
router.get('/ordermanagement', adminSession.isLogin, adminRouter.ordermanagement)
router.post('/orderstatus', adminSession.isLogin, adminRouter.orderstatus)
router.get('/couponmanagement', adminSession.isLogin, couponController.addCouponGet)
router.post('/addcoupon', adminSession.isLogin, couponController.addCouponPost)
router.get('/couponlist', adminSession.isLogin, couponController.couponlist)
router.get('/edit_coupon/edit/:id', adminSession.isLogin, couponController.couponEdit)
router.post('/updatecoupon/:id', adminSession.isLogin, couponController.updateCoupon)
router.get('/couponlist/delete/:id', adminSession.isLogin, couponController.deleteCoupon)
router.get('/returnorder', adminSession.isLogin, adminRouter.returnOrders)
router.get('/returnapprove', adminSession.isLogin, adminRouter.returnApprove)
router.get('/returnreject', adminSession.isLogin, adminRouter.returnReject)
router.get('/bannermanagement', adminSession.isLogin, bannerController.addBanner)
router.post('/bannermanagement', adminSession.isLogin, uploads.array('image'), bannerController.addBannerPost)
router.get('/bannerlist', adminSession.isLogin, bannerController.bannerList)
router.get('/bannerlist/delete/:id', adminSession.isLogin, bannerController.bannerDelete)




router.get('/sales-data', chart.sales)
router.get('/revenue', chart.revenue)
router.get('/saleyearly', chart.saleyearly)

router.get('/report', adminSession.isLogin, adminRouter.reports)

// ----------------------sale excel report---------------
router.get('/generate-excel-report-month', adminSession.isLogin, adminRouter.generateExcelReportMonth)
router.post('/generate-excel-report-year', adminSession.isLogin, adminRouter.yearaleexcellreport)


router.get("/addbrand", adminSession.isLogin, brandController.addBrandGet)
router.post("/addbrand", adminSession.isLogin, brandController.addBrandPost)
router.get("/brandlist", adminSession.isLogin, brandController.brandList)
router.get('/brandlist/delete/:id', adminSession.isLogin, brandController.brandDelete)
// router.post('/deleteimage/:id/:filename',adminRouter.deleteimg)
router.get('/edit_products/delete/:id/:productid', adminSession.isLogin, adminRouter.editImageDelete)
router.get('/salereportweek', adminSession.isLogin, adminRouter.saleReportWeek)
router.post('/generate-pdf-report-month', adminSession.isLogin, adminRouter.monthPdf)
router.post('/generate-pdf-report-year', adminSession.isLogin, adminRouter.generatePDFReportYear)
router.get('/generate-pdf-report-week', adminSession.isLogin, adminRouter.generatePDFReportDate)
router.get("/logout", adminRouter.logout)





module.exports = router;
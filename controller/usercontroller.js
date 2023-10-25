const userCollection=require("../models/mongoose");

const nodemailer=require("nodemailer");
const generateOtp = require("generate-otp");
 
const productCollection = require("../models/product");
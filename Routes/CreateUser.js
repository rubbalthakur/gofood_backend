const express = require("express");
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt= require("bcryptjs");
const jwt=  require("jsonwebtoken");
const jwtSecret = "Ihavepowersofbothsupermanandbatman";

router.post("/createuser", [
    body('email').isEmail(),
    body('password').isLength({ min: 5 })],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
            // return res.success(400).json({errors: errors.array()});
        }
        const salt= await bcrypt.genSalt(10);
        const secPassword= await bcrypt.hash(req.body.password,salt);
        try{
            User.create({
                name: req.body.name,
                password: secPassword,
                email: req.body.email,
                location: req.body.location
            })
            res.json({ success: true });
        }
         catch (error) {
            console.log(error);
            res.json({ success: false });
        }
    })


router.post("/loginuser", [
    body('email').isEmail(),
    body('password').isLength({ min: 5 })], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        let email = req.body.email;
        try {
            
            let userData = await User.findOne({email});
            

            if(!userData){
                return res.status(400).json({errors:"try with correct credentials"});
            }
            const comPassword = bcrypt.compare(req.body.password, userData.password);
            if(!comPassword){
                return res.status(400).json({errors:"try with correct credentials"});
            }
            const data={
                user:{
                    id: userData.id
                }
            }
            const authToken = jwt.sign(data,jwtSecret);
            return res.json({ success: true, authToken: authToken });
        }
         catch (error) {
            console.log(error);
            return res.json({ success: false });
        }
    })

module.exports = router;
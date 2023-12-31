import { db } from "../db.js";
import bcrypt from "bcryptjs";
import fetch from 'node-fetch';
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    try{
    //CHECK EXISTING USER
    const q = "SELECT * FROM users WHERE email = ? OR username = ?";
  
    db.query(q, [req.body.email, req.body.username], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json("User already exists!");
  
      //Hash the password and create a user
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
  
      const q = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
      const values = [req.body.username, req.body.email, hash];
  
      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User has been created.");
      });
    });
    } catch (error) {
        return res.json('Something went wrong!');
    }
  };

export const login = async (req, res) => {
    try{
    //CHECK USER
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const token = req.body.reToken;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;
    const response = await fetch(verificationUrl).then(res => res.json());
    // RECAPTCHA validation
    if (response.success) {
        console.log("success");
    } else {
        return res.status(400).json('Please verify that you are not a robot');
    }

    const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");

        //Check password
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            data[0].password
        );

        if (!isPasswordCorrect)
            return res.status(400).json("Wrong username or password!");

        const token = jwt.sign({ id: data[0].id }, "jwtkey");
        const { password, ...other } = data[0];

        res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json(other);
    });
    } catch (error) {
        return res.json('Something went wrong!');
    }

};

export const setToken = (req, res) => {
    res
        .cookie("access_token", req.body.token, {
            httpOnly: true,
        })
        .status(200).json("Token has been set.");
}

export const logout = (req, res) => {
    try {

        res.clearCookie("access_token", {
            sameSite: "none",
            secure: true
        }).status(200).json("User has been logged out.")
    } catch (error) {
        return res.json("Something went wrong!");
    }
};
import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {
    const q = req.query.cat
        ? "SELECT * FROM posts WHERE cat='" + req.query.cat + "'"
        : "SELECT * FROM posts";

    db.query(q, (err, data) => {
        if (err) return res.status(500).json("Something went wrong!");

        return res.status(200).json(data);
    });
};

export const getPost = (req, res) => {
    const q =
        "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`,`date` FROM users u JOIN posts p ON u.id = p.uid WHERE p.id = '" + req.params.id + "' ";

    db.query(q, (err, data) => {
        if (err) return res.status(500).json("Something went wrong!");

        return res.status(200).json(data[0]);
    });
};

export const addPost = (req, res) => {
    try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q =
            "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`,`uid`) VALUES ('" + req.body.title + "','" + req.body.desc + "','" + req.body.img + "','" + req.body.cat + "','" + req.body.date + "','" + userInfo.id + "')";

        db.query(q, (err, data) => {
            if (err) return res.status(500).json(err);
            return res.json("Post has been created.");
        });
    });
    } catch (error) {
        return res.json("Something went wrong!");
    }
};

export const deletePost = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const postId = req.params.id;
        const q = "DELETE FROM posts WHERE `id` = '" + postId + "' AND `uid` = '" + userInfo.cat + "'";

        db.query(q, (err, data) => {
            if (err) return res.status(403).json("Something went wrong!");

            return res.json("Post has been deleted!");
        });
    });
};

export const updatePost = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const postId = req.params.id;
        const q =
            "UPDATE posts SET `title`='" + req.body.title + "',`desc`='" + req.body.desc + "',`img`='" + req.body.img + "',`cat`='" + req.body.cat + "' WHERE `id` = '" + postId + "' AND `uid` = '" + userInfo.title + "'";

        db.query(q, (err, data) => {
            if (err) return res.status(500).json("Something went wrong!");
            return res.json("Post has been updated.");
        });
    });
};

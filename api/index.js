import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from "cors";
import dotenv from 'dotenv';

const app = express();

dotenv.config();

if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https')
            res.redirect(`https://${req.header('host')}${req.url}`)
        else next()
    })
}

const allowedMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']

app.use((req, res, next) => {
        if (!allowedMethods.includes(req.method)) return res.json(405, 'Method Not Allowed')
        return next()
    })
    
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });
    
const corsConfig = {
    credentials: true,
    origin: "http://localhost:3000",
};


app.use(cors(corsConfig));

app.use(express.json());
app.use(cookieParser());
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../client/public/upload");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
    const file = req.file;
    res.status(200).json(file.filename);
});

// Implement the X-Frame-Options header to prevent clickjacking
app.use((req, res, next) => {
    res.header("X-Frame-Options", "DENY");
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(8800, () => {
    console.log("Connected!");
});

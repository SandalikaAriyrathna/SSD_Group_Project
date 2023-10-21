import express from "express";
import { register, login, logout, setToken } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/token", setToken);
router.post("/logout", logout);

export default router;

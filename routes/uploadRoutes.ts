import express, { Request } from "express";
import multer from "multer";
import { UserController } from "../controller/userController";
import { authenticateToken } from "../middleware/auth";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();
const upload = multer();
router.use(authenticateToken);

const userController = new UserController();
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Get userId from authenticated token
    const userId: any = req.user?.userId;
    const multerReq = req as MulterRequest;
    if (!multerReq.file || !multerReq.file.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    console.log("File received:", userId);
    const url = await userController.uploadFile(multerReq.file.buffer, userId);
    if (!url) {
      return res
        .status(500)
        .json({ success: false, message: "File upload failed" });
    }
    res.status(200).json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

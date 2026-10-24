// /api/users — profile + password + saved address book (signed-in user only)
import { Router } from "express";
import {
  getMe,
  updateMe,
  changePassword,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/password", changePassword);

router.get("/me/addresses", listAddresses);
router.post("/me/addresses", addAddress);
router.put("/me/addresses/:addrId", updateAddress);
router.delete("/me/addresses/:addrId", deleteAddress);

export default router;

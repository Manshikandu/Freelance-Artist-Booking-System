// // middleware/validateArtistUpdate.js
// import { body, validationResult } from "express-validator";

// export const validateArtistUpdate = [
//   body("email").optional().isEmail().withMessage("Invalid email"),
//   body("phone")
//     .optional()
//     .matches(/^\d{10}$/)
//     .withMessage("Phone number must be exactly 10 digits"),
//   body("category")
//     .optional()
//     .isIn(["dj", "musician", "mc", "dancer", "singer", "other"])
//     .withMessage("Invalid category"),
//   body("wage").optional().isNumeric().withMessage("Wage must be a number"),
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty())
//       return res.status(400).json({ errors: errors.array() });
//     next();
//   },
// ];

import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import uploads from '../middlewares/multer.js';
import { 
  createSpecialOffer, 
  getAllSpecialOffers, 
  getSpecialOfferById, 
  updateSpecialOffer, 
  deleteSpecialOffer
} from '../controllers/specialOfferController.js';

const router = express.Router();

// Using shared multer middleware

// Production routes (with authentication)
router.post('/specialOffer', isAuthenticated, uploads.single('image'), createSpecialOffer);
router.post('/specialOffer/get', getAllSpecialOffers); // Changed from GET to POST and added /get to avoid route conflict
router.get('/specialOffer/:id', getSpecialOfferById);
router.put('/specialOffer/:id', isAuthenticated, uploads.single('image'), updateSpecialOffer);
router.delete('/specialOffer/:id', isAuthenticated, deleteSpecialOffer);

// No test routes - all routes require proper authentication

export default router;

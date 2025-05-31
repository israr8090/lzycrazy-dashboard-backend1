
import { Router } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth.js';
import  upload  from '../middlewares/multer.js';
import {
  getHeader,
  createHeader,
  updateHeader,
  deleteHeader,
} from '../controllers/headerController.js';

const router = Router();


/**
 * GET    /api/header/get      → get logoUrl + navItems
 * POST   /api/header/create      → upload.single('logo') + createHeader
 * PUT    /api/header/update      → upload.single('logo') + updateHeader
 * DELETE /api/header/delete      → deleteHeader
 */
router.get('/get', getHeader);
router.post('/create', isAuthenticated, authorizeRoles("admin"),  upload.single('logo'), createHeader);
router.put('/update', isAuthenticated, authorizeRoles("admin"), upload.single('logo'), updateHeader);
router.delete('/delete', isAuthenticated, authorizeRoles("admin"), deleteHeader);

export default router;

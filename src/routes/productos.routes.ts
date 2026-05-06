import { authenticateToken } from '../middleware/auth';
import { Router } from 'express';
import multer from 'multer';
import { buscarProductos, agregarProducto, editarProducto } from '../controllers/productos.controller.js';

const router = Router();

// Configuramos multer para usar memoria (más rápido para Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', buscarProductos);
// 'img' debe ser el nombre del campo en tu FormData del frontend
router.post('/nuevo', upload.single('img'), agregarProducto);
router.put('/editar', upload.single('img'), editarProducto);

export default router;
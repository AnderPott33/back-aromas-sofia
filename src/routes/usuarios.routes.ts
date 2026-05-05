import { Router } from 'express';
import { buscarUsuarios, agregarUsuario, editarUsuario, actualizarContrasena, buscarUsuarioId } from '../controllers/usuarios.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, buscarUsuarios);
router.get('/:id', authenticateToken, buscarUsuarioId);
router.post('/agregar', authenticateToken, agregarUsuario);
router.put('/editar', authenticateToken, editarUsuario);
router.put('/actualizarContrasena', authenticateToken, actualizarContrasena);

export default router;
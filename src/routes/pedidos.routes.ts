import { authenticateToken } from '../middleware/auth';
import { Router } from 'express';
import { agregarPedido, getPedidoById, getTodosLosPedidos, actualizarEstadoPedido } from '../controllers/pedidos.controller';

const router = Router();

// POST para crear
router.post('/nuevo', agregarPedido);

router.get('/:id',  getPedidoById);

router.put('/:id/estado',  actualizarEstadoPedido);

router.get('/',  getTodosLosPedidos);

export default router;
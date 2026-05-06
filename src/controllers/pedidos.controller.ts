import { Request, Response } from 'express';
import { query } from '../db/db.js';

export const actualizarEstadoPedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { estado } = req.body; // Los valores esperados son: 'pendiente', 'confirmado' o 'cancelado'

    // Validación básica de estados permitidos (según tu comentario en el CREATE TABLE)
    const estadosValidos = ['pendiente', 'confirmado', 'cancelado'];
    
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
            error: `Estado no válido. Use uno de estos: ${estadosValidos.join(', ')}` 
        });
    }

    try {
        const result = await query(
            'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING id, estado',
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({
            message: 'Estado del pedido actualizado con éxito',
            pedido: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getPedidoById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // 1. Buscamos la cabecera del pedido y sus items en una sola consulta
        // Usamos JOIN para traer el nombre y la imagen del producto
        const result = await query(
            `SELECT 
                p.id as pedido_id,
                p.cliente_nombre,
                p.estado,
                p.creado_en,
                pi.id as item_id,
                pi.cantidad,
                pi.precio_unitario,
                prod.nombre as producto_nombre,
                prod.img as producto_img
             FROM pedidos p
             JOIN pedido_items pi ON p.id = pi.pedido_id
             JOIN productos prod ON pi.producto_id = prod.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // 2. Formateamos la respuesta para que sea fácil de usar en el Front
        const pedido = {
            id: result.rows[0].pedido_id,
            cliente: result.rows[0].cliente_nombre,
            estado: result.rows[0].estado,
            fecha: result.rows[0].creado_en,
            // Calculamos el total general sumando los subtotales
            total: result.rows.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0),
            items: result.rows.map(row => ({
                id: row.item_id,
                nombre: row.producto_nombre,
                img: row.producto_img,
                cantidad: row.cantidad,
                precio: row.precio_unitario,
                subtotal: row.cantidad * row.precio_unitario
            }))
        };

        res.json(pedido);

    } catch (error) {
        console.error('Error al obtener el pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Opcional: Obtener todos los pedidos (Resumen para un panel de admin)
export const getTodosLosPedidos = async (req: Request, res: Response) => {
    try {
        const result = await query(
            `SELECT p.*, 
             (SELECT SUM(cantidad * precio_unitario) FROM pedido_items WHERE pedido_id = p.id) as total
             FROM pedidos p 
             ORDER BY creado_en DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

export const agregarPedido = async (req: Request, res: Response) => {
    // Extraemos directamente del body
    const { items, total, cliente_nombre } = req.body;

    // Validación de seguridad para el nombre
    const cliente = (cliente_nombre && cliente_nombre.trim().length > 0) 
                    ? cliente_nombre 
                    : 'CLIENTE OCASIONAL';

    if (!items || items.length === 0 || !total) {
        return res.status(400).json({ error: 'El pedido está vacío o le faltan datos.' });
    }

    try {
        await query('BEGIN');

        const pedidoResult = await query(
            `INSERT INTO pedidos (cliente_nombre, estado) 
             VALUES ($1, 'pendiente') 
             RETURNING id`,
            [cliente]
        );

        const pedidoId = pedidoResult.rows[0].id;

        for (const item of items) {
            await query(
                `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) 
                 VALUES ($1, $2, $3, $4)`,
                [pedidoId, item.id, item.cantidad, item.precio]
            );
        }

        await query('COMMIT');

        res.status(201).json({
            message: 'Pedido registrado con éxito',
            pedidoId: pedidoId
        });

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error al registrar pedido:', error);
        res.status(500).json({ error: 'Error interno al procesar el pedido.' });
    }
};
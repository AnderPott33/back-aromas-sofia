import { Request, Response } from 'express';
import { query } from '../db/db.js';
import cloudinary from '../db/cloudinary.js';

// Función para subir buffer a Cloudinary
const streamUpload = (fileBuffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "tienda_productos" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        stream.end(fileBuffer);
    });
};

export const buscarProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await query(`SELECT id, nombre, img, compra, descripcion, venta, activo, creado_en FROM productos ORDER BY id DESC`);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json(`No se encontraron correspondencias!`);
        console.error(error);
    }
};

export const agregarProducto = async (req: Request, res: Response): Promise<void> => {
    const { nombre, compra, descripcion, venta } = req.body;
    const file = req.file; // Proviene de Multer

    try {
        let imageUrl = '';
        if (file) {
            const upload = await streamUpload(file.buffer);
            imageUrl = upload.secure_url;
        }

        await query(
            `INSERT INTO productos (nombre, compra, venta, descripcion, img, activo) VALUES ($1, $2, $3, $4, $5, $6)`,
            [nombre, compra, venta, descripcion, imageUrl, true]
        );
        res.status(201).json(`Producto "${nombre}" agregado con éxito`);
    } catch (error) {
        console.error(error);
        res.status(500).json(`No se pudo agregar el producto`);
    }
};

export const editarProducto = async (req: Request, res: Response): Promise<void> => {
    const { id, nombre, compra, venta, descripcion, activo } = req.body;
    const file = req.file;

    try {
        // Buscamos la imagen actual por si no se sube una nueva
        const productoActual = await query(`SELECT img FROM productos WHERE id = $1`, [id]);
        let imageUrl = productoActual.rows[0]?.img || '';

        if (file) {
            const upload = await streamUpload(file.buffer);
            imageUrl = upload.secure_url;
        }

        await query(
            `UPDATE productos SET nombre = $1, img = $2, compra = $3, venta = $4, descripcion = $7, activo = $5 WHERE id = $6`,
            [nombre, imageUrl, compra, venta, activo, id, descripcion]
        );

        res.status(200).json(`Producto ${nombre} actualizado correctamente`);
    } catch (error) {
        console.error(error);
        res.status(500).json(`No se pudo editar el producto`);
    }
};
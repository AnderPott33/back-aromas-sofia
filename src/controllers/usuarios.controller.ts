import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { query } from '../db/db.js';


//Buscar listado de usuarios
export const buscarUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await query(`SELECT id, nombre, email, rol, activo FROM usuarios`);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`No se pudo obtener los usuarios, Error: ${error}`)
    }
}

//Buscar usuario por ID
export const buscarUsuarioId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await query(`SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1`,
            [id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`No se pudo obtener los usuarios, Error: ${error}`)
    }
}

//Agregar nuevo usuario
export const agregarUsuario = async (req: Request, res: Response): Promise<void> => {
    const { nombre, email, rol, password } = req.body;

    const saltRounds = 10;
    const plainPassword = password;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
    try {
        const result = await query(`INSERT INTO usuarios (nombre, email, rol, password_hash)
            VALUES($1, $2, $3, $4)
            RETURNING id, nombre, email, rol
            `,
            [nombre, email, rol, passwordHash]
        )
        res.status(201).json(`Usuario agregado con éxito usuario: ${result.rows[0]}`)
    } catch (error) {
        console.error(`No se pudo agregar un nuevo usuario, Error: ${error}`);
    }
}

//Editar datos de usuario existente
export const editarUsuario = async (req: Request, res: Response): Promise<void> => {
    const { id, nombre, email, rol } = req.body;
    try {
        const result = await query(`UPDATE usuarios SET
            nombre = $1,
            email = $2,
            rol = $3
            WHERE id = $4`,
            [nombre, email, rol, id]
        )
        res.status(200).json('Usuario actualizado.')
    } catch (error) {
        console.error(`No se pudo editar el usuario, Error: ${error}`)
        res.status(500).json(`No se pudo actualizar el usuario`);
    }
}

//Actualiar contraseña de usuario
export const actualizarContrasena = async (req: Request, res: Response): Promise<void> => {
    const { nuevaContrasena, id } = req.body;
    const saltRounds = 10;
    const plainPassword = nuevaContrasena;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
    try {
        const result = await query(`UPDATE usuarios set(password_hash)
    VALUES ($1) 
    WHERE id = $2`,
            [passwordHash, id]
        )
        res.status(200).json(`Contraseña actualizada para el ususario ${id}`)
    } catch (error) {
        res.status(500).json(`Error al actualizar contraseña`);
        console.error(error)
    }
}
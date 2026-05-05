import express, { Application } from 'express';
import cors from 'cors'; // 1. Importar cors
import authRoutes from './routes/authRoutes.js';
import usuariosRoutes from './routes/usuarios.routes.js'
import productosRoutes from './routes/productos.routes.js'

const app: Application = express();

// 2. Configurar CORS
// Puedes dejarlo vacío app.use(cors()) para permitir todo, 
// o ser específico (más seguro):
app.use(cors({
  origin: 'http://localhost:5174', // Tu URL de Frontend (Vite)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);

export default app;
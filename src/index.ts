import 'dotenv/config';
import { initializeDatabase } from './db/datosIniciales.js'; // Importas la función que me pasaste

async function startServer() {
    try {
        // 1. PRIMERO inicializas la base de datos
        // Esto crea la tabla y el admin antes de seguir
        await initializeDatabase(); 

        // 2. DESPUÉS cargas el servidor
        const { default: app } = await import('./server.js');
        
        const PORT = process.env.PORT || 3005;
        app.listen(PORT, () => {
            console.log(`----------------------------------------------`);
            console.log(`🚀 Owl-Soft ERP corriendo en el puerto ${PORT}`);
            console.log(`----------------------------------------------`);
        });

    } catch (error) {
        console.error('💥 Error crítico al iniciar el sistema:', error);
        process.exit(1);
    }
}

// Ejecutas la función de arranque
startServer();
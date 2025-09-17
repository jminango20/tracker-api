import { Pool, PoolClient } from 'pg';

// Configuração do pool de conexões PostgreSQL
const poolConfig = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'tracker_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    
    // Pool settings
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

// Pool global de conexões
export const pool = new Pool(poolConfig);

// Classe helper para executar queries
export class DatabaseService {
    
    /**
     * Executa uma query simples
     */
    static async query(text: string, params?: any[]): Promise<any> {
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            
            // Log para queries lentas (>100ms)
            if (duration > 100) {
                console.log('Slow query detected:', {
                    text: text.substring(0, 100),
                    duration: `${duration}ms`,
                    rows: result.rowCount
                });
            }
            
            return result;
        } catch (error) {
            console.error('Database query error:', {
                text: text.substring(0, 100),
                params,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }
    
    /**
     * Verifica a saúde da conexão
     */
    static async healthCheck(): Promise<boolean> {
        try {
            const result = await pool.query('SELECT NOW() as current_time');
            return result.rows.length > 0;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Fechando pool de conexões PostgreSQL...');
    await pool.end();
});

process.on('SIGTERM', async () => {
    console.log('Fechando pool de conexões PostgreSQL...');
    await pool.end();
});
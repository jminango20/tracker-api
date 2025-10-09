import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import contractRoutes from './routes/addressDiscoveryRoutes';
import accessChannelRoutes from './routes/accessChannelManagerRoutes';
import schemaRegistryRoutes from './routes/schemaRegistryRoutes';
import processRegistryRoutes from './routes/processRegistryRoutes';
import assetRegistryRoutes from './routes/assetRegistryRoutes';
import transactionRoutes from './routes/transactionOrchestratorRoutes'; 
import healthRoutes from './routes/healthCheckRoutes';
import transactionDetailRoutes from './routes/transactionRoutes';
import assetHistoryRoutes from './routes/assetHistoryRoutes';
import { config } from './config/app';
import { checkConnection } from './config/blockchain';
import { IndexerService } from './services/events/indexerService'; // NOVO
import { AddressDiscoveryService } from './services/addressDiscoveryService'; // SEU SERVIÇO

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Tracker API Documentation'
}));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de contratos funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rotas de health check
app.use('/api', healthRoutes);

// Rotas de contratos usando AddressDiscovery
app.use('/addressDiscovery', contractRoutes);

// Rotas de canais de acesso
app.use('/accessChannel', accessChannelRoutes);

// Rotas de schemas
app.use('/schemas', schemaRegistryRoutes);

// Rotas de processos
app.use('/process', processRegistryRoutes);

// Rotas de assets
app.use('/assets', assetRegistryRoutes);

// Rotas de transações
app.use('/transaction', transactionRoutes);

// Rotas de análise de transações 
app.use('/txHash', transactionDetailRoutes);

// Rotas de histórico de assets
app.use('/assetHistory', assetHistoryRoutes);

async function startServer() {
  try {
    console.log('Testando conexão com blockchain...');
    const connected = await checkConnection();
    
    if (!connected) {
      console.error('Não foi possível conectar ao blockchain');
      process.exit(1);
    }

    // Se conectou, inicia o servidor
    app.listen(config.server.port, async () => {
      console.log('\nServidor iniciado!');
      console.log(`Porta: ${config.server.port}`);
      console.log(`URL: http://localhost:${config.server.port}`);
      console.log(`Documentação: http://localhost:${config.server.port}/api-docs`);
      console.log('\nRotas disponíveis:');
      console.log(' - Health Check: /api');
      console.log(' - Address Discovery: /addressDiscovery/*');
      console.log(' - Access Channels: /accessChannel/*');
      console.log(' - Schema Registry: /schemas/*');
      console.log(' - Process Registry: /process/*');
      console.log(' - Asset Registry: /assets/*');
      console.log(' - Transaction Orchestrator: /transaction/*');
      console.log(' - Transaction Details: /txHash/*');
      console.log('\n');

        try {
          const addressDiscovery = new AddressDiscoveryService();
          const indexer = new IndexerService(addressDiscovery);

          await indexer.start();
          console.log('Indexer ativo - processando eventos da blockchain\n');

          // Graceful shutdown
          process.on('SIGINT', async () => {
            console.log('\nParando serviços...');
            await indexer.stop();
            process.exit(0);
          });

          process.on('SIGTERM', async () => {
            console.log('\nParando serviços...');
            await indexer.stop();
            process.exit(0);
          });
          
        } catch (error) {
          console.error('Erro ao iniciar EventListener:', error);
        }
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
import express from 'express';
import contractRoutes from './routes/addressDiscoveryRoutes';
import accessChannelRoutes from './routes/accessChannelManagerRoutes';
import schemaRegistryRoutes from './routes/schemaRegistryRoutes';
import { config } from './config/app';
import { checkConnection } from './config/blockchain';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de contratos funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rotas de contratos usando AddressDiscovery
app.use('/addressDiscovery', contractRoutes);

// Rotas de canais de acesso
app.use('/accessChannel', accessChannelRoutes);

// Rotas de canais de acesso
app.use('/schemas', schemaRegistryRoutes);

async function startServer() {
  try {
    console.log('Testando conexão com blockchain...');
    const connected = await checkConnection();
    
    if (!connected) {
      console.error('Não foi possível conectar ao blockchain');
      process.exit(1);
    }

    // Se conectou, inicia o servidor
    app.listen(config.server.port, () => {
      console.log('\nServidor iniciado!');
      console.log(`Porta: ${config.server.port}`);
      console.log(`URL: http://localhost:${config.server.port}`);
      console.log('\nRotas disponíveis:');
      console.log('\n Use POST com JSON no body: {"contractName": "NomeDoContrato"}');
      console.log('\n');
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
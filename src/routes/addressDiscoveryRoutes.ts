import { Router } from "express";
import { AddressDiscoveryController } from "../controllers/addressDiscoveryController";

const router = Router();
const addressDiscoveryController = new AddressDiscoveryController();

// POST /addressDiscovery/getAddress - buscar endereço
router.post('/getAddress', (req, res) => {
    addressDiscoveryController.getAddress(req, res)
});

// POST /addressDiscovery/isRegistered - verificar registro
router.post('/isRegistered', (req, res) => { 
    addressDiscoveryController.isRegistered(req, res);
});

// POST /addressDiscovery/updateAddress - atualizar endereço
router.post('/updateAddress', (req, res) => {
    addressDiscoveryController.updateAddress(req, res);
});


export default router;
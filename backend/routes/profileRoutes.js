import express from 'express';
import profileController from '../controllers/profileController.js';
import { extractAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(extractAuthToken);

router.get('/', (req, res) => profileController.getCurrentProfile(req, res));
router.get('/stats', (req, res) => profileController.getProfileStats(req, res));
router.get('/check-reputation', (req, res) => profileController.checkReputationRequirement(req, res));
router.post('/', (req, res) => profileController.createProfile(req, res));
router.get('/:id', (req, res) => profileController.getProfile(req, res));
router.put('/:id', (req, res) => profileController.updateProfile(req, res));
router.delete('/:id', (req, res) => profileController.deleteProfile(req, res));
router.put('/:id/deduct-reputation', (req, res) => profileController.deductReputation(req, res));
router.put('/:id/points', (req, res) => profileController.updatePoints(req, res));
router.put('/:id/reputation', (req, res) => profileController.updateReputation(req, res));
router.post('/convert-points-to-reputation', (req, res) => profileController.convertPointsToReputation(req, res));

export default router;

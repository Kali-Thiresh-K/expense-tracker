const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/budget', budgetController.getBudget);
router.put('/budget', budgetController.updateBudget);

module.exports = router;
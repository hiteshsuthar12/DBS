const express = require('express');
const { getMenu, createMenuItem, updateMenuItem, getCategories, createCategory } = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Public routes for customer
router.get('/', getMenu);
router.get('/categories', getCategories);

// Protected routes for manager
router.use(protect);
router.use(authorize('MANAGER'));

router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.post('/categories', createCategory);

module.exports = router;

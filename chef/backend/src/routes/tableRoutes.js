const express = require('express');
const { getTables, getTable, createTable, updateTable, validateTable } = require('../controllers/tableController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/validate/:qrToken', validateTable);

router.use(protect);
router.use(authorize('MANAGER'));

router.route('/')
    .get(getTables)
    .post(createTable);

router.route('/:id')
    .get(getTable)
    .put(updateTable);

module.exports = router;

const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// --- Categories ---

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private/Manager
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

// --- Menu Items ---

// @desc    Get all menu items (Customer view)
// @route   GET /api/menu
// @access  Public
exports.getMenu = async (req, res, next) => {
    try {
        const menuItems = await MenuItem.find({ isActive: true }).populate('category');
        res.status(200).json({ success: true, data: menuItems });
    } catch (error) {
        next(error);
    }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Manager
exports.createMenuItem = async (req, res, next) => {
    try {
        const { name, description, price, image, category } = req.body;
        const menuItem = await MenuItem.create({
            name, description, price, image, category
        });
        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        next(error);
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Manager
exports.updateMenuItem = async (req, res, next) => {
    try {
        const { name, description, price, image, category, isAvailable, isActive } = req.body;
        
        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, {
            name, description, price, image, category, isAvailable, isActive
        }, {
            new: true,
            runValidators: true
        });

        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        res.status(200).json({ success: true, data: menuItem });
    } catch (error) {
        next(error);
    }
};

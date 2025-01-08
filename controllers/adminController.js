// controllers/adminController.js
const User = require('../models/User'); // Assuming you have a User model

// Get all users (Admin dashboard)
const getUsersByAdmin = async (req, res) => {
    try {
        const users = await User.find(); // You can add filters for pagination or active status
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Update user role (admin can change user roles)
const updateRoleByAdmin = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // { role: "admin" or "user" }

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role; // Update role
        await user.save();
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role' });
    }
};

// Delete user (Admin panel functionality)
const deleteUserByAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.remove();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

module.exports = { getUsersByAdmin, updateRoleByAdmin, deleteUserByAdmin };

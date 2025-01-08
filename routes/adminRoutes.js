// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getUsersByAdmin, updateRoleByAdmin, deleteUserByAdmin } = require('../controllers/adminController');
const verifyToken = require('../config/jwt');

// Admin Routes (Protected by JWT token verification)
router.get('/users', verifyToken, getUsersByAdmin); // List all users
router.put('/users/role/:id', verifyToken, updateRoleByAdmin); // Change user role
router.delete('/users/:id', verifyToken, deleteUserByAdmin); // Delete user

module.exports = router;

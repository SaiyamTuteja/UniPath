const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/adminController');

// All admin routes require auth + admin/faculty/staff role
const adminGuard = [protect, restrictTo('admin', 'faculty', 'staff')];

// Dashboard stats
router.get('/stats', adminGuard, ctrl.getStats);

// User management
router.get('/users', adminGuard, ctrl.getUsers);
router.patch('/users/:id/role', adminGuard, ctrl.updateUserRole);
router.delete('/users/:id', [protect, restrictTo('admin')], ctrl.deleteUser);

// Event management
router.get('/events', adminGuard, ctrl.getAllEvents);
router.post('/events', adminGuard, ctrl.adminCreateEvent);
router.patch('/events/:id', adminGuard, ctrl.adminUpdateEvent);
router.delete('/events/:id', adminGuard, ctrl.adminDeleteEvent);

// Lost & Found management
router.get('/lost-found', adminGuard, ctrl.getAllLostFound);
router.patch('/lost-found/:id/flag', adminGuard, ctrl.flagItem);
router.patch('/lost-found/:id/unflag', adminGuard, ctrl.unflagItem);
router.patch('/lost-found/:id/resolve', adminGuard, ctrl.adminResolveItem);
router.delete('/lost-found/:id', adminGuard, ctrl.adminDeleteItem);

module.exports = router;

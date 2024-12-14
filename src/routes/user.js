const express = require('express');
const router = express.Router();
const authorizeRoles = require('../middleware/roleAuthrize')

router.use(authorizeRoles("admin"));
router.post('/add-user',  async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const { orgId } = req.user; // Get orgId from the logged-in admin user

        // Ensure the role is valid (e.g., 'admin', 'editor', 'user')
        if (!['admin', 'editor', 'user'].includes(role)) {
            return res.status(400).json(createResponse(400, null, 'Invalid role provided.', null));
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json(createResponse(400, null, 'User already exists.', null));
        }

        // Create the new user with the same orgId as the admin
        const newUser = await User.create({ username, email, role, orgId });
        res.status(201).json(createResponse(201, newUser, 'User created successfully.', null));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(500, null, 'An error occurred while creating the user.', error.message));
    }
});



router.delete('/delete-user/:id',  async (req, res) => {
    try {
        const { id } = req.params;
        const { orgId } = req.user; // Get orgId from the logged-in admin user

        // Find the user to delete
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json(createResponse(404, null, 'User not found.', null));
        }

        // Ensure the user belongs to the same org
        if (userToDelete.orgId.toString() !== orgId.toString()) {
            return res.status(403).json(createResponse(403, null, 'User not in the same organization.', null));
        }

        // Prevent admins from deleting other admins
        if (userToDelete.role === 'admin') {
            return res.status(403).json(createResponse(403, null, 'Admins cannot delete other admins.', null));
        }

        await User.findByIdAndDelete(id);
        res.status(200).json(createResponse(200, null, 'User deleted successfully.', null));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(500, null, 'An error occurred while deleting the user.', error.message));
    }
});



router.put('/update-role/:id',  async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const { orgId } = req.user; // Get orgId from the logged-in admin user

        // Ensure the role is valid
        if (!['admin', 'editor', 'user'].includes(role)) {
            return res.status(400).json(createResponse(400, null, 'Invalid role provided.', null));
        }

        // Find the user to update
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json(createResponse(404, null, 'User not found.', null));
        }

        // Ensure the user belongs to the same org
        if (userToUpdate.orgId.toString() !== orgId.toString()) {
            return res.status(403).json(createResponse(403, null, 'User not in the same organization.', null));
        }

        // Prevent admins from updating other admins' roles
        if (userToUpdate.role === 'admin') {
            return res.status(403).json(createResponse(403, null, 'Admins cannot modify other admins\' roles.', null));
        }

        // Update the user's role
        userToUpdate.role = role;
        await userToUpdate.save();

        res.status(200).json(createResponse(200, userToUpdate, 'User role updated successfully.', null));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(500, null, 'An error occurred while updating the user role.', error.message));
    }
});



module.exports = router;
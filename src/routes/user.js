const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const authorizeRoles = require('../middleware/roleAuthrize');
const User = require("../models/users");
const bcrypt = require("bcrypt");
const createResponse = require('../utils/createResponse');
const ROLE = require('../config/roleConfig')

router.use(authorizeRoles(ROLE.admin));
router.post('/add-user', async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const { organization } = req.user; // Get organization from the logged-in admin user
        const orgId = new mongoose.Types.ObjectId(organization);

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json(createResponse(400, null, 'User already exists.', null));
        }

        // Create the new user with the same organization as the admin
        const newUser = await User.create({ name, email, role, organization: orgId, password: hashedPassword });
        res.status(201).json(createResponse(201, newUser, 'User created successfully.', null));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(500, null, 'An error occurred while creating the user.', error.message));
    }
});

router.put('/update-role/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const { organization } = req.user; // Get organization from the logged-in admin user


        // Find the user to update
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json(createResponse(404, null, 'User not found.', null));
        }

        // Ensure the user belongs to the same org
        if (userToUpdate.organization.toString() !== organization.toString()) {
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


router.delete('/delete-user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { organization } = req.user; // Get organization from the logged-in admin user
        // console.log("in delete ",id,organization)
        // Find the user to delete
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json(createResponse(404, null, 'User not found.', null));
        }
        console.log('userDeelet-->>', userToDelete)

        // Ensure the user belongs to the same org
        if (userToDelete.organization.toString() !== organization.toString()) {
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




module.exports = router;
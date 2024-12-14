const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const Organization = require("../models/organization");
const createResponse = require('../utils/createResponse');
const jwt = require('jsonwebtoken');


const router = express.Router();

// Create Organization and Admin User
router.post("create-organization-admin", async (req, res) => {
    const { name, email, password, organizationName } = req.body;

    // Input validation
    if (!name || !email || !password || !organizationName) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if the organization already exists
        const existingOrganization = await Organization.findOne({ name: organizationName });
        if (existingOrganization) {
            res.status(400).json(createResponse(400, null, "Organization name already exists.", error.message));
            return res.status(400).json({ message: "Organization name already exists." });
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already in use." });
        }

        // Create a new organization
        const newOrganization = new Organization({ name: organizationName });
        await newOrganization.save();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            organization: newOrganization._id, // Reference the organization
        });

        await newUser.save();

        res.status(201).json(createResponse(201, null, "Organization and Admin User created successfully.", null));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(500, null, "An error occurred while creating the organization and admin user.", error.message));
    }
});


router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json(
                createResponse(400, null, 'Bad Request, Reason: Missing Field', null)
            );
        }

        // Check if user exists
        const user = await User.findOne({ email }, { "password": 1, "role": 1, "email": 1, "organization": 1 });

        if (!user) {
            return res.status(404).json(createResponse(404, null, 'User not found.', null));
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(400, null, 'Incorrect password.', null));
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                email: user.email,
                role: user.role,
                organization: user.organization,
            },
            process.env.JWT_SECRET, // JWT secret key (store it securely in .env)
            { expiresIn: '1h' } // Token expiration time
        );

        // Send response with the token
        res.status(200).json(createResponse(200, { token }, 'Login successful.', null));

    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(500, null, 'An error occurred during login.', error.message));
    }
});

module.exports = router;

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize');
require('dotenv').config()

const router = express.Router()
const prisma = new PrismaClient()

// router.get('/', (req, res) => {
//     res.send('Test endpoint is working!');
// });
router.use(authorize)
router.post('/', async (req, res) => {
    const { token, expires_at } = req.body
    const userId = parseInt(req.authUser.sub, 10) //hämtar user id från JWT som är en sträng och konverterar till nummer
    console.log(`Creating token for user ID: ${userId}`)

    try {
        const newToken = await prisma.refresh_tokens.create({
            data: {
                user_id: userId,
                token: token,
                expires_at: expires_at
            }
        })
        console.log(`New board created with ID: ${newToken.id}`)

        res.status(201).json({ msg: "new token" })
    } catch (error) {
        console.error("Error creating token:", error)
        res.status(500).json({ error: "Failed to create token." })
    }
})

router.delete('/', async (req, res) => {
    const userId = parseInt(req.authUser.sub, 10) 
    console.log(`Deleting tokens for user ID: ${userId}`)

    try {
        const deletedToken = await prisma.refresh_tokens.delete({
            where: { user_id: userId }
        })
        console.log(`Deleted token for user ID: ${userId}`)

        res.status(200).json({ msg: "token deleted" })
    } catch (error) {
        console.error("Error deleting token:", error)
        res.status(500).json({ error: "Failed to delete token." })
    }
})

module.exports = router
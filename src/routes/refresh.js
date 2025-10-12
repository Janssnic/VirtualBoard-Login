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
//router.use(authorize)
router.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body

    if (!refresh_token) {
        return res.status(400).json({ error: 'Missing refresh token' })
    }

    try {
        const storedToken = await prisma.refresh_tokens.findUnique({
            where: { token: refresh_token }
        });

        if (!storedToken) {
            return res.status(401).json({ error: 'Invalid refresh token' })
        }

//SIGNA RÄTT INFO HIT (SUB, NAME, LASTNAME, EMAIL)
        const newAccessToken = jwt.sign(
            { sub: storedToken.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        res.json({ token: newAccessToken })

    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


router.post('/', async (req, res) => {
    const userId = parseInt(req.refreshToken.sub, 10) //hämtar user id från JWT som är en sträng och konverterar till nummer
    const expires_at = parseInt(req.refreshToken.expires_at, 10)
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
        const deletedToken = await prisma.refresh_tokens.deleteMany({
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
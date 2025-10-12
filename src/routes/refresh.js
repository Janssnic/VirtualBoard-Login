const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

require('dotenv').config()

const router = express.Router()
const prisma = new PrismaClient()

// router.get('/', (req, res) => {
//     res.send('Test endpoint is working!');
// });

router.post('/refresh', async (req, res) => {
    const { refresh_token, token } = req.body

    if (!refresh_token || !token) {
        return res.status(400).json({ error: 'Missing refresh or access token' })
    }


    try {
        const storedToken = await prisma.refresh_tokens.findFirst({
            where: { token: refresh_token }
        });

        if (!storedToken) {
            return res.status(401).json({ error: 'Invalid refresh token' })
        }

        const decoded = jwt.decode(token)
        if (!decoded?.sub) {
            return res.status(401).json({ error: 'Invalid access token' })
        }
        const existingUser = await prisma.users.findUnique({
            where: { user_id: decoded.sub }
        })

        if (!existingUser) {
            return res.status(401).json({ error: 'User not found' })
        }

        //SIGNA RÄTT INFO HIT (SUB, NAME, LASTNAME, EMAIL)
        const newAccessToken = jwt.sign(
            {
                sub: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                lastname: existingUser.lastname,
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        res.json({ token: newAccessToken })

    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

const authorize = require('../middleware/authorize')
router.use(authorize)

router.post('/token', async (req, res) => {
    console.log("token called")
    try {
        const userId = parseInt(req.authUser.sub, 10) //hämtar user id från JWT som är en sträng och konverterar till nummer
        const { refreshToken, expires_at } = req.body
        console.log(`Creating token for user ID: ${userId}`)

        await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } })

        const newToken = await prisma.refresh_tokens.create({
            data: {
                user_id: userId,
                token: refreshToken,
                expires_at: new Date(expires_at)
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
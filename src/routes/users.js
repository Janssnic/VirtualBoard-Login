const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt");

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    try {
       const allUsers = await prisma.users.findMany({
        select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true
        }
    })
    res.json(allUsers) 
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error fetching users" })
    }
    
    
})

router.post('/', async (req, res) => {
    const { name, lastname, email, password } = req.body

    if (!name || !lastname || !email || !password) {
        return res.status(400).json({ error: "Fill all the fields." });
    }

    try {
        const existingUser = await prisma.users.findUnique({
            where: { email }
        })
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.users.create({
            data: {
                name,
                lastname,
                email,
                role: "user",
                password_hash: hashedPassword
            }
        })
        res.json({ msg: "New user created!", user: newUser })
        console.log("user created")
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Error: POST failed!" })
    }

})

module.exports = router
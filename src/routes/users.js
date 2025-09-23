const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize');
require('dotenv').config()

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    try {
        const allUsers = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                lastname: true,
                role: true,
                email: true,
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



router.post('/register', async (req, res) => {
    //tar emot givna informationen från request bodyn
    const { name, lastname, email, password } = req.body

    //om någon fält fattas ges en error
    if (!name || !lastname || !email || !password) {
        return res.status(400).json({ error: "Fill all the fields." });
    }

    //checkar att email är inte redan i databaset
    try {
        const existingUser = await prisma.users.findUnique({
            where: { email }
        })
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        //hashar lösenordet
        const hashedPassword = await bcrypt.hash(password, 10)

        //tar datan som användaren har gett och sätter in i databasen
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

router.post('/login', async (req, res) => {
    const { email, password } = req.body //tar emot email och password

    //checkar att båda fält har blivit fyllda
    if (!email || !password) {
        return res.status(400).json({ error: "Fill all the fields." });
    }


    //checkar om e-post har redan användts
    try {
        const existingUser = await prisma.users.findUnique({
            where: { email }
        }) //om email är fel ges en error
        if (!existingUser) {
            return res.status(400).json({ error: "User not found." });
        }

        //checkar att givna lösenordet matchar med den i databasen
        const matchingPassword = await bcrypt.compare(password, existingUser.password_hash)
        //error om det är fel
        if (!matchingPassword) {
            return res.status(400).json({ error: "Password not correct." });
        }

        const token = jwt.sign({
            sub: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            lastname: existingUser.lastname,
            role: existingUser.role
        }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.json({ msg: "User logged in!", user: existingUser.name, id: existingUser.id, jwt: token })
        console.log("Login approved")
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Error: Login failed!" })
    }

})

module.exports = router
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8080

console.log(`Node.js ${process.version}`)

app.use(express.json())

async function test() {
    const users = await prisma.users.findMany()
    console.log(users)
    return users
}



app.get('/', async (req, res) => {
    try {
        const users = await prisma.users.findMany()
        res.json({ msg: "Hello render", users })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})



app.listen(PORT, () => {
    try {
        console.log(`Running on http://localhost:${PORT}`)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    
})
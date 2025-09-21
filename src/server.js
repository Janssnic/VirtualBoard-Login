const express = require('express')
const usersRouter = require('./routes/users')
const boardsRouter = require('./routes/boards')

const PORT = process.env.PORT || 8080

require('dotenv').config()
const app = express()


console.log(`Node.js ${process.version}`)

app.use(express.json())


app.get('/', (req, res) => {
    res.json({ msg: "Hello render and prisma" })
})

app.use('/users', usersRouter)
app.use('/boards', boardsRouter)


app.listen(PORT, () => {
    try {
        console.log(`Running on http://localhost:${PORT}`)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    
})
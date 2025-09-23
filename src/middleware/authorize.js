const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
    console.log('Authorize JWT')
    try {
        const authHeader = req.headers['authorization']

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: "Missing or invalid Authorization header" })
        }

        const token = authHeader.split(' ')[1]

        console.log(token)

        const user = jwt.verify(token, process.env.JWT_SECRET)

        req.authUser = user //sparar JWT:ns innehåll i requesten

        console.log(`token valid for user: ${user.sub} ${user.name} ${req.authUser}`)

        next()

    } catch (error) {
        console.log(error)
        res.status(401).json({ msg: "Authorization failed!", error: error.message})
    }
}
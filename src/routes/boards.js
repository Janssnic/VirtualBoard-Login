const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/authorize')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authorize)

//get alla boards
/*router.get('/', async (req, res) => {
    try {
        const allBoards = await prisma.board.findMany({
            where: {userId: req.authUser.sub},
            select: {
                id: true,
                title: true,
            }
        })
        res.json(allBoards)
        console.log("Here are you boards!")
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error fetching boards" })
    }


})*/

router.get('/', async (req, res) => {
    const userId = parseInt(req.authUser.sub, 10) //hämtar user id från JWT

    try { //söker från users tabellen id:n
        const userBoards = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                boards: { //väljer boards som user är med i
                    select: {
                        board: {
                            select: { //väljer id, title och created at från tabellen
                                id: true,
                                title: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });

        res.json(userBoards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user boards' });
    }
});

module.exports = router
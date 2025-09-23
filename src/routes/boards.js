const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/authorize')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authorize)

//get alla boards
router.get('/', async (req, res) => {
    try {
        const allBoards = await prisma.board.findMany({
            where: {author_id: req.authUser.sub},
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


})

router.get('/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try { //söker från users tabellen id:n
        const userBoards = await prisma.users.findUnique({
            where: { id: userId, author_id: req.authUser.sub},
            select: {
                id: true,
                name: true,
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
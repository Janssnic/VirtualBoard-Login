const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize');
require('dotenv').config()

const router = express.Router()
const prisma = new PrismaClient()



module.exports = router
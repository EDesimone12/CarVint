const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/home', (req, res) => {
    res.render('index');
})

router.get('/add', (req, res) => {
    res.render('add');
})

router.get('/myCars', (req, res) => {
    res.render('myCars');
})

module.exports = router;

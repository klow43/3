const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

//Get pictures listing.
router.get('/', function(req, res, next) {
    const pictures = fs.readdirSync(path.join(__dirname, '../pictures/'));
    res.render('pictures', { pictures : pictures})
});

router.post('/', function(req, res, next) {
    const file = req.files.file;
    fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);  
    res.end();
});


module.exports = router;
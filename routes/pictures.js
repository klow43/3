const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

//Get pictures listing.
router.get('/', function(req, res, next) {
    const pictures = fs.readdirSync(path.join(__dirname, '../pictures/'));
    res.render('pictures', { pictures : pictures})
});

//display file of params.
router.get('/:pictureName', function(req, res, next) {
    const pictureName = req.params.pictureName;
    const pictures = fs.readdirSync(path.join(__dirname, '../pictures/'));
    let result = pictures.filter(picture => picture == pictureName)
    res.render('pictures', { pictures : result })
})

//post new file
router.post('/', function(req, res, next) {
    const file = req.files.file;
    fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);  
    res.end();
});


module.exports = router;
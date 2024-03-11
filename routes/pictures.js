const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').supress = true;
const s3 = new AWS.S3();

//Get pictures listing.
router.get('/', async function(req, res, next) {
    const params = {
        Bucket : process.env.CYCLIC_BUCKET_NAME,
        Delimiter : '/',
        Prefix : 'public/'
    };
    const allObjects = await s3.listObjects(params).promise();
    const keys = allObjects?.Contents.map( x => x.Key );
    const pictures = await Promise.all(keys.map( async (key) => {
        let my_file = await s3.getObject({
            Bucket : process.env.CYCLIC_BUCKET_NAME,
            Key : key,
        }).promise();
        return {
            src : Buffer.from(my_file.Body).toString('base64'),
            name : key.split('/'.toUpperCase())
        }
    })) 
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
router.post('/', async function(req, res, next) {
    const file = req.files.file;
    await s3.putObject({
        Body : file.data,
        Bucket : process.env.CYCLIC_BUCKET_NAME,
        Key : 'public/' + file.name,
    }).promise();
    res.end();
});


module.exports = router;
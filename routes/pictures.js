const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const s3 = new AWS.S3();
const { requiresAuth } = require('express-openid-connect');

//Get pictures listing.
router.get('/', requiresAuth(), async function(req, res, next) {
    const params = {
        Bucket : process.env.CYCLIC_BUCKET_NAME,
        Delimiter : '/',
        Prefix : req.oidc.user.email + '/'
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
            name : key.split('/').pop()
        }
    })) 
    res.render('pictures', { pictures : pictures, isAuthenticated: req.oidc.isAuthenticated()})
});

//display file of params.
router.get('/:pictureName', requiresAuth(), async function(req, res, next) {
    const pictureName = 'public/' + req.params.pictureName;
        const result = await s3.getObject({
            Bucket : process.env.CYCLIC_BUCKET_NAME,
            Key : pictureName,
        }).promise();
    let pictures =  [{ src : Buffer.from(result.Body).toString('base64'), name : pictureName.split('/').pop() }]
    res.render('pictures', { pictures : pictures, isAuthenticated: req.oidc.isAuthenticated() })
})

//post new file
router.post('/', requiresAuth(), async function(req, res, next) {
    const file = req.files.file;
    await s3.putObject({
        Body : file.data,
        Bucket : process.env.CYCLIC_BUCKET_NAME,
        Key : req.oidc.user.email + '/' + file.name,
    }).promise();
    res.end();
}); 


module.exports = router;
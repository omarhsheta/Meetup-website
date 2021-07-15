const usrImgs = require('../models/users.images.model');
const fs = require('fs');
const FileType = require('file-type');

exports.setUserImage = async function (req, res) {
    console.log(`Requesting to set the user ${req.params.id}'s image...`);
    try {
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send('');
        } else {
            let token = req.headers["x-authorization"];
            let userId = req.params.id;
            let image = req.body;
            let type = await FileType.fromBuffer(image);
            let extension = type.ext;
            req.headers["content-type"] = type.mime;
            const result = await usrImgs.setUserImage(userId, token, image, extension);
            if (result === 403) {
                res.status(403)
                    .send('');
            } else if (result === 404) {
                res.status(404)
                    .send('');
            } else if (result === 201) {
                res.status(201)
                    .send('');
            } else {
                res.status(200)
                    .send('');
            }
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`)
    }
}

exports.getUserImage = async function (req, res) {
    console.log(`Requesting to get the user ${req.params.id}'s image...`);
    try {
        const result = await usrImgs.getImage(req.params.id);
        if (result === 404) {
            res.status(404)
                .send("User or image not found!");
        } else {
            let img = fs.readFileSync(result);
            let type = await FileType.fromBuffer(img);
            res.setHeader("content-type",type.mime);
            res.status(200)
                .send(img);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.deleteUserImage = async function (req, res) {
    console.log(`Requesting to delete user ${req.params.id}'s image...`);
    try {
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send('');
        } else {
            let token = req.headers["x-authorization"];
            let userId = req.params.id;
            const result = await usrImgs.deleteUserImage(userId, token);
            if (result === 404) {
                res.status(404)
                    .send('');
            } else if (result === 403) {
                res.status(403)
                    .send('');
            } else {
                res.status(200)
                    .send('');
            }
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}
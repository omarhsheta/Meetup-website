const eventImg = require('../models/events.images.model');
const fs = require('fs');
const FileType = require('file-type');

exports.getEventImage = async function (req, res) {
    console.log(`Requesting to get the event ${req.params.id}'s image...`);
    try {
        const result = await eventImg.getImage(req.params.id);
        if (result === 404) {
            res.status(404)
                .send("Event or image not found!");
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

exports.setEventImage = async function (req, res) {
    console.log(`Requesting to set the event ${req.params.id}'s image...`);
    let isInvalid = (req.headers["content-type"] !== "image/png" && req.headers["content-type"] !== "image/jpeg" && req.headers["content-type"] !== "image/gif")
    try {
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send('');
        } else if (isInvalid) {
            res.status(400)
                .send('');
        } else {
            let token = req.headers["x-authorization"];
            let eventId = req.params.id;
            let image = req.body;
            let type = await FileType.fromBuffer(image);
            if (type === undefined) {
                res.status(400)
                    .send('');
            } else {
                let extension = type.ext;
                req.headers["content-type"] = type.mime;
                const result = await eventImg.setEventImage(eventId, token, image, extension);
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
            }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`)
    }
}
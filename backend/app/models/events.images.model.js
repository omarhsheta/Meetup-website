const db = require('../../config/db');
const imgDirectory = "./storage/images";
const fs = require('mz/fs');

/**
 * Obtains the image of the event.
 * @param eventId The event to obtain the image from.
 * @returns {Promise<string|number>}
 */
exports.getImage = async function (eventId) {
    console.log(`Requesting to get image from event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findEvent] = await conn.query(`SELECT id, image_filename AS img FROM event WHERE id=${eventId}`);
        conn.release();
        if (findEvent.length === 0 || findEvent[0].img === null) {
            return 404;
        } else {
            return imgDirectory + "/" + findEvent[0].img;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * To set the event's image. Is only accessible by the event organizer.
 * @param eventId The event to have its image set/replaced.
 * @param token The token of the current user
 * @param image The image to be uploaded to the event
 * @param extension The image's file extension
 * @returns {Promise<number>}
 */
exports.setEventImage = async function (eventId, token, image, extension) {
    console.log(`Requesting to set image for event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findEvent] = await conn.query(`SELECT id, organizer_id, image_filename FROM event WHERE id=${eventId}`);
        const [findOrganizer] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
        if (findEvent.length === 0) {
            conn.release();
            return 404;
        } else if (findOrganizer.length === 0 || findOrganizer[0].id !== findEvent[0].organizer_id) {
            conn.release();
            return 403;
        } else {
            let filename = `event_${eventId}.`+extension;
            fs.writeFile(imgDirectory+'/'+filename, image);
            let result = 201;
            const [updateUser] = await conn.query(`UPDATE event SET image_filename='${filename}' WHERE id=${eventId}`);
            conn.release();
            if (findEvent[0].image_filename === null) {
                return 201;
            } else {
                return 200;
            }
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}
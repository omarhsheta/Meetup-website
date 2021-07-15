const db = require('../../config/db');
const imgDirectory = "./storage/images";
const fs = require('mz/fs');

/**
 * Sets up or replaces the user's image, only accessible by the said user only.
 * @param userId The user
 * @param token The current user's token
 * @param image The image to be uploaded to the user
 * @param extension The image's file extension
 * @returns {Promise<number>}
 */
exports.setUserImage = async function (userId, token, image, extension) {
    console.log(`Requesting to set image for user ${userId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [confirmUser] = await conn.query(`SELECT id, auth_token, image_filename FROM user WHERE id=${userId}`);
        if (confirmUser.length === 0) {
            conn.release();
            return 404;
        } else if (confirmUser[0].auth_token !== token) {
            conn.release();
            return 403;
        } else {
            let filename = `user_${userId}.`+extension;
            fs.writeFile(imgDirectory+'/'+filename, image);
            let result = 201;
            const [updateUser] = await conn.query(`UPDATE user SET image_filename='${filename}' WHERE id=${userId}`);
            conn.release();
            if (confirmUser[0].image_filename === null) {
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

/**
 * Obtains the image from a particular user with a given userId
 * @param userId The user's id
 * @returns {Promise<string|number>}
 */
exports.getImage = async function (userId) {
    console.log(`Requesting to get image from user ${userId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findUser] = await conn.query(`SELECT id, image_filename AS img FROM user WHERE id=${userId}`);
        conn.release();
        if (findUser.length === 0 || findUser[0].img === null) {
            return 404;
        } else {
            return imgDirectory + "/" + findUser[0].img;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Deletes the user's image, and is only accessible by the said user.
 * @param userId The user's id
 * @param token The current user's token
 * @returns {Promise<number>}
 */
exports.deleteUserImage = async function (userId, token) {
    console.log(`Requesting to delete image from user ${userId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findUser] = await conn.query(`SELECT id, image_filename AS img, auth_token AS token FROM user WHERE id=${userId}`);
        if (findUser.length === 0 || findUser[0].img === null) {
            conn.release();
            return 404;
        } else if (findUser[0].token !== token) {
            conn.release();
            return 403;
        } else {
            const [updateUser] = await conn.query(`UPDATE user SET image_filename=null WHERE id=${userId}`);
            conn.release();
            return 200;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}
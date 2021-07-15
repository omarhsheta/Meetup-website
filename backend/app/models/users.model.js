const db = require('../../config/db');
const passwordHash = require('../../node_modules/password-hash');
const crypto = require('crypto');

/**
 * Obtains information about a particular user. If the logged in user obtains information about themselves,
 * they also get to see their email as well as their name.
 * @param id The user's id
 * @param token The current user's token
 * @returns {Promise<number|*>}
 */
exports.getUser = async function (id, token) {
    console.log(`Request to fetch information about user ${id}`);
    try {
        const conn = await db.getPool().getConnection();
        let query = `SELECT first_name AS firstName, last_name AS lastName FROM user WHERE id = ${id}`;
        const [tokenId] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
        let authorizedId = null;
        if (tokenId.length > 0) {
            authorizedId = tokenId[0].id.toString()
        }
        if (id === authorizedId) {
            query = `SELECT first_name AS firstName, last_name AS lastName, email FROM user WHERE id = ${id}`;
        }
        const [rows] = await conn.query(query);
        conn.release();
        if (rows.length === 0) {
            return 404;
        } else {
            return rows[0];
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}


exports.modifyUser = async function (id, fName, lName, email, newPass, curPass, token) {
    console.log(`Updating user ${id}'s password....`);
    try {
        if (token === undefined || token.length === 0) {
            return 401;
        } else {
            const conn = await db.getPool().getConnection();
            const [getUser] = await conn.query(`SELECT id, password, auth_token FROM user WHERE id=${id}`);
            const [getToken] = await conn.query(`SELECT id, password, auth_token FROM user WHERE auth_token='${token}'`);
            if (getUser.length === 0) {
                conn.release();
                return 404;
            } else if (getToken.length === 0) {
                conn.release();
                return 401;
            } else if (getToken[0].id !== getUser[0].id) {
                conn.release();
                return 403;
            } else if (!passwordHash.verify(curPass, getToken[0].password)) {

                conn.release();
                return 400;
            } else {
                let changes = ``;
                if (fName !== undefined) {
                    changes += `first_name = '${fName}' `;
                }
                if (lName !== undefined) {
                    changes += `last_name = '${lName}'`;
                }
                if (email !== undefined) {
                    changes += `email = '${email}'`;
                }
                if (newPass !== undefined) {
                    changes += `password = '${passwordHash.generate(newPass)}'`;
                }
                let query = `UPDATE user SET ${changes}WHERE id=${id}`;
                const [modifyUsr] = await conn.query(query);
                conn.release();
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
 * Registers the current user
 * @param user The user's information
 * @returns {Promise<*>}
 */
exports.registerUser = async function (user) {
    console.log(`Registering ${user.firstName} ${user.lastName}`)
    try {
        const conn = await db.getPool().getConnection();
        const query = `INSERT INTO user (first_name, last_name, email, password) VALUES ('${user.firstName}', '${user.lastName}', '${user.email}', '${passwordHash.generate(user.password)}')`;
        const [rows] = await conn.query(query);
        const [id] = await conn.query(`SELECT id AS userId FROM user WHERE email='${user.email}'`);
        conn.release();
        return id[0];
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Logs in the user.
 * @param email the user's email
 * @param password the user's password
 * @returns {Promise<boolean|number|*>}
 */
exports.login = async function (email, password) {
    console.log(`Logging in with ${email}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findUser] = await conn.query (`SELECT password FROM user WHERE email='${email}'`);
        if (findUser.length === 0) {
            conn.release();
            return 404;
        }
        if (passwordHash.verify(password, findUser[0].password)) {
            var token = crypto.randomBytes(16);
            const [updateToken] = await conn.query(`UPDATE user SET auth_token='${token.toString('hex')}' WHERE email='${email}'`);
            const [getLogin] = await conn.query(`SELECT id AS userId, auth_token AS token FROM user WHERE email='${email}'`);
            conn.release();
            return getLogin[0];
        } else {
            return false;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Logs out the user with a given x-authentication token
 * @param x The x-authentication token
 * @returns {Promise<number>}
 */
exports.logout = async function (x) {
    console.log(`Logging out...`);
    try {
        const conn = await db.getPool().getConnection();
        const [findUser] = await conn.query(`SELECT id FROM user WHERE auth_token='${x}'`);
        if (findUser.length === 0) {
            return 401;
        } else {
            let logoutId = findUser[0].id;
            const [logout] = await conn.query(`UPDATE user SET auth_token = null WHERE id=${logoutId}`);
            conn.release();
            return 200;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}
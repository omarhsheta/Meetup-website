const db = require('../../config/db');

/**
 * Obtains the attendees of a particular event with a given eventId, and it is only accessible to the event organizer
 * @param token The current user's token
 * @param eventId The event's id
 * @returns {Promise<number|*>}
 */
exports.getAttendees = async function (token, eventId) {
    console.log(`Requesting to fetch attendees of the event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findEvent] = await conn.query(`SELECT event_id FROM event_attendees WHERE event_id=${eventId}`);
        if (findEvent.length === 0) {
            conn.release();
            return 404;
        }
        let query = `SELECT event_attendees.user_id AS attendeeId, user.first_name AS firstName, user.last_name AS lastName, event_attendees.date_of_interest AS dateOfInterest, attendance_status.name AS status FROM event_attendees JOIN user ON event_attendees.user_id=user.id JOIN attendance_status ON event_attendees.attendance_status_id=attendance_status.id WHERE event_attendees.event_id=${eventId}`;
        if (token !== undefined) {
            const [findAuth] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
            const [findOrganizer] = await conn.query(`SELECT organizer_id FROM event WHERE id=${eventId}`);
            if (findAuth[0].id === findOrganizer[0].organizer_id) {
                const [organizerDetails] = await conn.query(`SELECT attendance_status_id FROM event_attendees WHERE event_id=${eventId} AND user_id=${findAuth[0].id}`);
                if (organizerDetails[0].attendance_status === 1) {
                    query += ' ORDER BY dateOfInterest ASC';
                } else {
                    query += ` AND event_attendees.attendance_status_id=1 OR event_attendees.user_id=${findAuth[0].id} ORDER BY dateOfInterest ASC`
                }
            } else {
                query += ' AND event_attendees.attendance_status_id=1 ORDER BY dateOfInterest ASC'
            }
        } else {
            query += ' AND event_attendees.attendance_status_id=1 ORDER BY dateOfInterest ASC'
        }
        const [getAttendees] = await conn.query(query);
        conn.release();
        return getAttendees;
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Makes the current user join an event with the given eventId, the current user must be logged in.
 * @param token The current user's token
 * @param eventId The event's id
 * @returns {Promise<number>}
 */
exports.joinEvent = async function (token, eventId) {
    console.log(`Requesting to join the event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findUser] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
        if (findUser.length === 0) {
            conn.release();
            return 401;
        }
        const [findEvent] = await conn.query(`SELECT id, date FROM event WHERE id=${eventId}`);
        if (findEvent.length === 0) {
            conn.release();
            return 404;
        }
        const [checkJoined] = await conn.query(`SELECT id FROM event_attendees WHERE event_id=${eventId} AND user_id=${findUser[0].id}`);
        if (checkJoined.length > 0) {
            conn.release();
            return 403.1;
        }
        if (Date.now() >= Date.parse(findEvent[0].date)) {
            conn.release();
            return 403.2
        }
        const [join] = await conn.query(`INSERT INTO event_attendees (event_id, user_id, attendance_status_id) VALUES (${eventId}, ${findUser[0].id}, 2)`);
        conn.release();
        return 201;

    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Makes the current user unjoin an event. They must be logged in.
 * @param token The current user's token
 * @param eventId The event's id
 * @returns {Promise<number>}
 */
exports.unjoinEvent = async function (token, eventId) {
    console.log(`Requesting to unjoin the event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findUser] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
        if (findUser.length === 0) {
            conn.release();
            return 401;
        }
        const [findEvent] = await conn.query(`SELECT id, date FROM event WHERE id=${eventId}`);
        if (findEvent.length === 0) {
            conn.release();
            return 404;
        }
        const [checkJoined] = await conn.query(`SELECT id, attendance_status_id as status FROM event_attendees WHERE event_id=${eventId} AND user_id=${findUser[0].id}`);
        if (checkJoined.length === 0) {
            conn.release();
            return 403.1;
        }
        if (Date.now() >= Date.parse(findEvent[0].date)) {
            conn.release();
            return 403.2;
        }
        if (checkJoined[0].status === 3) {
            conn.release();
            return 403.3;
        }
        const [deleteAttendee] = await conn.query(`DELETE FROM event_attendees WHERE event_id=${eventId} AND user_id=${findUser[0].id}`);
        conn.release();
        return 200;
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Changes the event attendee's attendance status. Is only accessible by the event organizer only.
 * @param eventId The event the attendee is attending
 * @param userId The attendee's id
 * @param token The event organizer's token
 * @param status The status to be changed to
 * @returns {Promise<number>}
 */
exports.changeStatus = async function (eventId, userId, token, status) {
    console.log(`Attempting to change the attendance status of user ${userId} in the event ${eventId}`);
    try {
        if (status !== "accepted" && status !== "pending" && status !== "rejected") {
            return 400
        } else {
            const conn = await db.getPool().getConnection();
            const [findEvent] = await conn.query(`SELECT id, organizer_id FROM event WHERE id=${eventId}`);
            if (findEvent.length === 0) {
                conn.release();
                return 404;
            }
            const [findOrganizer] = await conn.query(`SELECT id, auth_token AS token FROM user WHERE auth_token='${token}'`);
            if (findOrganizer.length === 0) {
                conn.release();
                return 401;
            } else if (findOrganizer[0].id !== findEvent[0].organizer_id) {
                conn.release();
                return 403;
            } else {
                let statusId = 0
                if (status === "accepted") {
                    statusId = 1;
                } else if (status === "pending") {
                    statusId = 2;
                } else if (status === "rejected") {
                    statusId = 3;
                }
                const [updateAttendance] = await conn.query(`UPDATE event_attendees SET attendance_status_id=${statusId} WHERE event_id=${eventId} AND user_id=${userId}`);
                console.log(`UPDATE event_attendees SET attendance_status_id=${statusId} WHERE event_id=${eventId} AND user_id=${userId}`)
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
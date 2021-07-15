const db = require('../../config/db');

/**
 * Universally used in this function to reformat the query responses to be compliant with the assignment specifications
 * @param rows returned rows by the query
 * @param categoriesId
 * @returns {[]}
 */
const categoryFixer = function (rows, categoriesId) {
    let newList = []
    for (i = 0; i < rows.length; i++) {
        let matches = false;
        rows[i]["date"] = new Date(rows[i]["date"].getTime() - rows[i]["date"].getTimezoneOffset() * 60000);
        temp = rows[i].categories.split(',');
        if (categoriesId !== undefined) {
            for (k = 0; k < categoriesId.length; k++) {
                if (temp.includes(categoriesId[k])) {
                    matches = true;
                    break;
                }
            }
        }
        if (matches || categoriesId === undefined) {
            rows[i].categories = [];
            for (j = 0; j < temp.length; j++) {
                rows[i].categories.push(parseInt(temp[j]));
            }
            newList.push(rows[i]);
        }
    }
    return newList;
}



/**
 * Returns all events.
 * @returns {Promise<*>}
 */
exports.getAllEvents = async function(query) {
    console.log(`Request to get all events from the database...`)
    try {
        const conn = await db.getPool().getConnection();
        const [ rows ] = await conn.query( query );
        conn.release();
        for (i = 0; i < rows.length; i++) {
            rows[i]["date"] = new Date(rows[i]["date"].getTime() - rows[i]["date"].getTimezoneOffset() * 60000);
            temp = rows[i].categories.split(',');
            rows[i].categories = [];
            for (j = 0; j < temp.length; j++) {
                rows[i].categories.push(parseInt(temp[j]));
            }
        }
        return rows;
    } catch (err) {
        console.log(`ERROR: Something went wrong with obtaining the events...`)
        console.log(err.sql);
        throw err;
    }
}

/**
 * Will return multiple filtered events.
 * @param params Contains all the potential parameters for the query
 * @returns {Promise<*|undefined>}
 */
exports.getEvents = async function(params) {
    console.log(`Request to get events with parameters...`);
    const default_Search = "SELECT event.id as eventId, event.title as title, event.capacity as capacity, user.first_name as organizerFirstName, user.last_name as organizerLastName, event.date as date, GROUP_CONCAT(DISTINCT event_category.category_id) as categories, COUNT(DISTINCT event_attendees.user_id) as numAcceptedAttendees FROM attendance_status, event INNER JOIN event_category ON event.id = event_category.event_id INNER JOIN event_attendees ON event_category.event_id = event_attendees.event_id INNER JOIN user ON event.organizer_id = user.id";
    try {
        const conn = await db.getPool().getConnection();
        var startIndex = count = q = categoryIds = organizerId = sortBy = false;
        var query = default_Search;
        var sorting = ' ORDER BY '
        var whereClause = ' WHERE event_attendees.attendance_status_id = 1';
        var noParams = true;
        /**
         * Checks if any of the parameters have been passed.
         */
        if ('startIndex' in params) {
            startIndex = true;
        }
        if ('count' in params) {
            count = true;
        }
        if ('q' in params) {
            q = true;
        }
        if ('categoryIds' in params) {
            categoryIds = true;
            if (typeof params.categoryIds === "string") {
                const [row] = await conn.query(`SELECT id FROM category WHERE id=${params.categoryIds}`);
                if (row.length === 0) {
                    conn.release();
                    return 400;
                }
            } else {
                for (i = 0; i < params.categoryIds.length; i++) {
                    const [row] = await conn.query(`SELECT id FROM category WHERE id=${params.categoryIds[i]}`);
                    if (row.length === 0) {
                        conn.release();
                        return 400;
                    }
                }
            }
        }
        if ('organizerId' in params) {
            organizerId = true;
        }
        if ('sortBy' in params) {
            sortBy = true;
        }

        if (startIndex || count || q || categoryIds || organizerId || sortBy) {
            noParams = false;
        }

        if (sortBy) {
            if (params.sortBy === 'ALPHABETICAL_ASC') {
                sorting += 'title ASC';
            } else if (params.sortBy === 'ALPHABETICAL_DESC') {
                sorting += 'title DESC';
            } else if (params.sortBy === 'DATE_ASC') {
                sorting += 'date ASC';
            } else if (params.sortBy === 'DATE_DESC') {
                sorting += 'date DESC';
            } else if (params.sortBy === 'ATTENDEES_ASC') {
                sorting += 'numAcceptedAttendees ASC';
            } else if (params.sortBy === 'ATTENDEES_DESC') {
                sorting += 'numAcceptedAttendees DESC';
            } else if (params.sortBy === 'CAPACITY_ASC') {
                sorting += 'capacity ASC';
            } else if (params.sortBy === 'CAPACITY_DESC') {
                sorting += 'capacity DESC';
            }
        } else {
            sorting += 'date DESC'; //Because sorting by date in a descending order is the default.
        }

        if (q) {
            whereClause += ` AND (title LIKE '%${params.q}%' OR event.description LIKE '%${params.q}%')`;
        }

        if (organizerId) {
            whereClause += ` AND event.organizer_id = ${params.organizerId}`;
        }

        query += whereClause;
        query += ' GROUP BY eventId';
        query += sorting;


        if (count && startIndex) {
            query += ` LIMIT ${params.count} OFFSET ${params.startIndex}`;
        } else if (count) {
            query += ` LIMIT ${params.count}`
        }
        if (noParams) {
            return this.getAllEvents(query);
        } else {
            const [rows] = await conn.query(query);
            conn.release();

            if (startIndex && !count) {
                const sliced = rows.splice(params.startIndex);
                if (categoryIds) {
                    return categoryFixer(sliced, params.categoryIds);
                }
                return categoryFixer(sliced, undefined);
            }
            if (categoryIds) {
                return categoryFixer(rows, params.categoryIds);
            }
            return categoryFixer(rows, undefined);
        }
    } catch (err) {
        console.log(`ERROR: Something went wrong with obtaining the events...`)
        console.log(err.sql);
        throw err;
    }
}

/**
 * Gets a detailed information about the event
 * @param id
 * @returns {Promise<*>}
 */
exports.getEvent = async function(id) {
    console.log(`Request to fetch detailed information about event ${id}`);
    const query = `SELECT event.id, event.title as title, event.description as description, user.id as organizerId, user.first_name as organizerFirstName, user.last_name as organizerLastName, COUNT(DISTINCT event_attendees.user_id) as attendeeCount, event.capacity as capacity, event.is_online as isOnline, event.url as url, event.venue as venue, event.requires_attendance_control as requiresAttendanceControl, event.fee as fee, GROUP_CONCAT(DISTINCT event_category.category_id) as categories, event.date as date FROM attendance_status, event JOIN event_category ON event.id = event_category.event_id JOIN event_attendees ON event_category.event_id = event_attendees.event_id JOIN user ON event.organizer_id = user.id WHERE event_attendees.attendance_status_id = 1 AND event.id = ${id} GROUP BY event.id ORDER BY date DESC`;
    try {
        const conn = await db.getPool().getConnection();
        const [row] = await conn.query(query);
        conn.release();
        // row[0]["date"] = new Date(row[0]["date"].getTime() - row[0]["date"].getTimezoneOffset() * 60000);
        return categoryFixer(row, undefined)[0];
    } catch (err) {
        console.log(`ERROR: Something went wrong with obtaining the details about event ${id}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Lists all categories
 * @returns {Promise<*>}
 */
exports.getCategories = async function() {
    console.log(`Request to fetch categories information`);
    try {
        const conn = await db.getPool().getConnection();
        const query = `SELECT * FROM category`
        const [rows] = await conn.query(query);
        conn.release();
        return rows;
    } catch (err) {
        console.log(`ERROR: Something went wrong with obtaining categories`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Creates an event, the current user needs to log in
 * @param authorize The current user's token
 * @param title REQUIRED
 * @param description REQUIRED
 * @param categoryIds RQUIRED
 * @param date Optional
 * @param isOnline Optional
 * @param url Optional
 * @param venue Optional
 * @param capacity Optional
 * @param attendanceControl Optional
 * @param fee Optional
 * @returns {Promise<number|*>}
 */
exports.createEvent = async function(authorize, title, description, categoryIds, date, isOnline, url, venue, capacity, attendanceControl, fee) {
    console.log(`Request to add a new event`);
    try {
        const conn = await db.getPool().getConnection();
        const [rows] = await conn.query(`SELECT id FROM user WHERE auth_token='${authorize}'`);
        if (rows.length === 0) {
            conn.release();
            return 401;
        }
        let eventColumn = 'title, description, organizer_id';
        let eventVals = `'${title}', '${description}', ${rows[0].id}`;
        if (date !== undefined) {
            eventColumn += ', date';
            eventVals += `, '${date}'`;
        }
        if (isOnline !== undefined) {
            eventColumn += ', is_online';
            eventVals += `, ${isOnline}`;
        }
        if (url !== undefined) {
            eventColumn += ', url';
            eventVals += `, '${url}'`;
        }
        if (venue !== undefined) {
            eventColumn += ', venue';
            eventVals += `, '${venue}'`;
        }
        if (capacity !== undefined) {
            eventColumn += ', capacity';
            eventVals += `, ${capacity}`;
        }
        if (attendanceControl !== undefined) {
            eventColumn += ', requires_attendance_control';
            eventVals += `, ${attendanceControl}`;
        }
        if (fee !== undefined) {
            eventColumn += ', fee';
            eventVals += `, ${fee}`;
        }

        const eventQuery = `INSERT INTO event (${eventColumn}) VALUES (${eventVals}); SELECT LAST_INSERT_ID() as eventId;`;
        const [newEvent] = await conn.query(eventQuery);
        if (typeof categoryIds === "object") {
            for (i = 0; i < categoryIds.length; i++) {
                const [temp] = await conn.query(`INSERT INTO event_category (event_id, category_id) VALUES (${newEvent[1][0].eventId}, ${categoryIds[i]})`);
            }
        } else {
            const [temp] = await conn.query(`INSERT INTO event_category (event_id, category_id) VALUES (${newEvent[1][0].eventId}, ${categoryIds})`);
        }

        conn.release();
        return newEvent[1][0];
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Allows the event organizer to modify their event
 * @param eventId Event's id
 * @param token Organizer's token
 * @param title Event's title
 * @param description Event's description
 * @param categoryIds Event's categories
 * @param date Event's date
 * @param isOnline true if online; otherwise, false
 * @param url Event's online link (if online)
 * @param venue Event's location
 * @param capacity Event's maximum capacity
 * @param attendanceCtrl true if attendance control is required; otherwise, false
 * @param fee fee
 * @returns {Promise<number>}
 */
exports.modifyEvent = async function (eventId, token, title, description, categoryIds, date, isOnline, url, venue, capacity, attendanceCtrl, fee) {
    console.log(`Request to modify the event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findToken] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
        const [findEvent] = await conn.query(`SELECT * FROM event WHERE id=${eventId}`);
        if (findToken.length === 0) {
            conn.release();
            return 401;
        } else if (findEvent.length === 0) {
            conn.release();
            return 404;
        } else if (findToken[0].id !== findEvent[0].organizer_id) {
            conn.release();
            return 403;
        } else {
            let updates = '';
            if (title !== undefined) {
                updates += ` title='${title}',`;
            }
            if (description !== undefined) {
                updates += ` description='${description}',`;
            }
            if (date !== undefined) {
                updates += ` date='${date},'`;
            }
            if (isOnline !== undefined) {
                updates += ` is_online=${isOnline},`;
            }
            if (url !== undefined) {
                updates += ` url='${url}',`;
            }
            if (venue !== undefined) {
                updates += ` venue='${venue}',`;
            }
            if (capacity !== undefined) {
                updates += ` capacity='${capacity}',`;
            }
            if (attendanceCtrl !== undefined) {
                updates += ` requires_attendance_control=${attendanceCtrl},`;
            }
            if (fee !== undefined) {
                updates += ` fee=${fee},`;
            }
            if (categoryIds !== undefined) {
                const [deleting] = await conn.query(`DELETE FROM event_category WHERE event_id=${eventId}`);
                if (typeof categoryIds === "object") {
                    for (i = 0; i < categoryIds.length; i++) {
                        const [temp] = await conn.query(`INSERT INTO event_category (event_id, category_id) VALUES (${findEvent[0].id}, ${categoryIds[i]})`);
                    }
                } else {
                    const [temp] = await conn.query(`INSERT INTO event_category (event_id, category_id) VALUES (${findEvent[0].id}, ${categoryIds})`);
                }
            }
            updates = updates.slice(0,-1);
            let query = `UPDATE event SET${updates} WHERE id=${eventId}`;
            const [updating] = await conn.query(query);
            conn.release();
            return 200;
        }

    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}

/**
 * Allows organizer to delete their event.
 * @param eventId The event to be deleted
 * @param token The organizer's token
 * @returns {Promise<number>}
 */
exports.deleteEvent = async function (eventId, token) {
    console.log(`Request to modify the event ${eventId}`);
    try {
        const conn = await db.getPool().getConnection();
        const [findToken] = await conn.query(`SELECT id FROM user WHERE auth_token='${token}'`);
        const [findEvent] = await conn.query(`SELECT * FROM event WHERE id=${eventId}`);
        if (findToken.length === 0) {
            conn.release();
            return 401;
        } else if (findEvent.length === 0) {
            conn.release();
            return 404;
        } else if (findToken[0].id !== findEvent[0].organizer_id) {
            conn.release();
            return 403;
        } else {
            const [deleteCategories] = await conn.query(`DELETE FROM event_category WHERE event_id=${eventId}`);
            const [deleteEvent] = await conn.query(`DELETE FROM event WHERE id=${eventId}`);
            conn.release();
            return 200;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        console.log(err.sql);
        throw err;
    }
}
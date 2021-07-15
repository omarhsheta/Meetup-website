const attendees = require('../models/events.attendees.model');

exports.getAttendees = async function (req, res) {
    console.log(`Request to get attendees for the event ${req.params.id}`);
    try {
        const result = await attendees.getAttendees(req.headers["x-authorization"], req.params.id);
        if (result === 404) {
            res.status(404)
                .send('');
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: Could not fetch attendees of event ${req.params.id} because ${err}`);
    }
}

exports.joinEvent = async function (req, res) {
    console.log(`Request to join event ${req.params.id}`);
    try {
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send('You must login to join an event!');
        } else {
            const result = await attendees.joinEvent(req.headers["x-authorization"], req.params.id);
            if (result === 404) {
                res.status(404)
                    .send('Event not found!')
            } else if (result === 401) {
                res.status(401)
                    .send('You must login to join an event!');
            } else if (result === 403.1) {
                res.status(403)
                    .send('You cannot join an event you have already joined!');
            } else if (result === 403.2) {
                res.status(403)
                    .send('You cannot join an event in the past!');
            } else {
                res.status(201)
                    .send('');
            }
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: Could not join event because ${err}`)
    }
}

exports.unjoinEvent = async function (req, res) {
    console.log(`Request to delete the event ${req.params.id}`);
    try {
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send('You must login to remove yourself from an event!');
        } else {
            const result = await attendees.unjoinEvent(req.headers["x-authorization"], req.params.id);
            if (result === 404) {
                res.status(404)
                    .send("Event not found!");
            } else if (result === 401) {
                res.status(401)
                    .send("You must login to remove yourself from an event!");
            } else if (result === 403.1) {
                res.status(403)
                    .send("You cannot unjoin an event you have not joined!");
            } else if (result === 403.2) {
                res.status(403)
                    .send("You cannot unjoin an event in the past!");
            } else if (result === 403.3) {
                res.status(403)
                    .send("You cannot unjoin an event you are rejected from!")
            } else {
                res.status(200)
                    .send("You have unjoined the event!");
            }
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: Could not delete event because ${err}`);
    }
}

exports.changeStatus = async function (req, res) {
    console.log(`Attempting to change the attendance status of user ${req.params.userId} in the event ${req.params.eventId}`);
    try {
        let userId = req.params.userId;
        let eventId = req.params.eventId;
        let token = req.headers["x-authorization"];
        let status = req.body.status;
        if (token === undefined) {
            res.status(401)
                .send('');
        } else {
            const result = await attendees.changeStatus(eventId, userId, token, status);
            if (result === 404) {
                res.status(404)
                    .send('');
            } else if (result === 403) {
                res.status(403)
                    .send('');
            } else if (result === 400) {
                res.status(400)
                    .send('');
            } else {
                res.status(200)
                    .send('');
            }
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: Could not update the u`)
    }
}
const events = require('../models/events.model');

exports.getEvents = async function (req, res) {
    console.log(`\nRequest to list all events.`);
    try {
        const result = await events.getEvents(req.query);
        if (result === 400) {
            res.status(400)
                .send();
        } else {
            res.status(200)
                .send(result)
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: Could not fetch events because ${err}`);
    }
}

exports.getEvent = async function (req, res) {
    console.log(`\nRequest to get detailed information about event ${req.params.id}`);
    try {
        const result = await events.getEvent(req.params.id);
        if (result.length === 0) {
            res.status(404)
                .send(`ERROR: The event does not exist!`);
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.getCategories = async function (req, res) {
    console.log('\nRequest to get categories info');
    try {
        const result = await events.getCategories();
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.addEvent = async function (req, res) {
    console.log(`\nRequest to add a new event`);
    try {
        let eventDate = Date.parse(req.body.date);
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send("ERROR: You need to login to add an event!");
        } else if (req.body.title === undefined) {
            res.statusMessage = "Bad Request: data should have required property 'title'";
            res.status(400)
                .send("");
        } else if (req.body.title.length === 0) {
            res.statusMessage = "Bad Request: data.title should NOT be shorter than 1 characters";
            res.status(400)
                .send("");
        } else if (req.body.description === undefined) {
            res.statusMessage = "Bad Request: data should have required property 'description'";
            res.status(400)
                .send("");
        } else if (req.body.categoryIds === undefined) {
            res.statusMessage = "Bad Request: data should have required property 'categoryIds'";
            res.status(400)
                .send("");
        } else if (typeof req.body.categoryIds !== "object") {
            res.statusMessage = "Bad Request: data.categoryIds should be array";
            res.status(400)
                .send("");
        } else if (req.body.categoryIds.length === 0) {
            res.statusMessage = "Bad Request: data.categoryIds should have at least one category";
            res.status(400)
                .send("");
        } else if (Date.now() > eventDate) {
            res.statusMessage = "Bad Request: event date must be in the future";
            res.status(400)
                .send("");
        } else {
            const categories = await events.getCategories();
            let found = true;
            for (i = 0; i < req.body.categoryIds.length; i++) {
                let temp = false;
                for (j = 0; j < categories.length; j++) {
                    if (req.body.categoryIds[i] === categories[j].id) {
                        temp = true;
                        break;
                    }
                }
                if (!temp) {
                    found = false;
                }
                if (!found) {
                    res.statusMessage = "Bad Request: at least one categoryId does not match any existing category";
                    res.status(400)
                        .send("");
                    break;
                }
            }
            if (found) {

                const result = await events.createEvent(req.headers["x-authorization"], req.body.title, req.body.description, req.body.categoryIds, req.body.date, req.body.isOnline, req.body.url, req.body.venue, req.body.capacity, req.body.requiresAttendanceControl, req.body.fee);
                if (result === 401) {
                    res.status(401)
                        .send("ERROR: You need to login to add an event!");
                } else {
                    res.status(201)
                        .send(result);
                }
            }
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.modifyEvent = async function (req, res) {
    console.log("attempting to modify the event");
    try {
        let title = req.body.title;
        let description = req.body.description;
        let categoryIds = req.body.categoryIds;
        let date = req.body.date;
        let isOnline = req.body.isOnline;
        let url = req.body.url;
        let venue = req.body.venue;
        let capacity = req.body.capacity;
        let attendanceCtrl = req.body.requiresAttendanceControl;
        let fee = req.body.fee;
        let categoriesFound = true;
        if (categoryIds !== undefined) {
            const categories = await events.getCategories();
            let found = true;
            for (i = 0; i < categoryIds.length; i++) {
                let temp = false;
                for (j = 0; j < categories.length; j++) {
                    if (categoryIds[i] === categories[j].id) {
                        temp = true;
                        break;
                    }
                }
                if (!temp) {
                    found = false;
                    break;
                }
            }
            if (!found) {
                categoriesFound = false;
            }
        }
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send("ERROR: You need to login to add an event!");
        } else if (title !== undefined && title.length === 0) {
            res.statusMessage = "Bad Request: data.title should NOT be shorter than 1 characters";
            res.status(400)
                .send('');
        } else if (Date.now() >= Date.parse(date)) {
            res.statusMessage = "Bad Request: event date must be in the future";
            res.status(400)
                .send('');
        } else if (!categoriesFound) {
            res.statusMessage = "Bad Request: at least one categoryId does not match any existing category";
            res.status(400)
                .send("");
        } else if (categoryIds !== undefined && categoryIds.length === 0) {
            res.statusMessage = "Bad Request: data.categoryIds should have at least one category";
            res.status(400)
                .send('');
        } else {
            const result = await events.modifyEvent(req.params.id, req.headers["x-authorization"], title, description, categoryIds, date, isOnline, url, venue, capacity, attendanceCtrl, fee);
            if (result === 401) {
                res.status(401)
                    .send('');
            } else if (result === 404) {
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

exports.deleteEvent = async function (req, res) {
    console.log("attempting to modify the event");
    try {
        if (req.headers["x-authorization"] === undefined) {
            res.status(401)
                .send("ERROR: You need to login to remove your event!");
        } else {
            const result = await events.deleteEvent(req.params.id, req.headers["x-authorization"]);
            if (result === 401) {
                res.status(401)
                    .send('');
            } else if (result === 404) {
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
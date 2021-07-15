const attendees = require('../controllers/events.attendees.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/events/:id/attendees')
        .get(attendees.getAttendees)
        .post(attendees.joinEvent)
        .delete(attendees.unjoinEvent);

    app.route(app.rootUrl + '/events/:eventId/attendees/:userId')
        .patch(attendees.changeStatus);
}
const events = require('../controllers/events.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/events')
        .get(events.getEvents)
        .post(events.addEvent);

    app.route(app.rootUrl + '/events/categories')
        .get(events.getCategories);

    app.route(app.rootUrl + '/events/:id')
        .get(events.getEvent)
        .patch(events.modifyEvent)
        .delete(events.deleteEvent);
}
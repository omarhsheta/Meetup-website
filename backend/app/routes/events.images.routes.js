const eventImgs = require('../controllers/events.images.controller');

module.exports = function (app) {
    app.route(app.rootUrl + "/events/:id/image")
        .put(eventImgs.setEventImage)
        .get(eventImgs.getEventImage);
}
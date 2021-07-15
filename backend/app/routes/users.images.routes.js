const usrImgs = require('../controllers/users.images.controller');

module.exports = function (app) {
    app.route(app.rootUrl + "/users/:id/image")
        .put(usrImgs.setUserImage)
        .get(usrImgs.getUserImage)
        .delete(usrImgs.deleteUserImage);
}
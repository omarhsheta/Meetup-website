const users = require('../models/users.model');

exports.getUser = async function (req, res) {
    console.log(`\nRequest to get information about user ${req.params.id}`);
    let token = req.headers["x-authorization"];
    try {
        const result = await users.getUser(req.params.id, token);
        if (result === 404) {
            res.status(404)
                .send('User not in the database');
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.modifyUser = async function (req, res) {
    console.log(`\nRequest to update user ${req.params.id}'s password...`);
    let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let userId = req.params.id;
    let fName = req.params.firstName;
    let lName = req.params.lastName;
    let email = req.params.email;
    let newPass = req.body.password;
    let curPass = req.body.currentPassword;
    let token = req.headers["x-authorization"];
    try {
        const result = await users.modifyUser(userId, fName, lName, email, newPass, curPass, token);
        if (result === 404) {
            res.status(404)
                .send('');
        } else if (result === 401) {
            res.status(401)
                .send('');
        } else if (result === 403) {
            res.status(403)
                .send('');
        } else if (result === 400) {
            res.status(400)
                .send('');
        } else if (email !== undefined && !re.test(email)) {
            res.status(400)
                .send('');
        } else {
            res.status(200)
                .send('');
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.registerUser = async function (req, res) {
    console.log(`\nRequest to register ${req.body.firstName} ${req.body.lastName}`);
    let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    try {
        if (!re.test(req.body.email)) {
            res.status(400)
                .send(`Please enter a valid email!`);
        } else {
            const result = await users.registerUser(req.body);
            res.status(201)
                .send(result);
        }
    } catch (err) {
        if (err.toString().includes("Duplicate entry")) {
            res.status(400)
                .send("This email is already taken");
        } else {
            res.status(500)
                .send(`ERROR: ${err}`);
        }
    }
}

exports.login = async function (req, res) {
    console.log(`\nRequest to login from ${req.body.email}`);
    try {
        const result = await users.login(req.body.email, req.body.password);
        if (!result) {
            res.status(400)
                .send(`The password that was entered is incorrect!`);
        } else if (result === 404) {
            res.status(400)
                .send(`The user does not exist!`);
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR: ${err}`);
    }
}

exports.logout = async function (req, res) {
    console.log(`\nRequest to logout`);
    try {
        const result = await users.logout(req.headers["x-authorization"]);
        if (result === 200) {
            res.status(200)
                .send(``);
        } else {
            res.status(401)
                .send(``);
        }
    } catch (err) {
        res.status(500)
            .send(``);
    }
}
const express = require("express");
const { logger } = require('../util/logger.js');
const { authenticateToken } = require('../util/authentication.js')
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserByUsernamePassword, register, createProfile, passwordChange, removeUser } = require('../service/user-service.js');
const { getDatabaseItem } = require('../service/general-service.js');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;;

router.post("/login", async (req, res) => {
    try {
        let token = null;
        const account = await getUserByUsernamePassword(req.body.username, req.body.password);
        token = jwt.sign({
            uuid: account.uuid,
            username: account.username
        }, secretKey, {
            expiresIn: "7d"
        });
        res.status(200).json({ token });
        return;
    }
    catch (err) {
        logger.error(err);
        res.status(400).json({ message: "no account found" });
        return;
    }

})
router.post('/register', async function (req, res, next) {
    try {
        await register(req.body);

        res.status(201).json({ message: 'User successfully registered!' });
    } catch (err) {
        logger.error(err.message);
        res.status(400).json({ message: err.message });
        return;
    }
})


router.get("/profile/:uuid", async (req, res) => {
    const user = req.params.uuid;
    try {
        const data = await getDatabaseItem(user);
        res.status(200).json(data);
    } catch (err) {
        logger.error(err.message);
        res.status(400).json({ message: err.message });
    }
});

router.post("/profile", authenticateToken, async (req, res) => {
    const user = req.user;
    try {
        const data = await createProfile(req.body, user.uuid);
        res.status(201).json({ message: 'Successfully updated' });
    } catch (err) {
        logger.error(err.message);
        res.status(400).json({ message: err.message });

    }
})

router.patch("/password", authenticateToken, async (req, res) => {
    const user = req.user;
    try {
        const data = await passwordChange(req.body, user.uuid);
        res.status(201).json({ message: 'Sucessfully updated' });
    } catch (err) {
        logger.error(err.message);
        res.status(400).json({ message: err.message });
    }
})

router.delete("/:uuid", async function(req, res, next) {
    try {
        const data = await removeUser(req.params);

        res.status(200).json({ message: 'User sucessfully deleted' });
        return;
    } catch(err) {
        logger.error(err.message);
        res.status(400).json({ message: err.message});
        return;
    }
});

module.exports = router;

/* istanbul ignore file */
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function verification (req, res, next) {
    /* istanbul ignore next */
    client.verifyIdToken({
        idToken: req.body.idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    .then((ticket) => {
        const payload = ticket.getPayload();
        req.user = {
            name: payload.name,
            email: payload.email
        };
        next();
    })
    .catch((err) => {
        next(err);
    });
}

module.exports = { verification };
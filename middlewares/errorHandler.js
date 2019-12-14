function errorHandler(err, req, res, next) {
    // console.log(err);
    let status = err.status || 500;
    let message = err.message || `Internal Server Error`;
    switch (err.name) {
        case "JsonWebTokenError":
            status = 400;
            message = `Invalid token`;
            break;
        case "ValidationError":
            status = 400;
            message = [];
            for (let key in err.errors) {
                message.push(err.errors[key].message);
            }
            break;
        case "CastError":
            status = 400;
            message = `Invalid Object ID`;
            break;
    }
    res.status(status).json({ message: message });
}

module.exports = errorHandler;
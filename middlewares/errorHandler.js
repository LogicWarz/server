function errorHandler(err, req, res, next) {
    console.log(err);
    let status = err.status || 500;
    /* istanbul ignore next */
    let message = err.message || `Internal Server Error`;
    /* istanbul ignore next */
    switch (err.name) {
        case "JsonWebTokenError":
            /* istanbul ignore next */
            status = 400;
            /* istanbul ignore next */
            message = `Invalid token`;
            /* istanbul ignore next */
            break;
        case "ValidationError":
            status = 400;
            message = [];
            for (let key in err.errors) {
                message.push(err.errors[key].message);
            }
            break;
        case "CastError":
            console.log('masuk')
            status = 400;
            message = `Invalid Object ID`;
            break;
    }
    res.status(status).json({ message: message });
}

module.exports = errorHandler;

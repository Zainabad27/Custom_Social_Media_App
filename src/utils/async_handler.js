function async_handler(fn) {
    return async function (req, res, next) {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error); // send to global error handler
        }
    };
}


export { async_handler }
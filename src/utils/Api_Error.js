class MyError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong!",
        error = [],
        stack = ""
    ) {
        super(message);  // Sets this.message and captures the stack
        this.statusCode = statusCode;
        this.errors = error;
        this.data = null;
        this.success = false;

    
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {MyError}
    
const logRequest = (req, res, next) => {
    const startTime = new Date(); // Record the start time
    console.log(`[START] ${req.method} ${req.originalUrl} at ${startTime.toISOString()}`);

    // Listen for response finishing to log completion details
    res.on('finish', () => {
        const endTime = new Date(); // Record the end time
        const duration = endTime - startTime; // Calculate duration in ms
        const status = res.statusCode;
        const statusMessage = status >= 200 && status < 400 ? 'SUCCESS' : 'FAILURE';

        console.log(
            `[END] ${req.method} ${req.originalUrl} | Status: ${status} (${statusMessage}) | Duration: ${duration}ms`
        );
    });

    next(); // Proceed to the next middleware or route handler
};

module.exports = logRequest;

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

// Custom format for log messages
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${message} ${stack ? `\n${stack}` : ''}`;
});

const logger = createLogger({
    level: 'info', // Set default log level
    format: combine(
        timestamp(),
        customFormat
    ),
    transports: [
        new transports.Console(), // Log to console
        new transports.File({ filename: 'error.log', level: 'error' }) // Log errors to file
    ]
});

export default logger;
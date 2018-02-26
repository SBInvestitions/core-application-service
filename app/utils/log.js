
import winston   from 'winston';

winston.emitErrs = true;

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: './logs/filelog-info.log',
      timestamp: true,
      level: 'info',
      maxsize: 100000
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: './logs/filelog-error.log',
      timestamp: true,
      level: 'error',
      maxsize: 100000
    }),
    new (winston.transports.Console)({
      level: 'debug',
      handleExceptions: true,
      timestamp: true,
      json: false,
      colorize: true,
      maxsize: 100000
    })
  ],
  exceptionHandlers: [
      new winston.transports.File({ 
          filename: './logs/filelog-exceptions.log' 
        })
    ]
});

export default logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
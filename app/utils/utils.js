import log from '../utils/log';

export function toLocalTime(time) {
    var d = new Date(time);
    var offset = (new Date().getTimezoneOffset() / 60) * -1;
    return new Date(d.getTime() + offset);
}
/**
 * Creates request result
 * @param {JSON} result - result data
 * @param {string} code - error code
 * @param {string} message - error message text
 * @return {JSON} response result
 */
export function resultAPI(result = null, code = 200, message = 'OK') {
    return {
        'result': result,
        'status': {
            'code': code,
            'msg': message
        }
    }
}

export function check_errors(params, callback) { 
    if (params.err) {
        log.error('Internal error(%d): %s', params.res.statusCode, params.err.message);
        if (params.err.name === 'ValidationError') {
            return params.res.status(400).json(resultAPI(params.err, 400, 'Validation error'));                     
        } else {
            return params.res.status(500).json(resultAPI(params.err, 500, params.err.message));                     
        }
    } else {
        try {
            if (params.item) {     
                callback(params.err, params.item);
            }  else {
                if (params.items) {
                    if (params.items.length) {
                        callback(params.err, params.items);
                    } else {
                        log.error('Item is empty!');                
                        return params.res.status(500).json(resultAPI(null, 404,'Not found'));                
                    }
                } else {
                    log.error('Item is empty!');                
                    return params.res.status(500).json(resultAPI(null, 404,'Not found'));                
                } 
            }              
        } catch (error) {
            params.next(error);
        }
    }
}


 

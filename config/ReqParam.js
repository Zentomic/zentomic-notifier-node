var Param = function(req, name) {
    var params = req.params || {};
    var body = req.body || {};
    var query = req.query || {};
    
    if (params[name] && params.hasOwnProperty(name)) return params[name];
    if (body[name]) return body[name];
    if (query[name]) return query[name];

    return undefined;
};

// Export configuration object
module.exports = Param;

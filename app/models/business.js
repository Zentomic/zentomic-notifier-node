var mongoose = require('mongoose');

var BusinessSchema = mongoose.Schema({

    name: String,
    code: String,
    address: String,
    phone: String,
    email: String,

});


module.exports = mongoose.model('business', BusinessSchema);

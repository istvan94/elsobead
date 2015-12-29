var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity: 'subject',
    connection: 'disk',
    attributes: {
        targy: {
            type: 'string',
            required: true
        },
        kredit: {
            type: 'string',
            required: false
        },
        terem: {
            type: 'string',
            required: true
        },
        user: {
            model: 'user'
        }
    }
});
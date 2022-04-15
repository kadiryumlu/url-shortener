const mongoose = require('mongoose');
const shortid = require('shortid');

const Url = new mongoose.Schema({
    full: {
        type: String,
        required: [true, 'URL is required'],
        validate: {
            validator: (val) => {
                return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(val)
            },
            message: (props) => {
                return `${props.value} is not a valid URL`
            }
        }
    },
    short: {
        type: String,
        unique: true,
        required: true,
        default: shortid.generate
    },
    redirections: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Url', Url);
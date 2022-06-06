const mongoose = require("mongoose");
const dateTime = require("luxon");  //*

const file = new mongoose.Schema({
    record: {
        type: Schema.Types.ObjectId,
        ref: record,
        required: true
    },

    link: {             //* field specs will be updated as needed with respect to amazon S3
        type: String,
        required: true
    },

    key: {              //* field specs will be updated as needed with respect to amazon S3
        type: String,
        required: true
    },

    createTime: {
        type: Date,
        default: new Date.now()
    }
})

file.virtual("age",get(function(){
    const now = new Date.now();
    return now.getTime() - this.createTime.getTime();
}))

module.exports = mongoose.model("file",file);
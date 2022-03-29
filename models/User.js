const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name :{
        type :String
    },
    email :{
        type :String
    },
    mobile :{
        type :String
    },
    password :{
        type :String
    },
    status : {
        type : Number,
        default : 1
    },
    createdAt:{
        type :Date,
        default :new Date()
    },
    updatedAt:{
        type :Date,
        default :new Date()
    }
})

const User = mongoose.model('User',userSchema)
module.exports = User
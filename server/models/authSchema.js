const mongoose = require("mongoose")

const auth_schema = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    confirmPassword:{
        type:String
    }
});

const auth_data = mongoose.model("auth_data",auth_schema);

module.exports = auth_data
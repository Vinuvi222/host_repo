import mongoose from "mongoose";

const busShcema = new mongoose.Schema({

    busNumber : {type : String, required : true, unique : true},
    model : {type : String, required : true},
    permitId : {type : mongoose.Schema.Types.ObjectId, ref : 'Permit', required : true},
    seats : {type : Number, required : true},
    status : {type : String, enum : ['active', 'inactive'], default : 'inactive' }

}, {timestamps : true});

export default mongoose.model('Bus', busShcema);
import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({

    routeNumber : {type : String, required : true, unique : true},
    routeName : {type : String, required : true},
    wayPoints : [
        {
            name : {type : String,  enum: ['no', 'stop'], default : 'no', required : true},
             
        }
    ]
}, {timestamps : true});

export default mongoose.model("Route", routeSchema);
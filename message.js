import mongoose from 'mongoose';

const Messages=mongoose.Schema({
    msg:String,
    timestamp:String,
    name:String
})


export default mongoose.model("Messages",Messages)
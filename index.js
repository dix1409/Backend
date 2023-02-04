import express from 'express';
import mongoose from 'mongoose'
import Cors from 'cors'
import Message from './message.js';
import Pusher from 'pusher';
const mongodb_url="mongodb+srv://dixit:vajubhai@cluster0.xf2gns9.mongodb.net/?retryWrites=true&w=majority"
//TODO:   App Config
const app = express();
const port=process.env.PORT ||8001

 

// Middleware
// it allows to send json file over http requests
app.use(express.json())

// cos is basically for adding headers for security reasons
app.use(Cors())
// db configurable
mongoose.connect(mongodb_url).then(()=>{
    console.log("connection successful");
}).catch(err=>{
    console.log(err);
})

const db=mongoose.connection
// Pusher
const pusher = new Pusher({
    appId: "1495673",
    key: "833b23158b312bb49000",
    secret: "9c2535c7472839f6fc9b",
    cluster: "ap2",
    useTLS: true
  });
  db.once("open",()=>{
    console.log("Open");
    const msgCollection =db.collection("messages")
    const changeStream = msgCollection.watch()
    changeStream.on("change",(change)=>{
        console.log(change);
        if(change.operationType==='insert'){
            const msd=change.fullDocument;
            pusher.trigger('new_message','message',{
                msg: msd.msg,
                name:msd.name,
                timestamp: msd.timestamp,
               
                _id: msd._id
            })
        }
    })
  })
   

// API Endpoints
app.get("/",(req,res)=>{
    res.status(200).send("Hello Dixit")
})

// send a message
app.post("/post/message",(req,res) => {
    const data=req.body

    Message.create(data,(err,data)=>{
        if(err){
            return res.status(500).send(err)
        }else{
            return res.status(201).send(data)
        }
    })
})

// get a message
app.post("/sync/message",(req,res)=>{
    const data=req.body
    Message.aggregate([
        {"$sort":{"timestamp":-1}}
    ]).exec((err,msg)=>{
        if(err){
            return res.status(500).send(err)
        }
        return res.status(200).send(msg)
    })
    
})

// Listeners
app.listen(port,()=>{
    console.log(`listening on ${port}`);
})


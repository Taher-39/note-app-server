const express = require('express')
const port = process.env.PORT || 4000;
require("dotenv").config()
const cors = require('cors') 
const bodyParser = require('body-parser') 
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');

const app = express()
app.use(cors())
app.use(bodyParser.json({
    limit: '50mb',
    parameterLimit: 100000
}))

app.get('/', (req, res) => {
    res.send("connect")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvvgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const notesCollection = client.db("noteApp").collection("notes");
    
    //post 
    app.post('/addNote', (req, res) => {
        notesCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    //get
    app.get('/getNote', (req, res) => {
        notesCollection.find()
            .toArray((err, data) => {
                res.send(data)
            })
    })
    //get by id
    app.get("/getSingleNote", (req, res) => {
        notesCollection.find({_id: ObjectId(req.query.id)})
            .toArray((err, result) => {
                res.send(result[0])
            })
    })
    //update 
    app.patch('/updateNote/:id', (req, res) => {
        notesCollection.updateOne({_id: ObjectId(req.params.id)},{
            $set: {note: req.body.note}
        })
        .then(result => {
            res.send(result.modifiedCount > 0)
        })
    })
    //delete 
    app.delete('/deleteNote/:id', (req, res) => {
        notesCollection.deleteOne({ _id: ObjectId(req.params.id)})
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })
            
});



app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const { readSync } = require('fs-extra');



const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.zjbav.mongodb.net:27017,cluster0-shard-00-01.zjbav.mongodb.net:27017,cluster0-shard-00-02.zjbav.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-s0cfps-shard-0&authSource=admin&retryWrites=true&w=majority`;



const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('agencyServices'));
app.use(fileUpload());

const port = 5000


app.get('/', (req, res) => {
  res.send('Hello World!')
})



MongoClient.connect(uri, function(err, client) {
  const adminCollection = client.db("creativeAgencyPro").collection("agencyServices");
  const userCollection = client.db("creativeAgencyPro").collection("agencyUser");
  const collection = client.db("creativeAgencyPro").collection("userReview");
  const adminPanelCollection = client.db("creativeAgencyPro").collection("adminPanel");
  
//====order===//
    app.post('/userProject', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const price = req.body.price;
        const project = req.body.project;
        const description = req.body.description;
        const filePath = `${__dirname}/agencyUser/${file.name}`
        console.log(name, email, price, project, description, file);

        file.mv(filePath, err=> {
            if(err){
                console.log(err);
                return res.status(500).send({msg: "Failed to upload image!"})
            }
            const newImg = fs.readFileSync(filePath);
            const encImg = newImg.toString('base64')

            const image = {
                contentType : req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(encImg, 'base64')
            };
            userCollection.insertOne({name, email, price, project,description, image})
            .then(result => {
                fs.remove(filePath, error =>{
                    if(error){
                        console.log(error);
                        return res.status(500).send({msg: "Failed to upload image!"})
                    }
                    res.send(result.insertedCount > 0);
                })
                
            })    
        })
    })
       
 
    app.get("/serviceListData/:email", (req, res) => {
        userCollection.find({email: req.params.email})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })
//====user Review===//
    app.post('/userReview', (req,res) => {
        const review = req.body;
        collection.insertOne(review)
        .then(result =>{
            console.log(result);
        })
    })



//====admin add service, make admin, see projects====//
    
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const filePath = `${__dirname}/agencyServices/${file.name}`
        console.log(description, title, file);

        file.mv(filePath, err=> {
            if(err){
                console.log(err);
                return res.status(500).send({msg: "Failed to upload image!"})
            }
            const newImg = fs.readFileSync(filePath);
            const encImg = newImg.toString('base64')

            const image = {
                contentType : req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(encImg, 'base64')
            };
            adminCollection.insertOne({title, description, image})
            .then(result => {
                fs.remove(filePath, error =>{
                    if(error){
                        console.log(error);
                        return res.status(500).send({msg: "Failed to upload image!"})
                    }
                    res.send(result.insertedCount > 0);
                })
                
            })    
        })
    })


    app.get("/service", (req, res) => {
        adminCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })


    app.get('/serviceListData', (req, res) => {
        userCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })




    app.post('/makeAdmin', (req,res) => {
        const email = req.body.email;
        adminPanelCollection.insertOne({email})
        .then(result =>{
            console.log(result);
        })
    })

    app.get('/')
    
    app.get('/getAdmin', (req, res) => {
        adminPanelCollection.find({})
        .toArray((err, adminEmail) =>{
            res.send(adminEmail)
        })
    })
    
});

    


app.listen( process.env.PORT ||port);
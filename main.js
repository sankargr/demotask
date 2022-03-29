const port = 3000
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const authRoute = require('./routes/Auth.js'); 
const app = express();
const log =console.log;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/auth',authRoute)
app.use((req, res, next) => {
    res.status(404).send('Sorry Page Not Found!...');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

mongoose.connect('mongodb://localhost:27017/doodleblue',{
   
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});


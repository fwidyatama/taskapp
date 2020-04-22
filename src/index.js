const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const mongoose = require('mongoose');


const userRoute = require('./routes/user');
const taskRoute = require('./routes/task');


app.use(express.json());
app.use('/api/v1', userRoute);
app.use('/api/v1', taskRoute);


mongoose.connect(process.env.DATABASE, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})



app.listen(port, () => {
    console.log(`Running in port ${port}`);
})

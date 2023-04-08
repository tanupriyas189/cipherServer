const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');

const dotenv = require(`dotenv`);
dotenv.config({ path: './config.env' });

const app = express();

//development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

//Body Parser, Reading data from the body into req.body
app.use(express.urlencoded({ extended: true }));


app.use(
  express.json({
    limit: '10kb',
  })
);





//allow other request to get access
app.use(cors());

//Routes
app.use('/', require("./routes"))





const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});



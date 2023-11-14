const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { Server, Socket } = require('socket.io');

const app = express();
const URI = 'mongodb+srv://surya:LWs4yKu81nYYcNQ9@cluster0.rf7ldel.mongodb.net/network?retryWrites=true&w=majority';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = new Date().toISOString().replace(/:/g, '-');
        cb(null, "multer" + uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(cors());

app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Error Handling
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message, data: error.data || {} });
});

// Database connection through mongoose &
mongoose
  .connect(URI)
  .then(result => {
    const httpServer = app.listen(8080);
    const io = require('./socket').init(httpServer);

    io.on('connection', (socket) => {
      console.log('Client connected');
    });
  })
  .catch(err => console.log(err));

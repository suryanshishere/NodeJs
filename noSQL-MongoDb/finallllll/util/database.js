const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  
  MongoClient.connect('mongodb+srv://th1nkers:r2TF9U9Ob4yBUP0L@cluster0.rf7ldel.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback(client);
    })
    .catch(err => {
      console.log(err);
      throw err;
    })

};

const getDb = () => {
  if(_db){
    return _db;
  }
  throw 'No database found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


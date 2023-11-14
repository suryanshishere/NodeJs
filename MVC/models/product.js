const fs = require('fs');
const rootDir = require('../util/path');
const path = require('path');

const p = path.join(rootDir, 'data', 'products.json');

const getProductFromFile = (cb) => {
   
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
}

class Product {
    constructor(t) {
        this.title = t;
    }

    save() {

        getProductFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err=>{
                console.log(err);
            })
        });
    }

    static fetchAll(cb) {
        getProductFromFile(cb);
    }

}

module.exports = Product;
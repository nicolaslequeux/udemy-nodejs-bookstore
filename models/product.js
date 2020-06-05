const fs = require("fs"); // to write on the file system
const path = require("path"); // to construct paths that's work on all OS

// global helper constant for the path
const p = path.join(
  path.dirname(process.mainModule.filename), // root directory
  "data", // folder
  "products.json" // file
);

// helper function to read file
const getProductsFromFile = (callback) => {
  fs.readFile(p, (err, data) => {
    if (err) { // if file does not exist for instance, return empty array
      // return []; // sans callback fetchAll return undefined as fs.readfile is too slow
      // si j'utilise un return, pas besoin de else car je sorts de la function...
      callback([]);
    } else {
      // sans callback fetchAll return undefined as fs.readfile is too slow !!
      // return JSON.parse(fileContent)
      callback(JSON.parse(data));
    }
  });
};

// WITH CLASS I CAN THEN INSTANCE (CREATE) OBJECT OF THIS CLASS
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title; // create the property title for the class
    this.imageUrl = imageUrl; // names between argument and property do not need to match
    this.description = description;
    this.price = price;
  }

  // when the object is created, 'this' reference the object

  // instance method available on the class object
  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProduct = [...products];
        updatedProduct[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProduct), (err) => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        // !!! I know this refers to the class as I use an arrow function (this comes from parent context)!
        // if not arrow function, I will lose the this which refers to something else...
        products.push(this); 
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const updatedProducts = products.filter(p => p.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {

      });
      callback(product);
    });

  }

  // static fetchAll(callback) {
  //   fs.readFile(p, (err, fileContent) => {
  //      // sans callback fetchAll return undefined as fs.readfile is too slow
  //     if (err) {
  //       // return []; 
  //       callback([]);
  //     } else {
  //       // sans callback fetchAll return undefined as fs.readfile is too slow !!
  //       // return JSON.parse(fileContent)
  //       callback(JSON.parse(fileContent));
  //     }
  //   });
  // }

  // class method available on the class itself! - Utilisation du helper 'getProductsFromFile'
  static fetchAll(callback) {
    getProductsFromFile(callback); // I call the function and forward the callback
  }

  // La fonction de classe accepte un en arguments un id et une fonction (callback) a executer
  static findById(id, callback) {
    // je charge tous les produits dans une array
    getProductsFromFile((products) => {
      // je filtre mon produit avant de le retourner dans le callback
      // TOUTE LA PROCEDURE ICI EST SYNCHRONOUS, RIEN D'ASYNC, DONC PAS DE SOUCIS!
      const product = products.find((p) => p.id === id);
      // j'exécute mon callback avec le produit unique
      callback(product);
    });
  }
};

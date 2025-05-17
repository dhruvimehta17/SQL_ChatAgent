const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/var/data/db.sqlite'
  : './db.sqlite';

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS products');

  db.run(`CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL,
    rating REAL
  )`);

  const stmt = db.prepare('INSERT INTO products VALUES (?, ?, ?, ?, ?)');

  const data = [
    [1, 'Product A', 'Electronics', 199.99, 4.2],
    [2, 'Product B', 'Clothing', 49.99, 3.8],
    [3, 'Product C', 'Electroniks', 299.99, 4.7],
    [4, 'Product D', 'Furniture', 499.99, null],
    [5, 'Product E', 'clothing', 89.99, 3.5],
    [6, null, 'Furniture', 899.99, 4.9],
    [7, 'Product G', 'Electronics', 149.99, 4.0],
    [8, 'Product H', 'Electronics', null, 2.8],
    [9, 'Product I', 'Clothing', 39.99, 4.3],
    [10, 'Product J', 'Furnitures', 599.99, 4.4],
    [11, 'Product A', 'Electronics', 199.99, 4.2],
    [12, 'Product K', 'Clothing', null, 3.7],
    [13, 'Product L', null, 129.99, 4.1],
    [14, null, 'Clothing', 59.99, 4.0],
    [15, 'Product M', 'Clothing', NaN, 3.6],
    [16, 'Product N', 'CLOTHING', 79.99, 3.9],
    [17, 'Product O', 'Electronics', 249.99, null],
    [18, 'Product P', 'Furniture', NaN, 4.0],
    [19, 'Product Q', 'Furnitures', 399.99, 4.5],
    [20, 'Product R', null, 109.99, 4.1],
    [21, 'Product S', 'Electronics', 139.99, NaN],
    [22, 'Product T', 'Electronics', NaN, 4.0],
    [23, null, 'Electronics', 189.99, 3.6],
    [24, 'Product U', 'Furniture', 209.99, 4.3],
    [25, 'Product V', 'Clothing', 99.99, 3.5],
    [26, 'Product W', 'Clothing', 49.99, null],
    [27, 'Product X', 'Furniture', 0.0, 2.0],
    [28, 'Product Y', 'Electroniks', 179.99, 4.8],
    [29, 'Product Z', 'Furnitures', NaN, 4.6],
    [30, 'Product AA', 'Electronics', NaN, 4.1],
    [31, 'Product AB', 'Electronics', null, 4.0],
    [32, 'Product AC', 'Clothing', 89.99, null],
    [33, 'Product AD', 'Clothing', null, NaN],
    [34, 'Product AE', 'clothing', 69.99, 3.8],
    [35, null, 'Furniture', 499.99, 4.2],
    [36, 'Product AF', 'Furniture', 599.99, NaN],
    [37, 'Product AG', 'Electronics', 229.99, 4.9],
    [38, 'Product AH', 'Electronics', 159.99, 4.5],
    [39, 'Product AI', 'Furnitures', 339.99, NaN],
    [40, 'Product AJ', 'Clothing', NaN, 3.9],
    [41, 'Product AK', 'Electronics', NaN, null],
    [42, null, 'Clothing', 119.99, 3.8],
    [43, 'Product AL', null, 89.99, 4.0],
    [44, 'Product AM', 'Clothing', 59.99, null],
    [45, 'Product AN', 'Clothing', null, 4.2],
    [46, 'Product AO', 'Clothing', 89.99, NaN],
    [47, 'Product AP', 'Furniture', 419.99, 4.4],
    [48, 'Product AQ', 'Furnitures', null, 4.3],
    [49, 'Product AR', 'Electroniks', 129.99, 4.0],
    [50, 'Product AS', 'Clothing', 59.99, 4.1],
  ];

  data.forEach(row => {
    stmt.run(row);
  });

  stmt.finalize();
});

db.close();

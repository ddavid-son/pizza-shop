export const createOrderTable = `CREATE TABLE orders (
    order_id    INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_id   INT NOT NULL,
    notes       VARCHAR(500),
    status      ENUM('Received', 'InProgress', 'Finished') NOT NULL DEFAULT 'Received',
    total_price DECIMAL(10,2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY customer_id_idx (customer_id)
    );`;

export const createProductTable = `CREATE TABLE product (
    product_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    size       ENUM('XL','L') NOT NULL DEFAULT 'XL',
    amount     INT NOT NULL DEFAULT 1,
    price      DECIMAL(3,1),
    KEY order_id_idx (order_id)
    );`;

export const createToppingsProductTable = `CREATE TABLE toppingsProducts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    topping_name varchar(30) NOT NULL,
    product_id   INT NOT NULL,
    topping_type ENUM('All', 'Left', 'Right') NOT NULL DEFAULT 'ALL'
    );`;

export const createToppingsTable = `CREATE TABLE toppings (
 topping_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(30) NOT NULL UNIQUE
);`;

export const createCustomerTable = `CREATE TABLE customers (
    customer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(80) UNIQUE NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
// todo: consider indexing the customer name

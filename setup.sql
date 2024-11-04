IF OBJECT_ID('users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        position VARCHAR(50),
        role VARCHAR(20),
        odoo_batch_id VARCHAR(50)
    );
END;

INSERT INTO users (username, password, first_name, last_name, position, role, odoo_batch_id)
VALUES ('admin', 'hashed_password', 'Admin', 'User', 'Admin Position', 'admin', NULL);

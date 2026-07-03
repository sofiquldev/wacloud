-- Ensures app credentials exist when the data volume was created with older env values.
CREATE DATABASE IF NOT EXISTS wacloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'wacloud'@'%' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON wacloud.* TO 'wacloud'@'%';
FLUSH PRIVILEGES;

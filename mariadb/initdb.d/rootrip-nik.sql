-- Create scheme rootrip-nik
CREATE DATABASE `rootrip-nik`;

-- Create rootrip-nik-prisma user for rootrip-nik db
DROP USER IF EXISTS 'rootrip-nik-prisma'@'%';
CREATE USER 'rootrip-nik-prisma'@'%' IDENTIFIED BY 'f6QESVrZ';
GRANT ALL PRIVILEGES ON *.* TO 'rootrip-nik-prisma'@'%';
FLUSH PRIVILEGES;
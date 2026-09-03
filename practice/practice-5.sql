CREATE DATABASE hospital_db;
USE hospital_db;

CREATE TABLE physician (
    employeeid INT PRIMARY KEY,
    name VARCHAR(100),
    position VARCHAR(100),
    ssn VARCHAR(20)
);

INSERT INTO physician VALUES
(1,'John Dorian','Staff Internist','111111111'),
(2,'Elliot Reid','Attending Physician','222222222'),
(3,'Christopher Turk','Surgical Attending Physician','333333333'),
(4,'Percival Cox','Senior Attending Physician','444444444'),
(5,'Bob Kelso','Head Chief of Medicine','555555555'),
(6,'Todd Quinlan','Surgical Attending Physician','666666666'),
(7,'John Wen','Surgical Attending Physician','777777777'),
(8,'Keith Dudemeister','MD Resident','888888888'),
(9,'Molly Clock','Attending Psychiatrist','999999999');

CREATE TABLE department (
    departmentid INT PRIMARY KEY,
    name VARCHAR(100),
    head INT
);

INSERT INTO department VALUES
(1,'General Medicine',4),
(2,'Surgery',7),
(3,'Psychiatry',9);

SELECT * FROM physician;

SELECT * FROM department;

SELECT d.name AS Department,
       p.name AS Head_Physician
FROM department d
JOIN physician p
ON d.head = p.employeeid;

SELECT *
FROM physician
WHERE position = 'Surgical Attending Physician';

SELECT *
FROM physician
WHERE name LIKE 'John%';

SELECT COUNT(*) AS Total_Physicians
FROM physician;

SELECT COUNT(DISTINCT position)
FROM physician;

SELECT position,
       COUNT(*) AS Total_Employees
FROM physician
GROUP BY position;

SELECT position,
       COUNT(*) AS Total_Employees
FROM physician
GROUP BY position
HAVING COUNT(*) > 1;

SELECT *
FROM physician
ORDER BY name ASC;

SELECT *
FROM physician
ORDER BY employeeid DESC;

SELECT *
FROM physician
WHERE employeeid IN
(
    SELECT head
    FROM department
);

SELECT *
FROM physician
WHERE employeeid NOT IN
(
    SELECT head
    FROM department
);

SELECT position,
       COUNT(*) AS Total_Employees
FROM physician
GROUP BY position
ORDER BY Total_Employees DESC;

SELECT *
FROM physician
WHERE position LIKE '%Attending%';

SELECT p.name
FROM physician p
JOIN department d
ON p.employeeid = d.head
WHERE d.name = 'Surgery';

SELECT d.name,
       p.name
FROM department d
JOIN physician p
ON d.head = p.employeeid
ORDER BY d.name;

SELECT *
FROM physician
WHERE position NOT LIKE '%Surgical%';

SELECT position,
       COUNT(*) AS Total
FROM physician
GROUP BY position
HAVING COUNT(*) >= 2;

SELECT *
FROM department d
WHERE EXISTS
(
    SELECT 1
    FROM physician p
    WHERE p.employeeid = d.head
);

SELECT MAX(employeeid)
FROM physician;

SELECT MIN(employeeid)
FROM physician;


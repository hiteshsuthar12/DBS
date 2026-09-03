CREATE DATABASE joins_practice;

USE joins_practice;

CREATE TABLE class (
    id INT,
    name VARCHAR(30)
);

CREATE TABLE class_info (
    id INT,
    address VARCHAR(30)
);

INSERT INTO class VALUES
(1, 'abhi'),
(2, 'adam'),
(4, 'alex');

INSERT INTO class_info VALUES
(1, 'DELHI'),
(2, 'MUMBAI'),
(3, 'CHENNAI');

SELECT * FROM class;

SELECT * FROM class_info;

SELECT *
FROM class
CROSS JOIN class_info;

TRUNCATE TABLE class;
TRUNCATE TABLE class_info;

INSERT INTO class VALUES
(1, 'abhi'),
(2, 'adam'),
(3, 'alex'),
(4, 'anu');

INSERT INTO class_info VALUES
(1, 'DELHI'),
(2, 'MUMBAI'),
(3, 'CHENNAI');

SELECT * FROM class;
SELECT * FROM class_info;

SELECT *
FROM class
INNER JOIN class_info
ON class.id = class_info.id;

SELECT class.name,
       class_info.address
FROM class
INNER JOIN class_info
ON class.id = class_info.id;

SELECT *
FROM class
NATURAL JOIN class_info;

INSERT INTO class VALUES
(5, 'ashish');

INSERT INTO class_info VALUES
(7, 'NOIDA'),
(8, 'PANIPAT');

SELECT *
FROM class
LEFT JOIN class_info
ON class.id = class_info.id;

SELECT *
FROM class
LEFT JOIN class_info
ON class.id = class_info.id
WHERE class_info.id IS NULL;

SELECT *
FROM class
RIGHT JOIN class_info
ON class.id = class_info.id;

SELECT *
FROM class
RIGHT JOIN class_info
ON class.id = class_info.id
WHERE class.id IS NULL;

SELECT *
FROM class
FULL OUTER JOIN class_info
ON class.id = class_info.id;

SELECT *
FROM class
LEFT JOIN class_info
ON class.id = class_info.id

UNION

SELECT *
FROM class
RIGHT JOIN class_info
ON class.id = class_info.id;

CREATE TABLE first_table (
    id INT,
    name VARCHAR(30)
);

CREATE TABLE second_table (
    id INT,
    name VARCHAR(30)
);

INSERT INTO first_table VALUES
(1, 'abhi'),
(2, 'adam');

INSERT INTO second_table VALUES
(2, 'adam'),
(3, 'chester');

SELECT * FROM first_table
UNION
SELECT * FROM second_table;

SELECT * FROM first_table
UNION ALL
SELECT * FROM second_table;

SELECT COUNT(*)
FROM
(
    SELECT * FROM first_table
    UNION ALL
    SELECT * FROM second_table
) AS A;

SELECT * FROM first_table
INTERSECT
SELECT * FROM second_table;

SELECT f.*
FROM first_table f
INNER JOIN second_table s
ON f.id = s.id
AND f.name = s.name;

SELECT name FROM first_table
INTERSECT
SELECT name FROM second_table;

SELECT DISTINCT f.name
FROM first_table f
INNER JOIN second_table s
ON f.name = s.name;

SELECT f.*
FROM first_table f
LEFT JOIN second_table s
ON f.id = s.id
AND f.name = s.name
WHERE s.id IS NULL;

SELECT c.id,
       c.name,
       CASE
           WHEN ci.address IS NULL
           THEN 'Address Missing'
           ELSE 'Address Available'
       END AS Status
FROM class c
LEFT JOIN class_info ci
ON c.id = ci.id;


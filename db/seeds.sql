INSERT INTO department(name)
VALUES ("Adminstration"),
       ("Finance"),
       ("Operations"),
       ("Sales");

INSERT INTO role(title, salary, department_id)
VALUES ("Owner", 100000, 3),
       ("Accounting Manager", 85000, 2),
       ("Sales Manager", 75000, 4),
       ("Office Manager", 55000, 1),
       ("Accountant", 60000, 2),
       ("Sales Associate", 35000, 4),
       ("Admin Assistant", 45000, 1);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("Deanna", "Lane", 1, NULL),
       ("Virgil", "English", 2, 1),
       ("Doug", "Snow", 3, 1),
       ("Gwen", "Bliss", 4, 1),
       ("Carole", "Cheng", 5, 2),
       ("Ron", "Riggs", 5, 2),
       ("Kim", "Powers", 6, 3),
       ("Darla", "Keller", 6, 3),
       ("Alexandra", "Ruiz", 7, 4);
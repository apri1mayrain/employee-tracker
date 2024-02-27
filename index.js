// Required dependencies for app functionality...
// Inquirer NPM
const inquirer = require('inquirer');
// Connect to database (via MySQL2)
const db = require('./config/connection');

let query;
let values = [];
let departments = [];
let employees = [];
let roles = [];
let managers = [];

// Array of available database actions (Add, Update, View, Quit)
const actions = [
  {
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      new inquirer.Separator('- Add:'),
      'Add a department',
      'Add a role',
      'Add an employee',
      new inquirer.Separator('- Update:'),
      'Update an employee role',
      new inquirer.Separator('- View:'),
      'View all departments',
      'View all roles',
      'View all employees',
      'View employees by department',
      'View employees by manager',
      'Quit',
    ],
  },
];

// Array of user prompts to add items to database
const addPrompt = [
  {
    name: 'addDepartment',
    type: 'input',
    message: 'What is the department name?',
  },
  {
    name: 'addRole',
    type: 'input',
    message: 'What is the role?',
  },
  {
    name: 'roleSalary',
    type: 'input',
    message: 'What is the salary for the role?',
  },
  {
    name: 'pickDepartment',
    type: 'list',
    message: 'What department does the role belong to?',
    choices: departments,
  },
  {
    name: 'firstName',
    type: 'input',
    message: "What is the employee's first name?",
  },
  {
    name: 'lastName',
    type: 'input',
    message: "What is the employee's last name?",
  },
  {
    name: 'employeeRole',
    type: 'list',
    message: "What is the employee's role?",
    choices: roles,
  },
  {
    name: 'employeeManager',
    type: 'list',
    message: "Who is the employee's manager?",
    choices: managers,
  },
];

// Array of user prompts to update items in database
const updatePrompt = [
  {
    name: 'updateEmployee',
    type: 'list',
    message: 'Which employee requires a role update?',
    choices: employees,
  },
];

// Function to add information in database
async function addDepartment() {
  await inquirer.prompt(addPrompt[0]).then(async (answer) => {
    await db.then((conn) => {
      conn.query('INSERT INTO department(name) VALUES (?)', 
      [answer.addDepartment]);
      console.log(`
${answer.addDepartment} added to database.`);
    });
  });
  return viewDepartments();
}

async function addRole() {
  values = [];
  await inquirer
    .prompt(addPrompt[1])
    .then((answer) => values.push(answer.addRole));
  await inquirer
    .prompt(addPrompt[2])
    .then((answer) => values.push(answer.roleSalary));
  await listDepartments();
  await inquirer
    .prompt(addPrompt[3])
    .then((answer) => {
        values.push(answer.pickDepartment);
        departments = []; 
    });
  await db.then((conn) => {
    conn.query('INSERT INTO role(title, salary, department_id) VALUES (?)', [values]);
    console.log(`
${values[0]} added to database.`);
  });
  return viewRoles();
}

async function addEmployee() {
  values = [];
  await inquirer
    .prompt(addPrompt[4])
    .then((answer) => values.push(answer.firstName));
  await inquirer
    .prompt(addPrompt[5])
    .then((answer) => values.push(answer.lastName));
  await listRoles();
  await inquirer
    .prompt(addPrompt[6])
    .then((answer) => {
        values.push(answer.employeeRole);
        roles = [];
    });
  await listManagers();
  await inquirer
    .prompt(addPrompt[7])
    .then((answer) => {
        values.push(answer.employeeManager);
        managers = [];
    })
  await db.then((conn) => {
    conn.query('INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?)', [values])
    console.log(`
${values[0]} ${values[1]} added to database.`)
  })
  return viewEmployees();
}

// Functions to help list information (used in inquirer prompts)
async function listDepartments() {
  await db
    .then((conn) => conn.query('SELECT * from department'))
    .then(([rows]) => {
      rows.forEach((department) => departments.push({ name: department.name, value: department.id}))
    })
}

async function listEmployees() {
  await db
    .then((conn) => conn.query(`SELECT employee.id,
      CONCAT(employee.first_name, ' ', employee.last_name) as employee
      FROM employee`))
    .then(([rows]) => {
      rows.forEach((employee) => employees.push({ name: employee.employee, value: employee.id }))
    })
}

async function listManagers() {
    await db
    .then((conn) =>
      conn.query(`SELECT DISTINCT employee.manager_id,
      CONCAT(manager.first_name, ' ', manager.last_name) as manager
      FROM employee
      LEFT JOIN employee manager
      ON employee.manager_id = manager.id`))
    .then(([rows]) => {
      rows.forEach((manager) => managers.push({ name: manager.manager, value: manager.manager_id }))
    })
}

async function listRoles() {
  await db
    .then((conn) => conn.query('SELECT role.id, role.title from role'))
    .then(([rows]) => {
      rows.forEach((role) => roles.push({ name: role.title, value: role.id }))
    })
}

// Function to update an employee's role
async function updateEmployee() {
    values = [];
    await listEmployees();
    await inquirer.prompt(updatePrompt)
    .then((answer) => values.push(answer.updateEmployee))
    await listRoles();
    await inquirer
    .prompt(addPrompt[6])
    .then((answer) => {
        values.push(answer.employeeRole)
        roles = [];
    })
    await db.then((conn) => {
        conn.query('UPDATE employee SET role_id = ? WHERE id = ?', [values[1], values[0]]);
      });
      return viewEmployees();
}

// Functions to query database and view information
function viewDepartments() {
  // Show department names and department ids
  query = 'SELECT * from department';
  return connect(query);
}

function viewRoles() {
  // Show job title, role id, the department that role belongs to, and the salary for that role
  query = `SELECT role.id, role.title, department.name as department, role.salary
            FROM role
            LEFT JOIN department ON role.department_id = department.id`;
  return connect(query);
}

function viewEmployees() {
  // Show employee data, including employee ids, first names, last names, job titles,
  // departments, salaries, and managers that the employees report to
  query = `SELECT employee.id, employee.first_name, employee.last_name,
            role.title as title, department.name as name, role.salary as salary,
            CONCAT(manager.first_name, ' ', manager.last_name) as manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  return connect(query);
}

function viewEmpByDept() {
  // View employees by department
  query = `SELECT employee.id as employee_id,
    CONCAT(employee.first_name, ' ', employee.last_name) as employee, 
    department.name as department,
    department.id as department_id
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id`;
  return connect(query);
}

function viewEmpByManager() {
  // View employees by department
  query = `SELECT employee.id as employee_id,
    CONCAT(employee.first_name, ' ', employee.last_name) as employee,
    CONCAT(manager.first_name, ' ', manager.last_name) as manager,
    employee.manager_id
    FROM employee
    LEFT JOIN employee manager
    ON employee.manager_id = manager.id`;
  return connect(query);
}

// Calls function based on database action selected by user
function runAction(action) {
  switch (action) {
    // Add actions
    case 'Add a department':
      return addDepartment();

    case 'Add a role':
      return addRole();

    case 'Add an employee':
      return addEmployee();

    // Update actions
    case 'Update an employee role':
      return updateEmployee();

    // View actions
    case 'View all departments':
      return viewDepartments();

    case 'View all roles':
      return viewRoles();

    case 'View all employees':
      return viewEmployees();

    case 'View employees by department':
      return viewEmpByDept();

    case 'View employees by manager':
      return viewEmpByManager();

    // Quit
    case 'Quit':
      return process.exit();
  }
}

// Connect to database to run query and display table
async function connect(query) {
    await db
    .then((conn) => conn.query(query))
    .then(([rows]) => {
        console.log('\n');
        console.table(rows);
    })
    .catch((err) => console.log(err));
  return start();
}

// Start inquirer
async function start() {
  await inquirer
    .prompt(actions)
    .then((answer) => runAction(answer.action))
    .catch((err) => console.log(err));
}

// Call to start inquirer prompts
console.log('Welcome to Employee Tracker!\n')
start();
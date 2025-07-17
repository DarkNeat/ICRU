const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// MySQL config (use environment variables for production)
const dbConfig = {
  host: process.env.DB_HOST     || 'localhost',
  user: process.env.DB_USER     || 'dbuser',
  password: process.env.DB_PASSWORD || 'dbpass',
  database: process.env.DB_NAME || 'ICRU',
  port: process.env.DB_PORT     || 3306,
  ssl: false
};

// ------------------- API ROUTES --------------------

// USER LOGIN
app.post('/api/login', async (req, res) => {
  const { id } = req.body;
  if (!id || isNaN(Number(id))) {
    return res.json({ success: false, message: 'Invalid sign-in code.' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT status FROM User_Account WHERE ID = ? LIMIT 1", [id]
    );
    await conn.end();
    if (rows.length > 0) {
      const status = (rows[0].status || '').trim().toLowerCase();
      if (status === 'manager' || status === 'property expert') {
        return res.json({ success: true });
      }
    }
    res.json({ success: false, message: 'Access denied. Only managers and property experts can sign in.' });
  } catch (e) {
    res.json({ success: false, message: 'Database error.' });
  }
});

// DASHBOARD STATUS CHECK
app.get('/api/status', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('SELECT 1');
    await conn.end();
    res.json({ dbConnected: true });
  } catch {
    res.json({ dbConnected: false });
  }
});

// DAILY ATTENDANCE
app.get('/api/attendance/daily', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.json([]);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT ua.Employee_ID, ua.name_acc, ta.time_in_1, ta.time_out_1, ta.time_in_2, ta.time_out_2
       FROM TimeAttendance ta
       JOIN User_Account ua ON ta.employee_id = ua.Employee_ID
       WHERE ta.date = ?
       ORDER BY ua.name_acc`, [date]
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    res.json([]);
  }
});

// MONTHLY ATTENDANCE
app.get('/api/attendance/monthly', async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.json([]);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT ua.Employee_ID, ua.name_acc,
        COUNT(CASE WHEN ta.time_in_1 IS NOT NULL THEN 1 END) AS present_days,
        COUNT(CASE WHEN ta.time_in_1 > DATE_ADD(DATE(ta.time_in_1), INTERVAL '09:00' HOUR_MINUTE) THEN 1 END) AS late_days,
        COUNT(CASE WHEN ta.time_in_1 IS NULL OR ta.time_out_1 IS NULL THEN 1 END) AS missing_punches,
        AVG(TIMESTAMPDIFF(MINUTE, ta.time_in_1, ta.time_out_1)) / 60 AS avg_hours
       FROM TimeAttendance ta
       JOIN User_Account ua ON ta.employee_id = ua.Employee_ID
       WHERE MONTH(ta.date) = ? AND YEAR(ta.date) = ?
       GROUP BY ua.Employee_ID, ua.name_acc
       ORDER BY ua.name_acc`, [month, year]
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    res.json([]);
  }
});

// DAILY REPORT (orders)
app.get('/api/report/daily', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.json([]);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT OrderID, CustomerRef, Time, Total, Tip, PaymentMode
       FROM Orders
       WHERE Date = ?
       ORDER BY Time`, [date]
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    res.json([]);
  }
});

// MONTHLY REPORT (orders)
app.get('/api/report/monthly', async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.json([]);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT OrderID, CustomerRef, Date, Time, Total, Tip, PaymentMode
       FROM Orders
       WHERE MONTH(Date) = ? AND YEAR(Date) = ?
       ORDER BY Date, Time`, [month, year]
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    res.json([]);
  }
});

// ----- PIE CHART PRODUCT SUMMARY ENDPOINTS ------

// DAILY PRODUCTS SUMMARY
app.get('/api/report/daily/products', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.json([]);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT OrderItems.ProductName, SUM(OrderItems.Quantity) AS Quantity
       FROM Orders
       JOIN OrderItems ON Orders.OrderID = OrderItems.OrderID
       WHERE Orders.Date = ?
       GROUP BY OrderItems.ProductName
       ORDER BY Quantity DESC`,
      [date]
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

// MONTHLY PRODUCTS SUMMARY
app.get('/api/report/monthly/products', async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.json([]);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT OrderItems.ProductName, SUM(OrderItems.Quantity) AS Quantity
       FROM Orders
       JOIN OrderItems ON Orders.OrderID = OrderItems.OrderID
       WHERE MONTH(Orders.Date) = ? AND YEAR(Orders.Date) = ?
       GROUP BY OrderItems.ProductName
       ORDER BY Quantity DESC`,
      [month, year]
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

// INVENTORY
app.get('/api/inventory', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT ingredient_name, category, quantity, unit, full_stock
       FROM Inventory
       ORDER BY category, ingredient_name`
    );
    await conn.end();
    res.json(rows);
  } catch (e) {
    res.json([]);
  }
});

// SERVE FRONTEND (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ------------------- START SERVER --------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

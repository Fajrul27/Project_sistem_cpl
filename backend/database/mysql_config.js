// ============================================
// MySQL Database Configuration
// ============================================

import mysql from 'mysql2/promise';

// Database Configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sistem_cpl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create Connection Pool
const pool = mysql.createPool(dbConfig);

// Test Connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error.message);
    return false;
  }
}

// Query Helper Function
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return { data: results, error: null };
  } catch (error) {
    console.error('Query Error:', error.message);
    return { data: null, error: error };
  }
}

// Transaction Helper
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return { data: result, error: null };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction Error:', error.message);
    return { data: null, error: error };
  } finally {
    connection.release();
  }
}

// Export
export { pool, query, transaction, testConnection };
export default pool;

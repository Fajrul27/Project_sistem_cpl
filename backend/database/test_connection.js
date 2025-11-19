// ============================================
// MySQL Connection Test Script
// ============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sistem_cpl',
};

async function testConnection() {
  console.log('\n🔍 Testing MySQL Database Connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  Port: ${dbConfig.port}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log('\n' + '='.repeat(50) + '\n');

  let connection;

  try {
    // Test 1: Connect to MySQL
    console.log('Test 1: Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!\n');

    // Test 2: Check database
    console.log('Test 2: Checking database...');
    const [databases] = await connection.execute(
      "SHOW DATABASES LIKE ?",
      [dbConfig.database]
    );
    if (databases.length > 0) {
      console.log(`✅ Database '${dbConfig.database}' exists!\n`);
    } else {
      console.log(`❌ Database '${dbConfig.database}' not found!\n`);
      return;
    }

    // Test 3: List tables
    console.log('Test 3: Listing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    console.log();

    // Test 4: Count users
    console.log('Test 4: Counting users...');
    const [userCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM users'
    );
    console.log(`✅ Total users: ${userCount[0].count}\n`);

    // Test 5: Sample user data
    console.log('Test 5: Fetching sample user...');
    const [users] = await connection.execute(`
      SELECT 
        u.email,
        ur.role,
        p.nama_lengkap
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN profiles p ON u.id = p.user_id
      LIMIT 3
    `);
    console.log('✅ Sample users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role || 'no role'}) - ${user.nama_lengkap || 'no name'}`);
    });
    console.log();

    // Test 6: Count CPL
    console.log('Test 6: Counting CPL...');
    const [cplCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM cpl'
    );
    console.log(`✅ Total CPL: ${cplCount[0].count}\n`);

    // Test 7: Count Mata Kuliah
    console.log('Test 7: Counting Mata Kuliah...');
    const [mkCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM mata_kuliah'
    );
    console.log(`✅ Total Mata Kuliah: ${mkCount[0].count}\n`);

    // Test 8: Count Nilai
    console.log('Test 8: Counting Nilai CPL...');
    const [nilaiCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM nilai_cpl'
    );
    console.log(`✅ Total Nilai CPL: ${nilaiCount[0].count}\n`);

    // Test 9: Test view
    console.log('Test 9: Testing view...');
    const [viewData] = await connection.execute(
      'SELECT * FROM v_user_details LIMIT 1'
    );
    if (viewData.length > 0) {
      console.log('✅ View accessible!\n');
    } else {
      console.log('⚠️ View exists but no data\n');
    }

    // Summary
    console.log('='.repeat(50));
    console.log('\n🎉 All tests passed successfully!\n');
    console.log('Database Statistics:');
    console.log(`  - Users: ${userCount[0].count}`);
    console.log(`  - CPL: ${cplCount[0].count}`);
    console.log(`  - Mata Kuliah: ${mkCount[0].count}`);
    console.log(`  - Nilai CPL: ${nilaiCount[0].count}`);
    console.log('\n✅ MySQL database is ready to use!\n');

  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MySQL server is running');
    console.error('2. Verify credentials in .env file');
    console.error('3. Make sure database exists');
    console.error('4. Check if port 3306 is open');
    console.error('5. Verify user has proper permissions\n');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run test
testConnection();

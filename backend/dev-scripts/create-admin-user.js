const path = require('path');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const db = require(path.join(__dirname, '..', 'models'));

  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Ensure the database schema is up-to-date
    await db.sequelize.sync();

    // 1. Ensure an 'Admin' user type exists (tipouser)
    const adminUserTypeDescPt = 'Admin';
    const [adminUserType] = await db.tipouser.findOrCreate({
      where: { descricao_pt: adminUserTypeDescPt },
      defaults: {
        descricao_pt: adminUserTypeDescPt,
        descricao_en: 'Admin'
      }
    });

    if (adminUserType) {
        console.log(`User type '${adminUserTypeDescPt}' is available.`);
    }

    // 2. Define admin user details
    const adminEmail = 'admin@local';
    const adminPassword = 'adminpassword'; // Choose a strong password
    const adminName = 'Admin User';

    // 3. Check if the admin user already exists
    const existingAdmin = await db.utilizadores.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`Admin user with email '${adminEmail}' already exists. No action taken.`);
    } else {
      // 4. Hash the password and create the user
      console.log('Admin user not found. Creating a new one...');
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(adminPassword, saltRounds);

      await db.utilizadores.create({
        nome: adminName,
        email: adminEmail,
        password_hash: hashedPassword,
        id_tipo_user: adminUserType.id_tipo_user 
      });

      console.log('************************************************************');
      console.log('  Admin user created successfully!');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('************************************************************');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message || error);
    process.exit(1);
  }
}

createAdminUser();

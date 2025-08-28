import Admin from '../Admin.model.js';
import bcrypt from 'bcryptjs';
export async function seedAdmin() {
  const exists = await Admin.findOne({ username: 'admin' });
  if (!exists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      username: 'admin',
      password: hashedPassword,
    });
    await new Admin().save(); // saves with default username and password
    console.log('Default admin created');
  } else {
    console.log('Admin already exists');
  }
}



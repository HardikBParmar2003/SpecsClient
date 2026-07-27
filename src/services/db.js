import Dexie from 'dexie';

// Create a new Dexie database instance
export const db = new Dexie('RadheshyamDB');

// Define the database schema (similar to Prisma schema)
// Note: In Dexie, you only need to declare the primary key and the properties you want to index/search by.
// You do not need to list every single column.
db.version(2).stores({
  users: '++id, email, mobile, role',
  products: '++id, sku, brand, is_active',
  cart_items: '++id, user_id, product_id, [user_id+product_id]', // Compound index for unique cart item
  orders: '++id, user_id, status, pay_status, reminder_date',
  order_items: '++id, order_id, product_id',
  eye_prescriptions: '++id, user_id, order_id',
  reminders_log: '++id, user_id, order_id, status, scheduled_date',
  parties: '++id, name, phone',
  purchases: '++id, party_id, date',
  expenses: '++id, date'
});

// Helper function to seed an initial admin user if the database is empty
export const initializeDatabase = async () => {
  const adminExists = await db.users.where({ email: 'admin@gmail.com' }).first();
  
  if (!adminExists) {
    console.log("No admin@gmail.com found. Seeding initial admin user...");
    await db.users.add({
      name: 'Admin',
      email: 'admin@gmail.com',
      mobile: '1234567890',
      password: 'admin',
      role: 'admin',
      cust_type: 'offline',
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Restore admin role for users who registered via the app
  // (In case they were temporarily converted to customers by a previous update)
  const allUsers = await db.users.toArray();
  for (const u of allUsers) {
    if (u.password && u.role !== 'admin') {
      await db.users.update(u.id, { role: 'admin' });
    }
  }
};

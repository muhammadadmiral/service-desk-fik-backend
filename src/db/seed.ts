import { db } from './index';
import { users, tickets, ticketMessages } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

// Seed function to populate the database with test data
async function seed() {
  console.log('Seeding database...');

  try {
    // Check if users table exists and has data
    const existingUsers = await db.select().from(users);

    if (existingUsers.length === 0) {
      console.log('Adding test users...');

      // Add test users
      await db.insert(users).values([
        {
          uid: 'admin-uid-123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          department: 'IT',
        },
        {
          uid: 'staff-uid-123',
          name: 'Staff User',
          email: 'staff@example.com',
          role: 'staff',
          department: 'Support',
        },
        {
          uid: 'student-uid-123',
          name: 'Student User',
          email: 'student@example.com',
          role: 'mahasiswa',
          department: 'Computer Science',
        },
      ]);

      console.log('Test users added successfully');
    } else {
      console.log(
        `Found ${existingUsers.length} existing users, skipping user creation`,
      );
    }

    // Check if tickets table exists and has data
    const existingTickets = await db.select().from(tickets);

    if (existingTickets.length === 0) {
      console.log('Adding test tickets...');

      // Get user IDs
      const usersList = await db.select().from(users);
      const studentUser = usersList.find((u) => u.role === 'mahasiswa');
      const staffUser = usersList.find((u) => u.role === 'staff');

      if (studentUser && staffUser) {
        // Add test tickets
        const ticketResults = await db
          .insert(tickets)
          .values([
            {
              ticketNumber: 'TIK-001',
              subject: 'Reset Password SIAKAD',
              description:
                'Saya tidak dapat mengakses akun SIAKAD karena lupa password',
              status: 'in-progress',
              priority: 'high',
              category: 'Account',
              type: 'hardware',
              department: 'IT',
              progress: 50,
              userId: studentUser.id,
              assignedTo: staffUser.id,
            },
            {
              ticketNumber: 'TIK-002',
              subject: 'Masalah Login Elearning',
              description:
                'Tidak bisa login ke elearning meskipun sudah menggunakan username dan password yang benar',
              status: 'completed',
              priority: 'medium',
              category: 'Software',
              type: 'software',
              department: 'IT',
              progress: 100,
              userId: studentUser.id,
              assignedTo: staffUser.id,
              completedAt: new Date(),
            },
            {
              ticketNumber: 'TIK-003',
              subject: 'Permintaan Akses Laboratorium',
              description:
                'Mengajukan akses ke Laboratorium Jaringan untuk praktikum mandiri',
              status: 'pending',
              priority: 'low',
              category: 'Kebutuhan Layanan',
              type: 'access',
              department: 'Facilities',
              progress: 20,
              userId: studentUser.id,
            },
          ])
          .returning();

        console.log('Test tickets added successfully');

        // Add test messages
        if (ticketResults.length > 0) {
          console.log('Adding test messages...');

          await db.insert(ticketMessages).values([
            {
              ticketId: ticketResults[0].id,
              userId: studentUser.id,
              message:
                'Saya sudah mencoba reset password melalui email tapi tidak berhasil',
            },
            {
              ticketId: ticketResults[0].id,
              userId: staffUser.id,
              message: 'Kami akan membantu Anda. Mohon tunggu sebentar.',
            },
            {
              ticketId: ticketResults[1].id,
              userId: studentUser.id,
              message:
                'Saya sudah mencoba login beberapa kali tapi selalu gagal',
            },
            {
              ticketId: ticketResults[1].id,
              userId: staffUser.id,
              message:
                'Masalah sudah kami perbaiki. Silakan coba login kembali.',
            },
          ]);

          console.log('Test messages added successfully');
        }
      }
    } else {
      console.log(
        `Found ${existingTickets.length} existing tickets, skipping ticket creation`,
      );
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

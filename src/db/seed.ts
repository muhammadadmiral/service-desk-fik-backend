// src/db/seed.ts
import { db } from './index';
import { users, tickets, ticketMessages, ticketAttachments } from './schema';
import type { InferInsertModel } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('🔄 Seeding database...');

  try {
    // ─── 1) Seed Users ─────────────────────────────────────────────────────────
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('✨ Adding users…');

      const adminPwd     = await bcrypt.hash('adminPass!23', 10);
      const dosenPwd     = await bcrypt.hash('dosenPass!23', 10);
      const mahasiswaPwd = await bcrypt.hash('studentPass!23', 10);

      const userInserts: InferInsertModel<typeof users>[] = [];

      // 3 Admin
      for (let i = 1; i <= 3; i++) {
        userInserts.push({
          name:       `Admin User ${i}`,
          email:      `admin${i}@example.com`,
          password:   adminPwd,
          role:       'admin',
          department: 'IT',
        });
      }

      // 5 Dosen Informatika
      for (let i = 1; i <= 5; i++) {
        userInserts.push({
          name:       `Dosen Informatika ${i}`,
          email:      `dosen.informatika${i}@example.com`,
          password:   dosenPwd,
          role:       'dosen',
          department: 'Informatika',
        });
      }

      // 5 Dosen Sistem Informasi
      for (let i = 1; i <= 5; i++) {
        userInserts.push({
          name:       `Dosen SI ${i}`,
          email:      `dosen.si${i}@example.com`,
          password:   dosenPwd,
          role:       'dosen',
          department: 'Sistem Informasi',
        });
      }

      // 10 Mahasiswa contoh (campuran prodi)
      const prodiList = ['Informatika', 'Sistem Informasi', 'Sains Data', 'D3 Sistem Informasi'];
      for (let i = 1; i <= 10; i++) {
        const urut = String(i).padStart(3, '0');
        const prod = prodiList[i % prodiList.length];
        const nimPrefix = {
          'D3 Sistem Informasi': '0',
          'Informatika':         '1',
          'Sistem Informasi':    '2',
          'Sains Data':          '3',
        }[prod]!;

        userInserts.push({
          nim:        `211051${nimPrefix}${urut}`,
          name:       `Mahasiswa ${prod} ${urut}`,
          email:      `211051${nimPrefix}${urut}@kampus.ac.id`,
          password:   mahasiswaPwd,
          role:       'mahasiswa',
          department: prod,
        });
      }

      await db.insert(users).values(userInserts);
      console.log(`✅ Inserted ${userInserts.length} users`);
    } else {
      console.log(`✅ ${existingUsers.length} users already exist → skipping users seed`);
    }

    // ─── 2) Seed Tickets, Messages & Attachments ───────────────────────────────
    const existingTickets = await db.select().from(tickets);
    if (existingTickets.length === 0) {
      console.log('✨ Adding tickets, messages, attachments…');

      const allUsers     = await db.select().from(users);
      const studentUser  = allUsers.find(u => u.role === 'mahasiswa')!;
      const adminUser    = allUsers.find(u => u.role === 'admin')!;
      const now          = new Date();
      const later        = new Date(now.getTime() + 7 * 24 * 3600 * 1000); // +7 days

      // a) Tickets
      const ticketInserts: InferInsertModel<typeof tickets>[] = [
        {
          ticketNumber:         'TIK-001',
          subject:              'Reset Password SIAKAD',
          description:          'Saya lupa password dan tidak menerima email reset.',
          status:               'in-progress',
          priority:             'high',
          category:             'Account',
          type:                 'software',
          department:           'IT',
          progress:             40,
          userId:               studentUser.id,
          assignedTo:           adminUser.id,
          estimatedCompletion:  later,
        },
        {
          ticketNumber: 'TIK-002',
          subject:      'Error 500 pada halaman profil',
          description:  'Ketika membuka profil muncul error 500.',
          status:       'pending',
          priority:     'medium',
          category:     'Software',
          type:         'software',
          department:   'IT',
          progress:     0,
          userId:       studentUser.id,
        },
        {
          ticketNumber:        'TIK-003',
          subject:             'Permohonan Akses Lab',
          description:         'Minta akses lab jaringan malam hari.',
          status:              'completed',
          priority:            'low',
          category:            'Request',
          type:                'access',
          department:          'Facilities',
          progress:            100,
          userId:              studentUser.id,
          assignedTo:          adminUser.id,
          completedAt:         now,
          estimatedCompletion: now,
        },
      ];

      const insertedTickets = await db.insert(tickets)
        .values(ticketInserts)
        .returning();
      console.log(`✅ Inserted ${insertedTickets.length} tickets`);

      // b) Messages
      const messagesInserts: InferInsertModel<typeof ticketMessages>[] = [
        {
          ticketId: insertedTickets[0].id,
          userId:   studentUser.id,
          message:  'Saya sudah klik link reset tapi masih gagal.',
        },
        {
          ticketId: insertedTickets[0].id,
          userId:   adminUser.id,
          message:  'Kami sedang cek server, mohon ditunggu.',
        },
        {
          ticketId: insertedTickets[2].id,
          userId:   studentUser.id,
          message:  'Terima kasih, sudah bisa akses lab.',
        },
      ];
      await db.insert(ticketMessages).values(messagesInserts);
      console.log(`✅ Inserted ${messagesInserts.length} messages`);

 // c) Attachments
 const attachmentsInserts: InferInsertModel<typeof ticketAttachments>[] = [
  {
    ticketId: insertedTickets[0].id,
    userId:   studentUser.id,
    fileName: 'error_screenshot.png',
    fileSize: 102400,                           // dalam bytes
    fileType: 'image/png',
    filePath: '/uploads/error_screenshot.png',
  },
  {
    ticketId: insertedTickets[1].id,
    userId:   studentUser.id,
    fileName: 'profile_error.log',
    fileSize: 2048,
    fileType: 'text/plain',
    filePath: '/uploads/profile_error.log',
  },
];
await db.insert(ticketAttachments).values(attachmentsInserts);
console.log(`✅ Inserted ${attachmentsInserts.length} attachments`);
} else {
console.log(`✅ ${existingTickets.length} tickets already exist → skipping tickets/messages/attachments`);
}

console.log('🎉 Seeding completed successfully');
} catch (error) {
console.error('❌ Error seeding database:', error);
} finally {
process.exit(0);
}
}

seed().catch(err => {
console.error('❌ Seeding failed:', err);
process.exit(1);
});

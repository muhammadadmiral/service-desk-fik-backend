// src/db/seed.ts
import { db } from './index';
import { users, tickets, ticketMessages, ticketAttachments } from './schema';
import type { InferInsertModel } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('🔄 Starting database seed...');

  try {
    // ─── 1) Check and Clear Existing Data ─────────────────────────────────────
    console.log('🧹 Clearing existing data...');
    await db.delete(ticketAttachments);
    await db.delete(ticketMessages);
    await db.delete(tickets);
    await db.delete(users);
    console.log('✅ Database cleared');

    // ─── 2) Seed Users ─────────────────────────────────────────────────────────
    console.log('✨ Adding users...');

    const hashedPasswords = {
      admin: await bcrypt.hash('admin123', 10),
      dosen: await bcrypt.hash('dosen123', 10),
      mahasiswa: await bcrypt.hash('mahasiswa123', 10),
    };

    const userInserts: InferInsertModel<typeof users>[] = [];

    // 3 Admin users
    userInserts.push(
      {
        name: 'Super Admin',
        email: 'superadmin@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'admin',
        department: 'IT Support',
      },
      {
        name: 'Admin IT Support',
        email: 'admin.it@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'admin',
        department: 'IT Support',
      },
      {
        name: 'Admin Layanan',
        email: 'admin.layanan@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'admin',
        department: 'Layanan Akademik',
      },
    );

    // 10 Dosen (5 Informatika, 5 SI)
    const dosenInformatika = [
      'Dr. Budi Santoso, M.Kom',
      'Dr. Siti Rahayu, M.T',
      'Prof. Ahmad Wijaya, Ph.D',
      'Dr. Dewi Kusuma, M.Cs',
      'Dr. Rudi Hermawan, M.Kom',
    ];

    const dosenSI = [
      'Dr. Andi Pratama, M.SI',
      'Dr. Maya Sari, M.M',
      'Dr. Joko Widodo, M.T.I',
      'Dr. Rina Wati, M.Kom',
      'Dr. Hendra Gunawan, M.SI',
    ];

    // Dosen Informatika
    dosenInformatika.forEach((name, i) => {
      userInserts.push({
        nip: `19700${i + 1}01200${i + 1}`,
        name,
        email: `dosen.if${i + 1}@fik.ac.id`,
        password: hashedPasswords.dosen,
        role: 'dosen',
        department: 'Informatika',
      });
    });

    // Dosen Sistem Informasi
    dosenSI.forEach((name, i) => {
      userInserts.push({
        nip: `19750${i + 1}01200${i + 1}`,
        name,
        email: `dosen.si${i + 1}@fik.ac.id`,
        password: hashedPasswords.dosen,
        role: 'dosen',
        department: 'Sistem Informasi',
      });
    });

    // 20 Mahasiswa (various departments)
    const mahasiswaData = [
      // Informatika
      { nim: '21105101001', name: 'Ahmad Fauzi', dept: 'Informatika' },
      { nim: '21105101002', name: 'Budi Setiawan', dept: 'Informatika' },
      { nim: '21105101003', name: 'Citra Dewi', dept: 'Informatika' },
      { nim: '21105101004', name: 'Dika Pratama', dept: 'Informatika' },
      { nim: '21105101005', name: 'Eka Putri', dept: 'Informatika' },

      // Sistem Informasi
      { nim: '21105102001', name: 'Fajar Nugroho', dept: 'Sistem Informasi' },
      { nim: '21105102002', name: 'Gita Sahara', dept: 'Sistem Informasi' },
      { nim: '21105102003', name: 'Hadi Pranoto', dept: 'Sistem Informasi' },
      { nim: '21105102004', name: 'Indah Permata', dept: 'Sistem Informasi' },
      { nim: '21105102005', name: 'Joko Susilo', dept: 'Sistem Informasi' },

      // Sains Data
      { nim: '21105103001', name: 'Kevin Wijaya', dept: 'Sains Data' },
      { nim: '21105103002', name: 'Lina Marlina', dept: 'Sains Data' },
      { nim: '21105103003', name: 'Miko Ardian', dept: 'Sains Data' },
      { nim: '21105103004', name: 'Nina Sari', dept: 'Sains Data' },
      { nim: '21105103005', name: 'Omar Hakim', dept: 'Sains Data' },

      // D3 Sistem Informasi
      { nim: '21105100001', name: 'Putri Ayu', dept: 'D3 Sistem Informasi' },
      { nim: '21105100002', name: 'Qori Islami', dept: 'D3 Sistem Informasi' },
      { nim: '21105100003', name: 'Rizky Aditya', dept: 'D3 Sistem Informasi' },
      { nim: '21105100004', name: 'Sinta Bella', dept: 'D3 Sistem Informasi' },
      { nim: '21105100005', name: 'Toni Saputra', dept: 'D3 Sistem Informasi' },
    ];

    mahasiswaData.forEach((mhs) => {
      userInserts.push({
        nim: mhs.nim,
        name: mhs.name,
        email: `${mhs.nim}@student.fik.ac.id`,
        password: hashedPasswords.mahasiswa,
        role: 'mahasiswa',
        department: mhs.dept,
      });
    });

    const insertedUsers = await db
      .insert(users)
      .values(userInserts)
      .returning();
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // ─── 3) Seed Tickets ───────────────────────────────────────────────────────
    console.log('✨ Adding tickets...');

    // Get random users for assignments
    const admins = insertedUsers.filter((u) => u.role === 'admin');
    const dosens = insertedUsers.filter((u) => u.role === 'dosen');
    const mahasiswas = insertedUsers.filter((u) => u.role === 'mahasiswa');

    const ticketInserts: InferInsertModel<typeof tickets>[] = [];
    const now = new Date();

    // Various ticket samples
    const ticketSamples = [
      // SIAKAD Issues
      {
        subject: 'Tidak bisa login SIAKAD',
        description:
          'Sudah mencoba reset password berkali-kali tetapi tetap tidak bisa login ke SIAKAD.',
        category: 'Account',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
      },
      {
        subject: 'Error saat input KRS',
        description:
          'Muncul error "Session Expired" ketika mencoba submit KRS.',
        category: 'Software',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
      },
      {
        subject: 'Nilai tidak muncul di SIAKAD',
        description:
          'Nilai mata kuliah Algoritma dan Pemrograman semester lalu belum muncul.',
        category: 'Data',
        type: 'software',
        priority: 'medium',
        department: 'Akademik',
      },

      // WiFi & Network
      {
        subject: 'WiFi di Lab tidak bisa connect',
        description:
          'WiFi di Lab Komputer lantai 3 tidak bisa diakses sejak pagi.',
        category: 'Network',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
      },
      {
        subject: 'Internet lambat di perpustakaan',
        description:
          'Koneksi internet sangat lambat di area perpustakaan, susah untuk akses jurnal online.',
        category: 'Network',
        type: 'software',
        priority: 'medium',
        department: 'IT Support',
      },

      // Email Issues
      {
        subject: 'Email kampus tidak bisa menerima pesan',
        description:
          'Email kampus saya tidak menerima email dari luar kampus sejak 3 hari lalu.',
        category: 'Email',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
      },
      {
        subject: 'Reset password email kampus',
        description: 'Lupa password email kampus, mohon bantuan reset.',
        category: 'Account',
        type: 'software',
        priority: 'medium',
        department: 'IT Support',
      },

      // Lab Access
      {
        subject: 'Request akses Lab AI',
        description:
          'Saya ingin akses ke Lab AI untuk mengerjakan tugas akhir tentang machine learning.',
        category: 'Request',
        type: 'access',
        priority: 'medium',
        department: 'Facilities',
      },
      {
        subject: 'Kartu akses lab rusak',
        description:
          'Kartu akses lab saya tidak terbaca di scanner, mohon penggantian.',
        category: 'Hardware',
        type: 'hardware',
        priority: 'medium',
        department: 'Facilities',
      },

      // Hardware Issues
      {
        subject: 'Komputer di Lab crash terus',
        description:
          'PC nomor 15 di Lab Programming selalu blue screen saat menjalankan IDE.',
        category: 'Hardware',
        type: 'hardware',
        priority: 'high',
        department: 'IT Support',
      },
      {
        subject: 'Printer Lab tidak bisa print',
        description:
          'Printer di Lab Jaringan error "Paper Jam" padahal kertas tidak macet.',
        category: 'Hardware',
        type: 'hardware',
        priority: 'medium',
        department: 'IT Support',
      },

      // Academic Requests
      {
        subject: 'Request surat keterangan aktif',
        description:
          'Perlu surat keterangan aktif kuliah untuk keperluan beasiswa.',
        category: 'Request',
        type: 'document',
        priority: 'low',
        department: 'Akademik',
      },
      {
        subject: 'Permohonan perpanjangan deadline tugas',
        description:
          'Mohon perpanjangan deadline tugas Web Programming karena sakit.',
        category: 'Request',
        type: 'document',
        priority: 'medium',
        department: 'Akademik',
      },

      // Software License
      {
        subject: 'Request license MATLAB',
        description:
          'Butuh license MATLAB untuk mata kuliah Komputasi Numerik.',
        category: 'Request',
        type: 'software',
        priority: 'medium',
        department: 'IT Support',
      },
      {
        subject: 'Office 365 tidak bisa aktivasi',
        description:
          'Sudah login dengan email kampus tapi Office 365 tetap minta aktivasi.',
        category: 'Software',
        type: 'software',
        priority: 'medium',
        department: 'IT Support',
      },
    ];

    // Create tickets with various statuses
    ticketSamples.forEach((sample, index) => {
      const ticketNum = String(index + 1).padStart(3, '0');
      const userId = mahasiswas[index % mahasiswas.length].id;

      // Vary the status
      let status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
      let progress = 0;
      let assignedTo = null;
      let completedAt = null;
      let estimatedCompletion = null;

      if (index < 5) {
        status = 'completed';
        progress = 100;
        assignedTo = admins[index % admins.length].id;
        completedAt = new Date(
          now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
      } else if (index < 10) {
        status = 'in-progress';
        progress = Math.floor(Math.random() * 80) + 10;
        assignedTo = admins[index % admins.length].id;
        estimatedCompletion = new Date(
          now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
      } else if (index < 12) {
        status = 'cancelled';
        progress = 0;
      } else {
        status = 'pending';
        progress = 0;
      }

      ticketInserts.push({
        ticketNumber: `TIK-${ticketNum}`,
        subject: sample.subject,
        description: sample.description,
        status,
        priority: sample.priority,
        category: sample.category,
        type: sample.type,
        department: sample.department,
        progress,
        userId,
        assignedTo,
        completedAt,
        estimatedCompletion,
        createdAt: new Date(
          now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
      });
    });

    const insertedTickets = await db
      .insert(tickets)
      .values(ticketInserts)
      .returning();
    console.log(`✅ Inserted ${insertedTickets.length} tickets`);

    // ─── 4) Seed Messages ─────────────────────────────────────────────────────
    console.log('✨ Adding messages...');

    const messageInserts: InferInsertModel<typeof ticketMessages>[] = [];

    // Add messages to some tickets
    insertedTickets.slice(0, 10).forEach((ticket, index) => {
      const ticketUser = insertedUsers.find((u) => u.id === ticket.userId);
      const assignedAdmin = ticket.assignedTo
        ? insertedUsers.find((u) => u.id === ticket.assignedTo)
        : null;

      // Initial message from user
      messageInserts.push({
        ticketId: ticket.id,
        userId: ticket.userId,
        message: `${ticket.description}\n\nMohon bantuan segera.`,
        createdAt: new Date(ticket.createdAt.getTime() + 5 * 60 * 1000),
      });

      // Admin response if assigned
      if (assignedAdmin) {
        messageInserts.push({
          ticketId: ticket.id,
          userId: assignedAdmin.id,
          message:
            'Terima kasih atas laporannya. Kami sedang memeriksa masalah ini.',
          createdAt: new Date(ticket.createdAt.getTime() + 30 * 60 * 1000),
        });

        // User follow up
        messageInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          message: 'Apakah ada update untuk masalah ini?',
          createdAt: new Date(ticket.createdAt.getTime() + 24 * 60 * 60 * 1000),
        });

        // Admin update
        if (ticket.status === 'completed') {
          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedAdmin.id,
            message:
              'Masalah sudah selesai diperbaiki. Silakan coba lagi dan konfirmasi jika masih ada kendala.',
            createdAt: new Date(ticket.completedAt!.getTime() - 10 * 60 * 1000),
          });

          messageInserts.push({
            ticketId: ticket.id,
            userId: ticket.userId,
            message: 'Terima kasih, masalah sudah teratasi!',
            createdAt: ticket.completedAt!,
          });
        }
      }
    });

    await db.insert(ticketMessages).values(messageInserts);
    console.log(`✅ Inserted ${messageInserts.length} messages`);

    // ─── 5) Seed Attachments ──────────────────────────────────────────────────
    console.log('✨ Adding attachments...');

    const attachmentInserts: InferInsertModel<typeof ticketAttachments>[] = [];

    // Add attachments to some tickets
    insertedTickets.slice(0, 8).forEach((ticket, index) => {
      if (index % 2 === 0) {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          fileName: `screenshot_error_${index + 1}.png`,
          fileSize: Math.floor(Math.random() * 500000) + 100000,
          fileType: 'image/png',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/screenshot_error_${index + 1}.png`,
        });
      }

      if (index % 3 === 0) {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          fileName: `error_log_${index + 1}.txt`,
          fileSize: Math.floor(Math.random() * 50000) + 1000,
          fileType: 'text/plain',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/error_log_${index + 1}.txt`,
        });
      }
    });

    await db.insert(ticketAttachments).values(attachmentInserts);
    console.log(`✅ Inserted ${attachmentInserts.length} attachments`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin.it@fik.ac.id / admin123');
    console.log('Dosen: dosen.if1@fik.ac.id / dosen123');
    console.log('Mahasiswa: 21105101001@student.fik.ac.id / mahasiswa123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed
seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

// src/db/seed.ts
import { db } from './index';
import { 
  users, 
  tickets, 
  ticketMessages, 
  ticketAttachments,
  ticketWorkflows,
  ticketAnalytics,
} from './schema';
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
    await db.delete(ticketWorkflows);
    await db.delete(ticketAnalytics);
    console.log('✅ Database cleared');

    // ─── 2) Seed Users ─────────────────────────────────────────────────────────
    console.log('✨ Adding users...');

    const hashedPasswords = {
      admin: await bcrypt.hash('admin123', 10),
      dosen: await bcrypt.hash('dosen123', 10),
      mahasiswa: await bcrypt.hash('mahasiswa123', 10),
    };

    const userInserts: InferInsertModel<typeof users>[] = [];

    // Executive users (Wadek, etc.)
    userInserts.push(
      {
        name: 'Dr. Sri Mulyani, M.Kom',
        email: 'wadek1@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'executive',
        department: 'Akademik',
        position: 'Wadek 1',
      },
      {
        name: 'Dr. Bambang Sutrisno, M.M',
        email: 'wadek2@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'executive',
        department: 'Keuangan & SDM',
        position: 'Wadek 2',
      },
      {
        name: 'Dr. Indra Wijaya, M.T',
        email: 'wadek3@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'executive',
        department: 'Kemahasiswaan',
        position: 'Wadek 3',
      },
    );
    
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
    const executives = insertedUsers.filter((u) => u.role === 'executive');
    const admins = insertedUsers.filter((u) => u.role === 'admin');
    const dosens = insertedUsers.filter((u) => u.role === 'dosen');
    const mahasiswas = insertedUsers.filter((u) => u.role === 'mahasiswa');

    const ticketInserts: InferInsertModel<typeof tickets>[] = [];
    const now = new Date();

    // Various ticket samples with SLA
    const ticketSamples = [
      // SIAKAD Issues
      {
        subject: 'Tidak bisa login SIAKAD',
        description:
          'Sudah mencoba reset password berkali-kali tetapi tetap tidak bisa login ke SIAKAD.',
        category: 'Academic',
        subcategory: 'SIAKAD error',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
        slaHours: 4,
      },
      {
        subject: 'Error saat input KRS',
        description:
          'Muncul error "Session Expired" ketika mencoba submit KRS.',
        category: 'Academic',
        subcategory: 'Error KRS',
        type: 'software',
        priority: 'urgent',
        department: 'IT Support',
        slaHours: 2,
      },
      {
        subject: 'Nilai tidak muncul di SIAKAD',
        description:
          'Nilai mata kuliah Algoritma dan Pemrograman semester lalu belum muncul.',
        category: 'Academic',
        subcategory: 'Nilai tidak muncul',
        type: 'software',
        priority: 'medium',
        department: 'Akademik',
        slaHours: 24,
      },

      // Financial Issues
      {
        subject: 'Pembayaran UKT belum terkonfirmasi',
        description:
          'Sudah bayar UKT 3 hari lalu tapi status masih belum lunas di sistem.',
        category: 'Financial',
        subcategory: 'Pembayaran UKT',
        type: 'financial',
        priority: 'high',
        department: 'Keuangan',
        slaHours: 8,
      },
      {
        subject: 'Error cetak kwitansi pembayaran',
        description:
          'Tidak bisa cetak kwitansi pembayaran UKT, tombol cetak tidak berfungsi.',
        category: 'Financial',
        subcategory: 'Tagihan',
        type: 'software',
        priority: 'medium',
        department: 'Keuangan',
        slaHours: 24,
      },

      // WiFi & Network
      {
        subject: 'WiFi di Lab tidak bisa connect',
        description:
          'WiFi di Lab Komputer lantai 3 tidak bisa diakses sejak pagi.',
        category: 'Technical',
        subcategory: 'WiFi/Network',
        type: 'hardware',
        priority: 'high',
        department: 'IT Support',
        slaHours: 4,
      },
      {
        subject: 'Internet lambat di perpustakaan',
        description:
          'Koneksi internet sangat lambat di area perpustakaan, susah untuk akses jurnal online.',
        category: 'Technical',
        subcategory: 'WiFi/Network',
        type: 'software',
        priority: 'medium',
        department: 'IT Support',
        slaHours: 12,
      },

      // Facility Issues
      {
        subject: 'AC rusak di ruang 403',
        description:
          'AC di ruang kelas 403 tidak dingin, sangat panas saat kuliah siang.',
        category: 'Facility',
        subcategory: 'AC rusak',
        type: 'hardware',
        priority: 'high',
        department: 'Fasilitas',
        slaHours: 8,
      },
      {
        subject: 'Proyektor rusak di ruang 302',
        description:
          'Proyektor di ruang 302 tidak menyala, lampu indikator berkedip merah.',
        category: 'Facility',
        subcategory: 'Proyektor rusak',
        type: 'hardware',
        priority: 'urgent',
        department: 'Fasilitas',
        slaHours: 4,
      },

      // Administrative Issues
      {
        subject: 'Request surat keterangan aktif',
        description:
          'Perlu surat keterangan aktif kuliah untuk keperluan beasiswa.',
        category: 'Administrative',
        subcategory: 'Surat keterangan',
        type: 'document',
        priority: 'low',
        department: 'Administrasi',
        slaHours: 48,
      },
      {
        subject: 'Transkrip nilai tidak update',
        description:
          'Transkrip nilai belum update nilai semester kemarin.',
        category: 'Academic',
        subcategory: 'Transkrip nilai',
        type: 'document',
        priority: 'medium',
        department: 'Akademik',
        slaHours: 24,
      },
    ];

    // Create tickets with various statuses and SLA
    ticketSamples.forEach((sample, index) => {
      const ticketNum = String(index + 1).padStart(3, '0');
      const userId = mahasiswas[index % mahasiswas.length].id;

      // Calculate SLA deadline
      const slaDeadline = new Date(now);
      slaDeadline.setHours(slaDeadline.getHours() + sample.slaHours);

      // Vary the status and assignments
      let status: 'pending' | 'disposisi' | 'in-progress' | 'completed' | 'cancelled';
      let progress = 0;
      let assignedTo = null;
      let completedAt = null;
      let estimatedCompletion = null;
      let slaStatus: 'on-time' | 'at-risk' | 'breached' = 'on-time';
      let disposisiChain = '[]';
      let currentHandler = null;
      let firstResponseTime = null;
      let resolutionTime = null;

      if (index < 3) {
        // Completed tickets
        status = 'completed';
        progress = 100;
        assignedTo = admins[index % admins.length].id;
        completedAt = new Date(
          now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
        firstResponseTime = Math.floor(Math.random() * 60) + 10;
        resolutionTime = Math.floor(Math.random() * 1440) + 60;
        slaStatus = 'on-time';
      } else if (index < 6) {
        // In progress tickets
        status = 'in-progress';
        progress = Math.floor(Math.random() * 80) + 10;
        assignedTo = admins[index % admins.length].id;
        currentHandler = assignedTo;
        estimatedCompletion = new Date(
          now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
        firstResponseTime = Math.floor(Math.random() * 30) + 5;
      } else if (index < 8) {
        // Disposisi tickets
        status = 'disposisi';
        progress = 20;
        const executive = executives[index % executives.length];
        const admin = admins[index % admins.length];
        assignedTo = admin.id;
        currentHandler = admin.id;
        
        // Create disposisi chain
        const chain = [
          {
            from: userId,
            to: executive.id,
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            reason: 'Initial review',
          },
          {
            from: executive.id,
            to: admin.id,
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            reason: 'Assigned to technical team',
          },
        ];
        disposisiChain = JSON.stringify(chain);
      } else {
        // Pending tickets
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
        subcategory: sample.subcategory,
        type: sample.type,
        department: sample.department,
        progress,
        userId,
        assignedTo,
        currentHandler,
        completedAt,
        estimatedCompletion,
        slaDeadline,
        slaStatus,
        disposisiChain,
        firstResponseTime,
        resolutionTime,
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
    insertedTickets.slice(0, 8).forEach((ticket, index) => {
      const ticketUser = insertedUsers.find((u) => u.id === ticket.userId);
      const assignedAdmin = ticket.assignedTo
        ? insertedUsers.find((u) => u.id === ticket.assignedTo)
        : null;

      // Initial message from user
      messageInserts.push({
        ticketId: ticket.id,
        userId: ticket.userId,
        message: `${ticket.description}\n\nMohon bantuan segera.`,
        messageType: 'comment',
        isInternal: false,
        createdAt: new Date(ticket.createdAt.getTime() + 5 * 60 * 1000),
      });

      // Admin response if assigned
      if (assignedAdmin) {
        messageInserts.push({
          ticketId: ticket.id,
          userId: assignedAdmin.id,
          message:
            'Terima kasih atas laporannya. Kami sedang memeriksa masalah ini.',
          messageType: 'comment',
          isInternal: false,
          createdAt: new Date(ticket.createdAt.getTime() + 30 * 60 * 1000),
        });

        // Internal note
        messageInserts.push({
          ticketId: ticket.id,
          userId: assignedAdmin.id,
          message:
            'Internal note: Perlu koordinasi dengan tim teknis untuk masalah ini.',
          messageType: 'internal_note',
          isInternal: true,
          createdAt: new Date(ticket.createdAt.getTime() + 45 * 60 * 1000),
        });

        // User follow up
        messageInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          message: 'Apakah ada update untuk masalah ini?',
          messageType: 'comment',
          isInternal: false,
          createdAt: new Date(ticket.createdAt.getTime() + 24 * 60 * 60 * 1000),
        });

        // Admin update
        if (ticket.status === 'completed') {
          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedAdmin.id,
            message:
              'Masalah sudah selesai diperbaiki. Silakan coba lagi dan konfirmasi jika masih ada kendala.',
            messageType: 'comment',
            isInternal: false,
            createdAt: new Date(ticket.completedAt!.getTime() - 10 * 60 * 1000),
          });

          messageInserts.push({
            ticketId: ticket.id,
            userId: ticket.userId,
            message: 'Terima kasih, masalah sudah teratasi!',
            messageType: 'comment',
            isInternal: false,
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
    insertedTickets.slice(0, 6).forEach((ticket, index) => {
      if (index % 2 === 0) {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          fileName: `screenshot_error_${index + 1}.png`,
          fileSize: Math.floor(Math.random() * 500000) + 100000,
          fileType: 'image/png',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/screenshot_error_${index + 1}.png`,
          cloudinaryId: `service-desk/tickets/${ticket.ticketNumber}/screenshot_error_${index + 1}`,
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
          cloudinaryId: `service-desk/tickets/${ticket.ticketNumber}/error_log_${index + 1}`,
        });
      }
    });

    await db.insert(ticketAttachments).values(attachmentInserts);
    console.log(`✅ Inserted ${attachmentInserts.length} attachments`);

    // ─── 6) Seed Workflows ────────────────────────────────────────────────────
    console.log('✨ Adding workflows...');

    const workflowInserts: InferInsertModel<typeof ticketWorkflows>[] = [
      {
        name: 'Financial Ticket Flow',
        category: 'Financial',
        steps: JSON.stringify([
          { role: 'executive', position: 'Wadek 2', action: 'review' },
          { role: 'admin', department: 'Keuangan', action: 'process' },
          { role: 'staff', department: 'TU Keuangan', action: 'execute' }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 24,
          requireApproval: true
        }),
        isDefault: true,
        isActive: true,
        createdBy: executives[1]?.id, // Wadek 2
      },
      {
        name: 'Academic Ticket Flow',
        category: 'Academic',
        steps: JSON.stringify([
          { role: 'executive', position: 'Wadek 1', action: 'review' },
          { role: 'admin', department: 'Akademik', action: 'process' },
          { role: 'staff', department: 'TU Akademik', action: 'execute' }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 48,
          requireApproval: false
        }),
        isDefault: true,
        isActive: true,
        createdBy: executives[0]?.id, // Wadek 1
      },
      {
        name: 'Technical Support Flow',
        category: 'Technical',
        steps: JSON.stringify([
          { role: 'admin', department: 'IT Support', action: 'assess' },
          { role: 'staff', department: 'Technical Team', action: 'resolve' }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 4,
          requireApproval: false
        }),
        isDefault: true,
        isActive: true,
        createdBy: admins[0]?.id,
      },
      {
        name: 'Facility Management Flow',
        category: 'Facility',
        steps: JSON.stringify([
          { role: 'admin', department: 'Fasilitas', action: 'assess' },
          { role: 'staff', department: 'Maintenance', action: 'fix' }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 8,
          requireApproval: false
        }),
        isDefault: true,
        isActive: true,
        createdBy: admins[0]?.id,
      }
    ];

    await db.insert(ticketWorkflows).values(workflowInserts);
    console.log(`✅ Inserted ${workflowInserts.length} workflows`);
    
    // ─── 7) Seed Analytics ────────────────────────────────────────────────────
    console.log('✨ Adding analytics data...');

    const analyticsData: InferInsertModel<typeof ticketAnalytics>[] = [];
    
    // Generate analytics for the past 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate hourly analytics for each department
      ['IT Support', 'Akademik', 'Keuangan', 'Fasilitas'].forEach(department => {
        ['Technical', 'Academic', 'Financial', 'Facility'].forEach(category => {
          // Random data for demonstration
          const totalTickets = Math.floor(Math.random() * 20) + 5;
          const closedTickets = Math.floor(Math.random() * totalTickets);
          const openTickets = totalTickets - closedTickets;
          
          analyticsData.push({
            date,
            hour: null,
            department,
            category,
            totalTickets,
            openTickets,
            closedTickets,
            averageResolutionTime: Math.floor(Math.random() * 480) + 60,
            averageResponseTime: Math.floor(Math.random() * 60) + 10,
            slaBreaches: Math.floor(Math.random() * 3),
            customerSatisfactionAverage: Math.floor(Math.random() * 2) + 3,
          });
        });
      });
    }
    
    await db.insert(ticketAnalytics).values(analyticsData);
    console.log(`✅ Inserted ${analyticsData.length} analytics records`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Executive (Wadek 1): wadek1@fik.ac.id / admin123');
    console.log('Executive (Wadek 2): wadek2@fik.ac.id / admin123');
    console.log('Executive (Wadek 3): wadek3@fik.ac.id / admin123');
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
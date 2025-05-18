// src/db/seed.ts
import { db } from './src/db/index';
import { 
  users, 
  tickets, 
  ticketMessages, 
  ticketAttachments,
  ticketWorkflows,
  ticketAnalytics,
  disposisiHistory,
  ticketTemplates,
  ticketAuditLogs,
  userAuditLogs,
  notifications,
  settings
} from './src/db/schema/index';
import type { InferInsertModel } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('🔄 Starting database seed...');

  try {
    // ─── 1) Check and Clear Existing Data ─────────────────────────────────────
    console.log('🧹 Clearing existing data...');
    
    // Clear data in reverse order of dependencies
    await db.delete(ticketAuditLogs);
    await db.delete(userAuditLogs);
    await db.delete(notifications);
    await db.delete(disposisiHistory);
    await db.delete(ticketAttachments);
    await db.delete(ticketMessages);
    await db.delete(tickets);
    await db.delete(ticketTemplates);
    await db.delete(ticketWorkflows);
    await db.delete(ticketAnalytics);
    await db.delete(settings);
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

    // Executive users (Wadek, etc.)
    userInserts.push(
      {
        name: 'Dr. Sri Mulyani, M.Kom',
        email: 'wadek1@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'executive',
        department: 'Akademik',
        position: 'Wadek 1',
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(),
      },
      {
        name: 'Dr. Bambang Sutrisno, M.M',
        email: 'wadek2@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'executive',
        department: 'Keuangan & SDM',
        position: 'Wadek 2',
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(),
      },
      {
        name: 'Dr. Indra Wijaya, M.T',
        email: 'wadek3@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'executive',
        department: 'Kemahasiswaan',
        position: 'Wadek 3',
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(),
      },
    );
    
    // Admin users
    userInserts.push(
      {
        name: 'Super Admin',
        email: 'superadmin@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'admin',
        department: 'IT Support',
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(),
      },
      {
        name: 'Admin IT Support',
        email: 'admin.it@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'admin',
        department: 'IT Support',
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(),
      },
      {
        name: 'Admin Layanan',
        email: 'admin.layanan@fik.ac.id',
        password: hashedPasswords.admin,
        role: 'admin',
        department: 'Layanan Akademik',
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(),
      },
    );

    // Dosen for each program
    const dosenData = [
      // Informatika
      {
        name: 'Dr. Budi Santoso, M.Kom',
        email: 'budi.santoso@fik.ac.id',
        nip: '197001012001121001',
        programStudi: 'S1 Informatika',
      },
      {
        name: 'Dr. Siti Rahayu, M.T',
        email: 'siti.rahayu@fik.ac.id',
        nip: '197002012001122002',
        programStudi: 'S1 Informatika',
      },
      {
        name: 'Prof. Ahmad Wijaya, Ph.D',
        email: 'ahmad.wijaya@fik.ac.id',
        nip: '197003012001123003',
        programStudi: 'S1 Informatika',
      },
      
      // Sistem Informasi
      {
        name: 'Dr. Andi Pratama, M.SI',
        email: 'andi.pratama@fik.ac.id',
        nip: '197501012001121004',
        programStudi: 'S1 Sistem Informasi',
      },
      {
        name: 'Dr. Maya Sari, M.M',
        email: 'maya.sari@fik.ac.id',
        nip: '197502012001122005',
        programStudi: 'S1 Sistem Informasi',
      },
      {
        name: 'Dr. Joko Widodo, M.T.I',
        email: 'joko.widodo@fik.ac.id',
        nip: '197503012001123006',
        programStudi: 'S1 Sistem Informasi',
      },
      
      // D3 Sistem Informasi
      {
        name: 'Dr. Dewi Kusuma, M.Cs',
        email: 'dewi.kusuma@fik.ac.id',
        nip: '197601012001121007',
        programStudi: 'D3 Sistem Informasi',
      },
      {
        name: 'Dr. Rudi Hermawan, M.Kom',
        email: 'rudi.hermawan@fik.ac.id',
        nip: '197602012001122008',
        programStudi: 'D3 Sistem Informasi',
      },
      
      // Sains Data
      {
        name: 'Dr. Rina Wati, M.Kom',
        email: 'rina.wati@fik.ac.id',
        nip: '197701012001121009',
        programStudi: 'S1 Sains Data',
      },
      {
        name: 'Dr. Hendra Gunawan, M.SI',
        email: 'hendra.gunawan@fik.ac.id',
        nip: '197702012001122010',
        programStudi: 'S1 Sains Data',
      },
    ];

    // Add dosen
    dosenData.forEach((dosen) => {
      userInserts.push({
        nip: dosen.nip,
        name: dosen.name,
        email: dosen.email,
        password: hashedPasswords.dosen,
        role: 'dosen',
        department: dosen.programStudi,
        programStudi: dosen.programStudi,
        fakultas: 'Fakultas Ilmu Komputer',
        status: 'active',
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      });
    });

    // Mahasiswa data with correct NIM format and angkatan
    const mahasiswaData = [
      // D3 Sistem Informasi (2110501xxx)
      { nim: '2110501001', name: 'Putri Ayu', programStudi: 'D3 Sistem Informasi', angkatan: '2021' },
      { nim: '2110501002', name: 'Qori Islami', programStudi: 'D3 Sistem Informasi', angkatan: '2021' },
      { nim: '2110501003', name: 'Rizky Aditya', programStudi: 'D3 Sistem Informasi', angkatan: '2021' },
      { nim: '2110501004', name: 'Sinta Bella', programStudi: 'D3 Sistem Informasi', angkatan: '2021' },
      { nim: '2110501005', name: 'Toni Saputra', programStudi: 'D3 Sistem Informasi', angkatan: '2021' },
      { nim: '2210501001', name: 'Umar Baskoro', programStudi: 'D3 Sistem Informasi', angkatan: '2022' },
      { nim: '2210501002', name: 'Vina Muliani', programStudi: 'D3 Sistem Informasi', angkatan: '2022' },

      // S1 Informatika (2110511xxx)
      { nim: '2110511001', name: 'Ahmad Fauzi', programStudi: 'S1 Informatika', angkatan: '2021' },
      { nim: '2110511002', name: 'Budi Setiawan', programStudi: 'S1 Informatika', angkatan: '2021' },
      { nim: '2110511003', name: 'Citra Dewi', programStudi: 'S1 Informatika', angkatan: '2021' },
      { nim: '2110511004', name: 'Dika Pratama', programStudi: 'S1 Informatika', angkatan: '2021' },
      { nim: '2110511005', name: 'Eka Putri', programStudi: 'S1 Informatika', angkatan: '2021' },
      { nim: '2210511001', name: 'Wawan Setiadi', programStudi: 'S1 Informatika', angkatan: '2022' },
      { nim: '2210511002', name: 'Xena Paramita', programStudi: 'S1 Informatika', angkatan: '2022' },

      // S1 Sistem Informasi (2110512xxx)
      { nim: '2110512001', name: 'Fajar Nugroho', programStudi: 'S1 Sistem Informasi', angkatan: '2021' },
      { nim: '2110512002', name: 'Gita Sahara', programStudi: 'S1 Sistem Informasi', angkatan: '2021' },
      { nim: '2110512003', name: 'Hadi Pranoto', programStudi: 'S1 Sistem Informasi', angkatan: '2021' },
      { nim: '2110512004', name: 'Indah Permata', programStudi: 'S1 Sistem Informasi', angkatan: '2021' },
      { nim: '2110512005', name: 'Joko Susilo', programStudi: 'S1 Sistem Informasi', angkatan: '2021' },
      { nim: '2210512001', name: 'Yanti Komalasari', programStudi: 'S1 Sistem Informasi', angkatan: '2022' },
      { nim: '2210512002', name: 'Zaki Firmansyah', programStudi: 'S1 Sistem Informasi', angkatan: '2022' },

      // S1 Sains Data (2110514xxx)
      { nim: '2110514001', name: 'Kevin Wijaya', programStudi: 'S1 Sains Data', angkatan: '2021' },
      { nim: '2110514002', name: 'Lina Marlina', programStudi: 'S1 Sains Data', angkatan: '2021' },
      { nim: '2110514003', name: 'Miko Ardian', programStudi: 'S1 Sains Data', angkatan: '2021' },
      { nim: '2110514004', name: 'Nina Sari', programStudi: 'S1 Sains Data', angkatan: '2021' },
      { nim: '2110514005', name: 'Omar Hakim', programStudi: 'S1 Sains Data', angkatan: '2021' },
      { nim: '2210514001', name: 'Aditya Nugraha', programStudi: 'S1 Sains Data', angkatan: '2022' },
      { nim: '2210514002', name: 'Bayu Pratama', programStudi: 'S1 Sains Data', angkatan: '2022' },
    ];

    // Add mahasiswa
    mahasiswaData.forEach((mhs) => {
      userInserts.push({
        nim: mhs.nim,
        name: mhs.name,
        email: `${mhs.nim}@student.fik.ac.id`,
        password: hashedPasswords.mahasiswa,
        role: 'mahasiswa',
        department: mhs.programStudi,
        programStudi: mhs.programStudi,
        fakultas: 'Fakultas Ilmu Komputer',
        angkatan: mhs.angkatan,
        status: 'active',
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      });
    });

    const insertedUsers = await db
      .insert(users)
      .values(userInserts)
      .returning();
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // ─── 3) Seed Settings ──────────────────────────────────────────────────────
    console.log('✨ Adding settings...');

    const settingsInserts: InferInsertModel<typeof settings>[] = [
      // Site settings
      {
        key: 'site.title',
        value: 'Service Desk FIK',
        type: 'string',
        category: 'site',
        description: 'Judul website',
      },
      {
        key: 'site.description',
        value: 'Sistem layanan helpdesk untuk Fakultas Ilmu Komputer',
        type: 'string',
        category: 'site',
        description: 'Deskripsi website',
      },
      {
        key: 'site.language',
        value: 'id',
        type: 'string',
        category: 'site',
        description: 'Bahasa default aplikasi',
      },
      {
        key: 'site.timezone',
        value: 'Asia/Jakarta',
        type: 'string',
        category: 'site',
        description: 'Zona waktu default',
      },
      
      // Ticket settings
      {
        key: 'ticket.categories',
        value: JSON.stringify([
          {
            name: 'Academic',
            subcategories: [
              'SIAKAD error',
              'Error KRS',
              'Nilai tidak muncul',
              'Transkrip nilai',
              'Absensi',
              'Jadwal kuliah',
              'Lainnya'
            ]
          },
          {
            name: 'Financial',
            subcategories: [
              'Pembayaran UKT',
              'Tagihan',
              'Pembayaran lainnya',
              'Beasiswa',
              'Lainnya'
            ]
          },
          {
            name: 'Technical',
            subcategories: [
              'WiFi/Network',
              'PC/Laptop',
              'Software',
              'Email kampus',
              'Akun sistem',
              'Lainnya'
            ]
          },
          {
            name: 'Facility',
            subcategories: [
              'AC rusak',
              'Proyektor rusak',
              'Ruangan',
              'Furnitur',
              'Kebersihan',
              'Lainnya'
            ]
          },
          {
            name: 'Administrative',
            subcategories: [
              'Surat keterangan',
              'Surat izin',
              'Legalisir dokumen',
              'Permintaan data',
              'Lainnya'
            ]
          }
        ]),
        type: 'json',
        category: 'ticket',
        description: 'Kategori dan subkategori tiket',
      },
      {
        key: 'ticket.priorities',
        value: JSON.stringify(['low', 'medium', 'high', 'urgent']),
        type: 'json',
        category: 'ticket',
        description: 'Prioritas tiket',
      },
      {
        key: 'ticket.types',
        value: JSON.stringify(['software', 'hardware', 'document', 'financial', 'other']),
        type: 'json',
        category: 'ticket',
        description: 'Tipe tiket',
      },
      {
        key: 'ticket.departments',
        value: JSON.stringify(['IT Support', 'Akademik', 'Keuangan', 'Fasilitas', 'Administrasi']),
        type: 'json',
        category: 'ticket',
        description: 'Departemen untuk tiket',
      },
      {
        key: 'ticket.sla',
        value: JSON.stringify({low: 72, medium: 48, high: 24, urgent: 4}),
        type: 'json',
        category: 'ticket',
        description: 'SLA dalam jam untuk setiap prioritas',
      },
      {
        key: 'ticket.autoCloseAfter',
        value: '168',
        type: 'number',
        category: 'ticket',
        description: 'Tutup tiket otomatis setelah jam (default: 168 jam = 7 hari)',
      },
      {
        key: 'ticket.defaultPriority',
        value: 'medium',
        type: 'string',
        category: 'ticket',
        description: 'Prioritas default untuk tiket baru',
      },
      {
        key: 'ticket.autoAssignTickets',
        value: 'true',
        type: 'boolean',
        category: 'ticket',
        description: 'Assign tiket secara otomatis',
      },
      {
        key: 'ticket.requireApproval',
        value: 'false',
        type: 'boolean',
        category: 'ticket',
        description: 'Memerlukan persetujuan sebelum tiket selesai',
      },
      {
        key: 'ticket.ticketPrefix',
        value: 'FIK',
        type: 'string',
        category: 'ticket',
        description: 'Prefix untuk nomor tiket',
      },
      
      // Email settings
      {
        key: 'email.notification',
        value: 'true',
        type: 'boolean',
        category: 'email',
        description: 'Apakah notifikasi email aktif',
      },
      {
        key: 'email.templates',
        value: JSON.stringify({
          new_ticket: 'Halo {{name}}, tiket {{ticket_number}} telah dibuat.',
          ticket_closed: 'Tiket {{ticket_number}} telah ditutup. Terima kasih.'
        }),
        type: 'json',
        category: 'email',
        description: 'Template email notifikasi',
      },
      
      // Notification settings
      {
        key: 'notification.inApp',
        value: 'true',
        type: 'boolean',
        category: 'notification',
        description: 'Aktifkan notifikasi in-app',
      },
      {
        key: 'notification.onNewTicket',
        value: 'true',
        type: 'boolean',
        category: 'notification',
        description: 'Notifikasi untuk tiket baru',
      },
      {
        key: 'notification.onTicketUpdate',
        value: 'true',
        type: 'boolean',
        category: 'notification',
        description: 'Notifikasi untuk update tiket',
      },
      
      // SLA settings
      {
        key: 'sla.enableSLA',
        value: 'true',
        type: 'boolean',
        category: 'sla',
        description: 'Aktifkan SLA',
      },
      {
        key: 'sla.sendNotifications',
        value: 'true',
        type: 'boolean',
        category: 'sla',
        description: 'Kirim notifikasi untuk SLA',
      },
      
      // Feedback settings
      {
        key: 'feedback.options',
        value: JSON.stringify(['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']),
        type: 'json',
        category: 'feedback',
        description: 'Opsi kepuasan pengguna setelah tiket ditutup',
      },
      
      // Access control settings
      {
        key: 'access.permissions',
        value: JSON.stringify({
          mahasiswa: ['create_ticket', 'view_own_tickets'],
          dosen: ['view_assigned', 'respond_ticket'],
          admin: ['manage_all'],
          executive: ['view_reports']
        }),
        type: 'json',
        category: 'access',
        description: 'Daftar role dan izin akses',
      },
    ];

    await db.insert(settings).values(settingsInserts);
    console.log(`✅ Inserted ${settingsInserts.length} settings`);

    // ─── 4) Seed Tickets ───────────────────────────────────────────────────────
    console.log('✨ Adding tickets...');

    // Get users by role for assignments
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
          'Sudah mencoba reset password berkali-kali tetapi tetap tidak bisa login ke SIAKAD. Muncul pesan error "Invalid credentials" meskipun password sudah benar.',
        category: 'Academic',
        subcategory: 'SIAKAD error',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
        slaHours: 4,
        tags: JSON.stringify(['login', 'password', 'siakad']),
      },
      {
        subject: 'Error saat input KRS',
        description:
          'Muncul error "Session Expired" ketika mencoba submit KRS. Sudah dicoba beberapa kali dan selalu gagal di tahap yang sama.',
        category: 'Academic',
        subcategory: 'Error KRS',
        type: 'software',
        priority: 'urgent',
        department: 'IT Support',
        slaHours: 2,
        tags: JSON.stringify(['krs', 'session', 'siakad']),
      },
      {
        subject: 'Nilai tidak muncul di SIAKAD',
        description:
          'Nilai mata kuliah Algoritma dan Pemrograman semester lalu belum muncul di SIAKAD. Teman-teman yang lain sudah bisa melihat nilai mereka.',
        category: 'Academic',
        subcategory: 'Nilai tidak muncul',
        type: 'software',
        priority: 'medium',
        department: 'Akademik',
        slaHours: 24,
        tags: JSON.stringify(['nilai', 'siakad']),
      },

      // Financial Issues
      {
        subject: 'Pembayaran UKT belum terkonfirmasi',
        description:
          'Sudah bayar UKT 3 hari lalu melalui Bank BNI tapi status masih belum lunas di sistem. Bukti pembayaran sudah ada dan valid.',
        category: 'Financial',
        subcategory: 'Pembayaran UKT',
        type: 'financial',
        priority: 'high',
        department: 'Keuangan',
        slaHours: 8,
        tags: JSON.stringify(['ukt', 'pembayaran', 'bank']),
      },
      {
        subject: 'Error cetak kwitansi pembayaran',
        description:
          'Tidak bisa cetak kwitansi pembayaran UKT, tombol cetak tidak berfungsi. Sudah dicoba di beberapa browser berbeda.',
        category: 'Financial',
        subcategory: 'Tagihan',
        type: 'software',
        priority: 'medium',
        department: 'Keuangan',
        slaHours: 24,
        tags: JSON.stringify(['kwitansi', 'cetak', 'ukt']),
      },

      // WiFi & Network
      {
        subject: 'WiFi di Lab tidak bisa connect',
        description:
          'WiFi di Lab Komputer lantai 3 tidak bisa diakses sejak pagi. Sudah restart perangkat tapi tetap tidak bisa terhubung.',
        category: 'Technical',
        subcategory: 'WiFi/Network',
        type: 'hardware',
        priority: 'high',
        department: 'IT Support',
        slaHours: 4,
        tags: JSON.stringify(['wifi', 'jaringan', 'lab']),
      },
      {
        subject: 'Internet lambat di perpustakaan',
        description:
          'Koneksi internet sangat lambat di area perpustakaan, susah untuk akses jurnal online. Kecepatan download hanya 100 Kbps.',
        category: 'Technical',
        subcategory: 'WiFi/Network',
        type: 'hardware',
        priority: 'medium',
        department: 'IT Support',
        slaHours: 12,
        tags: JSON.stringify(['wifi', 'lambat', 'perpustakaan']),
      },

      // Facility Issues
      {
        subject: 'AC rusak di ruang 403',
        description:
          'AC di ruang kelas 403 tidak dingin, sangat panas saat kuliah siang. Suhu ruangan mencapai 30 derajat Celsius.',
        category: 'Facility',
        subcategory: 'AC rusak',
        type: 'hardware',
        priority: 'high',
        department: 'Fasilitas',
        slaHours: 8,
        tags: JSON.stringify(['ac', 'ruangan', 'panas']),
      },
      {
        subject: 'Proyektor rusak di ruang 302',
        description:
          'Proyektor di ruang 302 tidak menyala, lampu indikator berkedip merah. Sudah dicoba restart dan periksa kabel tapi tetap tidak berfungsi.',
        category: 'Facility',
        subcategory: 'Proyektor rusak',
        type: 'hardware',
        priority: 'urgent',
        department: 'Fasilitas',
        slaHours: 4,
        tags: JSON.stringify(['proyektor', 'rusak', 'kelas']),
      },

      // Administrative Issues
      {
        subject: 'Request surat keterangan aktif',
        description:
          'Perlu surat keterangan aktif kuliah untuk keperluan beasiswa. Dibutuhkan paling lambat tanggal 15 bulan ini.',
        category: 'Administrative',
        subcategory: 'Surat keterangan',
        type: 'document',
        priority: 'low',
        department: 'Administrasi',
        slaHours: 48,
        tags: JSON.stringify(['surat', 'keterangan', 'beasiswa']),
      },
      {
        subject: 'Transkrip nilai tidak update',
        description:
          'Transkrip nilai belum update nilai semester kemarin. Dibutuhkan untuk pendaftaran magang.',
        category: 'Academic',
        subcategory: 'Transkrip nilai',
        type: 'document',
        priority: 'medium',
        department: 'Akademik',
        slaHours: 24,
        tags: JSON.stringify(['transkrip', 'nilai', 'update']),
      },
      
      // Additional tickets for variety
      {
        subject: 'Masalah akses e-journal',
        description:
          'Tidak bisa mengakses e-journal IEEE melalui jaringan kampus. Muncul pesan error "Access Denied".',
        category: 'Technical',
        subcategory: 'Software',
        type: 'software',
        priority: 'medium',
        department: 'IT Support',
        slaHours: 24,
        tags: JSON.stringify(['e-journal', 'akses', 'ieee']),
      },
      {
        subject: 'Kursi rusak di ruang 201',
        description:
          'Ada 3 kursi yang rusak di ruang 201, tidak bisa digunakan untuk perkuliahan.',
        category: 'Facility',
        subcategory: 'Furnitur',
        type: 'hardware',
        priority: 'low',
        department: 'Fasilitas',
        slaHours: 72,
        tags: JSON.stringify(['kursi', 'rusak', 'kelas']),
      },
      {
        subject: 'Permintaan data mahasiswa angkatan 2021',
        description:
          'Membutuhkan data statistik mahasiswa angkatan 2021 untuk keperluan penelitian dosen.',
        category: 'Administrative',
        subcategory: 'Permintaan data',
        type: 'document',
        priority: 'medium',
        department: 'Administrasi',
        slaHours: 48,
        tags: JSON.stringify(['data', 'mahasiswa', 'statistik']),
      },
      {
        subject: 'Masalah login email kampus',
        description:
          'Tidak bisa login ke email kampus, muncul pesan "Invalid credentials" padahal password sudah benar.',
        category: 'Technical',
        subcategory: 'Email kampus',
        type: 'software',
        priority: 'high',
        department: 'IT Support',
        slaHours: 12,
        tags: JSON.stringify(['email', 'login', 'password']),
      },
      {
        subject: 'Kebocoran di toilet lantai 2',
        description:
          'Ada kebocoran air di toilet lantai 2 gedung FIK, air menggenang dan membuat lantai licin.',
        category: 'Facility',
        subcategory: 'Kebersihan',
        type: 'hardware',
        priority: 'high',
        department: 'Fasilitas',
        slaHours: 6,
        tags: JSON.stringify(['toilet', 'bocor', 'air']),
      },
      {
        subject: 'Permintaan legalisir ijazah',
        description:
          'Membutuhkan legalisir ijazah dan transkrip untuk keperluan pendaftaran S2.',
        category: 'Administrative',
        subcategory: 'Legalisir dokumen',
        type: 'document',
        priority: 'low',
        department: 'Administrasi',
        slaHours: 72,
        tags: JSON.stringify(['legalisir', 'ijazah', 'transkrip']),
      },
      {
        subject: 'Masalah pembayaran denda perpustakaan',
        description:
          'Sudah membayar denda keterlambatan buku perpustakaan tapi masih tercatat belum lunas di sistem.',
        category: 'Financial',
        subcategory: 'Pembayaran lainnya',
        type: 'financial',
        priority: 'medium',
        department: 'Keuangan',
        slaHours: 24,
        tags: JSON.stringify(['denda', 'perpustakaan', 'pembayaran']),
      },
      {
        subject: 'Jadwal kuliah bentrok',
        description:
          'Ada bentrok jadwal kuliah Basis Data dan Jaringan Komputer di hari Selasa jam 13.00-15.30.',
        category: 'Academic',
        subcategory: 'Jadwal kuliah',
        type: 'software',
        priority: 'high',
        department: 'Akademik',
        slaHours: 24,
        tags: JSON.stringify(['jadwal', 'bentrok', 'kuliah']),
      },
      {
        subject: 'Masalah absensi online',
        description:
          'Sistem absensi online tidak merekam kehadiran meskipun sudah melakukan check-in tepat waktu.',
        category: 'Academic',
        subcategory: 'Absensi',
        type: 'software',
        priority: 'high',
        department: 'Akademik',
        slaHours: 12,
        tags: JSON.stringify(['absensi', 'online', 'kehadiran']),
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
      let customerSatisfaction = null;
      let metadata = '{}';

      // Distribute tickets across different statuses
      if (index < 5) {
        // Completed tickets
        status = 'completed';
        progress = 100;
        assignedTo = index % 2 === 0 ? admins[index % admins.length].id : dosens[index % dosens.length].id;
        completedAt = new Date(
          now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
        firstResponseTime = Math.floor(Math.random() * 60) + 10;
        resolutionTime = Math.floor(Math.random() * 1440) + 60;
        slaStatus = 'on-time';
        customerSatisfaction = Math.floor(Math.random() * 3) + 3; // 3-5 rating
        metadata = JSON.stringify({
          resolution_notes: 'Masalah telah diselesaikan sesuai dengan permintaan.',
          resolution_steps: ['Identifikasi masalah', 'Analisis root cause', 'Implementasi solusi', 'Verifikasi'],
          followup_required: false
        });
      } else if (index < 10) {
        // In progress tickets
        status = 'in-progress';
        progress = Math.floor(Math.random() * 80) + 10;
        assignedTo = index % 2 === 0 ? admins[index % admins.length].id : dosens[index % dosens.length].id;
        currentHandler = assignedTo;
        estimatedCompletion = new Date(
          now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
        firstResponseTime = Math.floor(Math.random() * 30) + 5;
        slaStatus = index % 3 === 0 ? 'at-risk' : 'on-time';
        metadata = JSON.stringify({
          current_step: 'Investigasi masalah',
          blockers: index % 3 === 0 ? ['Menunggu informasi tambahan dari pengguna'] : [],
          notes: 'Sedang dalam proses penanganan'
        });
      } else if (index < 15) {
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
            notes: 'Mohon ditindaklanjuti'
          },
          {
            from: executive.id,
            to: admin.id,
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            reason: 'Assigned to technical team',
            notes: 'Tolong ditangani secepatnya'
          },
        ];
        disposisiChain = JSON.stringify(chain);
        slaStatus = 'on-time';
        metadata = JSON.stringify({
          forwarding_reason: 'Membutuhkan penanganan dari tim teknis',
          priority_change: false
        });
      } else {
        // Pending tickets
        status = 'pending';
        progress = 0;
        slaStatus = index % 5 === 0 ? 'at-risk' : 'on-time';
        metadata = JSON.stringify({
          submission_channel: 'web portal',
          initial_category: sample.category
        });
      }

      // Add some cancelled tickets
      if (index === 7 || index === 14) {
        status = 'cancelled';
        progress = 0;
        metadata = JSON.stringify({
          cancellation_reason: 'Permintaan pengguna',
          cancelled_by: 'user',
          notes: 'Masalah sudah teratasi dengan cara lain'
        });
      }

      // Add some breached SLA tickets
      if (index === 6 || index === 13) {
        slaStatus = 'breached';
        if (status === 'completed') {
          resolutionTime = sample.slaHours * 60 + Math.floor(Math.random() * 120) + 30; // Exceed SLA by 30-150 minutes
        }
        metadata = JSON.stringify({
          sla_breach_reason: 'Kompleksitas masalah lebih tinggi dari perkiraan',
          escalation_level: 1
        });
      }

      ticketInserts.push({
        ticketNumber: `FIK-${ticketNum}`,
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
        customerSatisfaction,
        tags: sample.tags,
        metadata,
        isSimple: index % 4 === 0, // Some tickets are simple
        escalationLevel: slaStatus === 'breached' ? 1 : 0,
        reopenCount: index === 8 ? 1 : 0, // One ticket has been reopened
        createdAt: new Date(
          now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(
          now.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000,
        ),
      });
    });

    const insertedTickets = await db
      .insert(tickets)
      .values(ticketInserts)
      .returning();
    console.log(`✅ Inserted ${insertedTickets.length} tickets`);

    // ─── 5) Seed Messages ─────────────────────────────────────────────────────
    console.log('✨ Adding messages...');

    const messageInserts: InferInsertModel<typeof ticketMessages>[] = [];

    // Add messages to tickets
    insertedTickets.forEach((ticket, index) => {
      const ticketUser = insertedUsers.find((u) => u.id === ticket.userId);
      const assignedUser = ticket.assignedTo
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

      // Admin/assigned user response if assigned
      if (assignedUser) {
        // First response
        messageInserts.push({
          ticketId: ticket.id,
          userId: assignedUser.id,
          message:
            'Terima kasih atas laporannya. Kami sedang memeriksa masalah ini dan akan segera memberikan update.',
          messageType: 'comment',
          isInternal: false,
          createdAt: new Date(ticket.createdAt.getTime() + 30 * 60 * 1000),
        });

        // Internal note
        messageInserts.push({
          ticketId: ticket.id,
          userId: assignedUser.id,
          message:
            'Internal note: Perlu koordinasi dengan tim teknis untuk masalah ini. Sudah diinformasikan ke bagian terkait.',
          messageType: 'internal_note',
          isInternal: true,
          createdAt: new Date(ticket.createdAt.getTime() + 45 * 60 * 1000),
        });

        // Status change message
        if (ticket.status !== 'pending') {
          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedUser.id,
            message: `Status tiket diubah menjadi "${ticket.status}".`,
            messageType: 'status_change',
            isInternal: false,
            createdAt: new Date(ticket.createdAt.getTime() + 60 * 60 * 1000),
          });
        }

        // User follow up after some time
        messageInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          message: 'Apakah ada update untuk masalah ini? Saya masih mengalami kendala yang sama.',
          messageType: 'comment',
          isInternal: false,
          createdAt: new Date(ticket.createdAt.getTime() + 24 * 60 * 60 * 1000),
        });

        // Progress update from assigned user
        if (ticket.status === 'in-progress') {
          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedUser.id,
            message: `Kami sedang dalam proses penanganan masalah ini. Progress saat ini ${ticket.progress}%. Estimasi penyelesaian dalam ${Math.floor(Math.random() * 3) + 1} hari kerja.`,
            messageType: 'comment',
            isInternal: false,
            createdAt: new Date(ticket.createdAt.getTime() + 26 * 60 * 60 * 1000),
          });
        }

        // Completed ticket messages
        if (ticket.status === 'completed' && ticket.completedAt) {
          // Resolution message
          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedUser.id,
            message:
              'Masalah sudah selesai diperbaiki. Silakan coba lagi dan konfirmasi jika masih ada kendala.',
            messageType: 'comment',
            isInternal: false,
            createdAt: new Date(ticket.completedAt.getTime() - 10 * 60 * 1000),
          });

          // Status change to completed
          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedUser.id,
            message: 'Status tiket diubah menjadi "completed".',
            messageType: 'status_change',
            isInternal: false,
            createdAt: ticket.completedAt,
          });

          // User confirmation
          messageInserts.push({
            ticketId: ticket.id,
            userId: ticket.userId,
            message: 'Terima kasih, masalah sudah teratasi!',
            messageType: 'comment',
            isInternal: false,
            createdAt: new Date(ticket.completedAt.getTime() + 60 * 60 * 1000),
          });
        }

        // Cancelled ticket messages
        if (ticket.status === 'cancelled') {
          messageInserts.push({
            ticketId: ticket.id,
            userId: ticket.userId,
            message: 'Saya ingin membatalkan tiket ini karena masalah sudah teratasi dengan cara lain.',
            messageType: 'comment',
            isInternal: false,
            createdAt: new Date(ticket.updatedAt.getTime() - 30 * 60 * 1000),
          });

          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedUser.id,
            message: 'Status tiket diubah menjadi "cancelled" sesuai permintaan pengguna.',
            messageType: 'status_change',
            isInternal: false,
            createdAt: ticket.updatedAt,
          });
        }

        // Reopened ticket (for ticket with reopenCount > 0)
        if (ticket.reopenCount && ticket.reopenCount > 0) {
          const reopenDate = new Date(ticket.updatedAt.getTime() - 2 * 24 * 60 * 60 * 1000);
          
          messageInserts.push({
            ticketId: ticket.id,
            userId: ticket.userId,
            message: 'Masalah muncul kembali setelah beberapa hari. Mohon bantuan untuk pengecekan ulang.',
            messageType: 'comment',
            isInternal: false,
            createdAt: reopenDate,
          });

          messageInserts.push({
            ticketId: ticket.id,
            userId: assignedUser.id,
            message: 'Tiket dibuka kembali untuk penanganan lebih lanjut.',
            messageType: 'status_change',
            isInternal: false,
            createdAt: new Date(reopenDate.getTime() + 30 * 60 * 1000),
          });
        }
      }
    });

    await db.insert(ticketMessages).values(messageInserts);
    console.log(`✅ Inserted ${messageInserts.length} messages`);

    // ─── 6) Seed Attachments ──────────────────────────────────────────────────
    console.log('✨ Adding attachments...');

    const attachmentInserts: InferInsertModel<typeof ticketAttachments>[] = [];

    // Add attachments to tickets
    insertedTickets.forEach((ticket, index) => {
      // Screenshot attachments for some tickets
      if (index % 3 === 0) {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          fileName: `screenshot_error_${ticket.id}.png`,
          fileSize: Math.floor(Math.random() * 500000) + 100000,
          fileType: 'image/png',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/screenshot_error_${ticket.id}.png`,
          cloudinaryId: `service-desk/tickets/${ticket.ticketNumber}/screenshot_error_${ticket.id}`,
          createdAt: ticket.createdAt,
        });
      }

      // Error log attachments for some tickets
      if (index % 4 === 0) {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          fileName: `error_log_${ticket.id}.txt`,
          fileSize: Math.floor(Math.random() * 50000) + 1000,
          fileType: 'text/plain',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/error_log_${ticket.id}.txt`,
          cloudinaryId: `service-desk/tickets/${ticket.ticketNumber}/error_log_${ticket.id}`,
          createdAt: ticket.createdAt,
        });
      }

      // PDF attachments for document-related tickets
      if (ticket.type === 'document') {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.userId,
          fileName: `document_${ticket.id}.pdf`,
          fileSize: Math.floor(Math.random() * 2000000) + 500000,
          fileType: 'application/pdf',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/document_${ticket.id}.pdf`,
          cloudinaryId: `service-desk/tickets/${ticket.ticketNumber}/document_${ticket.id}`,
          createdAt: ticket.createdAt,
        });
      }

      // Solution attachments for completed tickets
      if (ticket.status === 'completed' && ticket.assignedTo) {
        attachmentInserts.push({
          ticketId: ticket.id,
          userId: ticket.assignedTo,
          fileName: `solution_${ticket.id}.pdf`,
          fileSize: Math.floor(Math.random() * 1000000) + 200000,
          fileType: 'application/pdf',
          filePath: `/uploads/tickets/${ticket.ticketNumber}/solution_${ticket.id}.pdf`,
          cloudinaryId: `service-desk/tickets/${ticket.ticketNumber}/solution_${ticket.id}`,
          createdAt: ticket.completedAt || ticket.updatedAt,
        });
      }
    });

    await db.insert(ticketAttachments).values(attachmentInserts);
    console.log(`✅ Inserted ${attachmentInserts.length} attachments`);

    // ─── 7) Seed Disposisi History ───────────────────────────────────────────
    console.log('✨ Adding disposisi history...');

    const disposisiInserts: InferInsertModel<typeof disposisiHistory>[] = [];

    // Add disposisi history for tickets with status 'disposisi' or that have been assigned
    insertedTickets.forEach((ticket) => {
      if (ticket.status === 'disposisi' || ticket.assignedTo) {
        // Parse existing disposisi chain if any
let existingChain: any[] = [];

if (ticket.disposisiChain) {
  try {
    existingChain = JSON.parse(ticket.disposisiChain as string);
  } catch (e) {
    console.warn(`⚠️  Failed to parse disposisiChain for ticket ID ${ticket.id}:`, e);
    existingChain = [];
  }
}
        
        // If there's an existing chain, create disposisi history records
        if (existingChain.length > 0) {
          existingChain.forEach((item: any) => {
            disposisiInserts.push({
              ticketId: ticket.id,
              fromUserId: item.from,
              toUserId: item.to,
              reason: item.reason,
              notes: item.notes || 'Mohon ditindaklanjuti',
              progressUpdate: 10,
              createdAt: new Date(item.timestamp),
              actionType: 'forward',
              expectedCompletionTime: new Date(new Date(item.timestamp).getTime() + 24 * 60 * 60 * 1000),
              slaImpact: 'maintained',
            });
          });
        } 
        // If no existing chain but ticket is assigned, create a direct assignment
        else if (ticket.assignedTo && ticket.userId) {
          // Find an executive to be the middle person
          const executive = insertedUsers.find(u => u.role === 'executive');
          
          if (executive) {
            // First disposisi: from user to executive
            disposisiInserts.push({
              ticketId: ticket.id,
              fromUserId: ticket.userId,
              toUserId: executive.id,
              reason: 'Initial review',
              notes: 'Mohon ditindaklanjuti',
              progressUpdate: 5,
              createdAt: new Date(ticket.createdAt.getTime() + 30 * 60 * 1000),
              actionType: 'forward',
              expectedCompletionTime: new Date(ticket.createdAt.getTime() + 24 * 60 * 60 * 1000),
              slaImpact: 'maintained',
            });
            
            // Second disposisi: from executive to assigned person
            disposisiInserts.push({
              ticketId: ticket.id,
              fromUserId: executive.id,
              toUserId: ticket.assignedTo,
              reason: 'Assigned for resolution',
              notes: 'Tolong ditangani sesuai SLA',
              progressUpdate: 10,
              createdAt: new Date(ticket.createdAt.getTime() + 60 * 60 * 1000),
              actionType: 'forward',
              expectedCompletionTime: ticket.slaDeadline || new Date(ticket.createdAt.getTime() + 48 * 60 * 60 * 1000),
              slaImpact: 'maintained',
            });
          }
        }
      }
    });

    await db.insert(disposisiHistory).values(disposisiInserts);
    console.log(`✅ Inserted ${disposisiInserts.length} disposisi history records`);

    // ─── 8) Seed Ticket Templates ───────────────────────────────────────────
    console.log('✨ Adding ticket templates...');

    const templateInserts: InferInsertModel<typeof ticketTemplates>[] = [
      {
        name: 'Masalah Login SIAKAD',
        category: 'Academic',
        subcategory: 'SIAKAD error',
        department: 'IT Support',
        priority: 'high',
        templateContent: JSON.stringify({
          subject: 'Masalah Login SIAKAD',
          description: 'Tidak dapat login ke SIAKAD dengan pesan error: {{error_message}}.\n\nLangkah yang sudah dicoba:\n- Reset password\n- Coba browser berbeda\n- Hapus cache dan cookies',
          fields: [
            { name: 'error_message', type: 'text', label: 'Pesan Error', required: true },
            { name: 'browser', type: 'select', label: 'Browser', options: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Lainnya'] },
            { name: 'screenshot', type: 'file', label: 'Screenshot Error', accept: 'image/*' }
          ]
        }),
        autoAssignmentRules: JSON.stringify({
          department: 'IT Support',
          role: 'admin'
        }),
        slaHours: 4,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Permintaan Surat Keterangan Aktif',
        category: 'Administrative',
        subcategory: 'Surat keterangan',
        department: 'Administrasi',
        priority: 'low',
        templateContent: JSON.stringify({
          subject: 'Permintaan Surat Keterangan Aktif',
          description: 'Mohon dibuatkan surat keterangan aktif kuliah untuk keperluan {{purpose}}.\n\nData diri:\nNama: {{name}}\nNIM: {{nim}}\nProgram Studi: {{program_studi}}\nSemester: {{semester}}',
          fields: [
            { name: 'purpose', type: 'text', label: 'Keperluan', required: true },
            { name: 'name', type: 'text', label: 'Nama Lengkap', required: true },
            { name: 'nim', type: 'text', label: 'NIM', required: true },
            { name: 'program_studi', type: 'select', label: 'Program Studi', options: ['S1 Informatika', 'S1 Sistem Informasi', 'D3 Sistem Informasi', 'S1 Sains Data'] },
            { name: 'semester', type: 'number', label: 'Semester', required: true }
          ]
        }),
        autoAssignmentRules: JSON.stringify({
          department: 'Administrasi'
        }),
        slaHours: 48,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Laporan Fasilitas Rusak',
        category: 'Facility',
        subcategory: 'Lainnya',
        department: 'Fasilitas',
        priority: 'medium',
        templateContent: JSON.stringify({
          subject: 'Laporan {{facility_type}} Rusak di {{location}}',
          description: 'Mohon perbaikan {{facility_type}} yang rusak di {{location}}.\n\nDetail kerusakan: {{damage_details}}\n\nKondisi saat ini: {{current_condition}}',
          fields: [
            { name: 'facility_type', type: 'select', label: 'Jenis Fasilitas', options: ['AC', 'Proyektor', 'Kursi', 'Meja', 'Papan Tulis', 'Lampu', 'Lainnya'], required: true },
            { name: 'location', type: 'text', label: 'Lokasi', required: true },
            { name: 'damage_details', type: 'textarea', label: 'Detail Kerusakan', required: true },
            { name: 'current_condition', type: 'textarea', label: 'Kondisi Saat Ini' },
            { name: 'photo', type: 'file', label: 'Foto Kerusakan', accept: 'image/*' }
          ]
        }),
        autoAssignmentRules: JSON.stringify({
          department: 'Fasilitas'
        }),
        slaHours: 24,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Masalah Pembayaran UKT',
        category: 'Financial',
        subcategory: 'Pembayaran UKT',
        department: 'Keuangan',
        priority: 'high',
        templateContent: JSON.stringify({
          subject: 'Masalah Pembayaran UKT Semester {{semester}}',
          description: 'Saya mengalami masalah dengan pembayaran UKT untuk semester {{semester}}.\n\nDetail masalah: {{problem_details}}\n\nTanggal pembayaran: {{payment_date}}\nMetode pembayaran: {{payment_method}}\nNomor referensi: {{reference_number}}',
          fields: [
            { name: 'semester', type: 'text', label: 'Semester', required: true },
            { name: 'problem_details', type: 'textarea', label: 'Detail Masalah', required: true },
            { name: 'payment_date', type: 'date', label: 'Tanggal Pembayaran', required: true },
            { name: 'payment_method', type: 'select', label: 'Metode Pembayaran', options: ['Transfer Bank', 'ATM', 'Internet Banking', 'Mobile Banking', 'Teller Bank'], required: true },
            { name: 'reference_number', type: 'text', label: 'Nomor Referensi' },
            { name: 'receipt', type: 'file', label: 'Bukti Pembayaran', accept: 'image/*,application/pdf', required: true }
          ]
        }),
        autoAssignmentRules: JSON.stringify({
          department: 'Keuangan'
        }),
        slaHours: 8,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Masalah Jaringan WiFi',
        category: 'Technical',
        subcategory: 'WiFi/Network',
        department: 'IT Support',
        priority: 'high',
        templateContent: JSON.stringify({
          subject: 'Masalah Jaringan WiFi di {{location}}',
          description: 'Mengalami masalah dengan jaringan WiFi di {{location}}.\n\nJenis masalah: {{problem_type}}\nDetail masalah: {{problem_details}}\nNama WiFi (SSID): {{wifi_name}}\nPerangkat yang digunakan: {{device}}',
          fields: [
            { name: 'location', type: 'text', label: 'Lokasi', required: true },
            { name: 'problem_type', type: 'select', label: 'Jenis Masalah', options: ['Tidak bisa connect', 'Koneksi lambat', 'Koneksi terputus-putus', 'Tidak ada sinyal', 'Lainnya'], required: true },
            { name: 'problem_details', type: 'textarea', label: 'Detail Masalah', required: true },
            { name: 'wifi_name', type: 'text', label: 'Nama WiFi (SSID)' },
            { name: 'device', type: 'text', label: 'Perangkat yang Digunakan', required: true }
          ]
        }),
        autoAssignmentRules: JSON.stringify({
          department: 'IT Support'
        }),
        slaHours: 4,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    await db.insert(ticketTemplates).values(templateInserts);
    console.log(`✅ Inserted ${templateInserts.length} ticket templates`);

    // ─── 9) Seed Ticket Workflows ───────────────────────────────────────────
    console.log('✨ Adding ticket workflows...');

    const workflowInserts: InferInsertModel<typeof ticketWorkflows>[] = [
      {
        name: 'Financial Ticket Flow',
        category: 'Financial',
        steps: JSON.stringify([
          { role: 'executive', position: 'Wadek 2', action: 'review', timeframe: 4 },
          { role: 'admin', department: 'Keuangan', action: 'process', timeframe: 12 },
          { role: 'staff', department: 'TU Keuangan', action: 'execute', timeframe: 8 }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 24,
          requireApproval: true,
          notifyOnEscalation: true
        }),
        isDefault: true,
        isActive: true,
        createdBy: executives[1]?.id, // Wadek 2
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Academic Ticket Flow',
        category: 'Academic',
        steps: JSON.stringify([
          { role: 'executive', position: 'Wadek 1', action: 'review', timeframe: 8 },
          { role: 'admin', department: 'Akademik', action: 'process', timeframe: 24 },
          { role: 'staff', department: 'TU Akademik', action: 'execute', timeframe: 16 }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 48,
          requireApproval: false,
          notifyOnEscalation: true
        }),
        isDefault: true,
        isActive: true,
        createdBy: executives[0]?.id, // Wadek 1
        createdAt: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Technical Support Flow',
        category: 'Technical',
        steps: JSON.stringify([
          { role: 'admin', department: 'IT Support', action: 'assess', timeframe: 2 },
          { role: 'staff', department: 'Technical Team', action: 'resolve', timeframe: 8 }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 4,
          requireApproval: false,
          notifyOnEscalation: true
        }),
        isDefault: true,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Facility Management Flow',
        category: 'Facility',
        steps: JSON.stringify([
          { role: 'admin', department: 'Fasilitas', action: 'assess', timeframe: 4 },
          { role: 'staff', department: 'Maintenance', action: 'fix', timeframe: 24 }
        ]),
        conditions: JSON.stringify({
          autoEscalate: true,
          escalationHours: 8,
          requireApproval: false,
          notifyOnEscalation: true
        }),
        isDefault: true,
        isActive: true,
        createdBy: admins[0]?.id,
        createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Administrative Document Flow',
        category: 'Administrative',
        steps: JSON.stringify([
          { role: 'admin', department: 'Administrasi', action: 'review', timeframe: 8 },
          { role: 'executive', position: 'Wadek 1', action: 'approve', timeframe: 16 },
          { role: 'staff', department: 'TU Akademik', action: 'process', timeframe: 24 }
        ]),
        conditions: JSON.stringify({
          autoEscalate: false,
          escalationHours: 48,
          requireApproval: true,
          notifyOnEscalation: true
        }),
        isDefault: true,
        isActive: true,
        createdBy: executives[0]?.id,
        createdAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
      },
    ];

    await db.insert(ticketWorkflows).values(workflowInserts);
    console.log(`✅ Inserted ${workflowInserts.length} workflows`);
    
    // ─── 10) Seed Notifications ───────────────────────────────────────────
    console.log('✨ Adding notifications...');

    const notificationInserts: InferInsertModel<typeof notifications>[] = [];
    
    // Create notifications for ticket activities
    insertedTickets.forEach((ticket, index) => {
      // Notification for ticket creator
      notificationInserts.push({
        userId: ticket.userId,
        type: 'ticket_created',
        title: 'Tiket Baru Dibuat',
        message: `Tiket ${ticket.ticketNumber} telah berhasil dibuat dan sedang menunggu ditindaklanjuti.`,
        isRead: Math.random() > 0.3, // 70% chance of being read
        readAt: Math.random() > 0.3 ? new Date(ticket.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        relatedId: ticket.id,
        relatedType: 'ticket',
        createdAt: ticket.createdAt,
      });
      
      // Notification for assigned user
      if (ticket.assignedTo) {
        notificationInserts.push({
          userId: ticket.assignedTo,
          type: 'ticket_assigned',
          title: 'Tiket Ditugaskan',
          message: `Tiket ${ticket.ticketNumber} telah ditugaskan kepada Anda.`,
          isRead: Math.random() > 0.5, // 50% chance of being read
          readAt: Math.random() > 0.5 ? new Date(ticket.createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000) : null,
          relatedId: ticket.id,
          relatedType: 'ticket',
          createdAt: new Date(ticket.createdAt.getTime() + 30 * 60 * 1000),
        });
      }
      
      // Notification for status updates
      if (ticket.status === 'in-progress') {
        notificationInserts.push({
          userId: ticket.userId,
          type: 'ticket_update',
          title: 'Status Tiket Diperbarui',
          message: `Tiket ${ticket.ticketNumber} sedang dalam proses penanganan.`,
          isRead: Math.random() > 0.4, // 60% chance of being read
          readAt: Math.random() > 0.4 ? new Date(ticket.updatedAt.getTime() + Math.random() * 12 * 60 * 60 * 1000) : null,
          relatedId: ticket.id,
          relatedType: 'ticket',
          createdAt: ticket.updatedAt,
        });
      }
      
      // Notification for completed tickets
      if (ticket.status === 'completed') {
        notificationInserts.push({
          userId: ticket.userId,
          type: 'ticket_completed',
          title: 'Tiket Selesai',
          message: `Tiket ${ticket.ticketNumber} telah selesai ditangani. Mohon berikan feedback Anda.`,
          isRead: Math.random() > 0.2, // 80% chance of being read
          readAt: Math.random() > 0.2 ? new Date(ticket.completedAt!.getTime() + Math.random() * 6 * 60 * 60 * 1000) : null,
          relatedId: ticket.id,
          relatedType: 'ticket',
          createdAt: ticket.completedAt!,
        });
      }
      
      // SLA breach notifications
      if (ticket.slaStatus === 'breached') {
        // Notify admin
        admins.forEach(admin => {
          notificationInserts.push({
            userId: admin.id,
            type: 'sla_breach',
            title: 'Pelanggaran SLA',
            message: `Tiket ${ticket.ticketNumber} telah melewati batas waktu SLA.`,
            isRead: Math.random() > 0.3, // 70% chance of being read
            readAt: Math.random() > 0.3 ? new Date(ticket.updatedAt.getTime() + Math.random() * 4 * 60 * 60 * 1000) : null,
            relatedId: ticket.id,
            relatedType: 'ticket',
            createdAt: new Date(ticket.slaDeadline!.getTime() + 10 * 60 * 1000),
          });
        });
        
        // Notify assigned user
        if (ticket.assignedTo) {
          notificationInserts.push({
            userId: ticket.assignedTo,
            type: 'sla_breach',
            title: 'Pelanggaran SLA',
            message: `Tiket ${ticket.ticketNumber} yang ditugaskan kepada Anda telah melewati batas waktu SLA.`,
            isRead: Math.random() > 0.7, // 30% chance of being read
            readAt: Math.random() > 0.7 ? new Date(ticket.updatedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000) : null,
            relatedId: ticket.id,
            relatedType: 'ticket',
            createdAt: new Date(ticket.slaDeadline!.getTime() + 15 * 60 * 1000),
          });
        }
      }
      
      // At-risk SLA notifications
      if (ticket.slaStatus === 'at-risk') {
        // Notify assigned user
        if (ticket.assignedTo) {
          notificationInserts.push({
            userId: ticket.assignedTo,
            type: 'sla_at_risk',
            title: 'SLA Berisiko',
            message: `Tiket ${ticket.ticketNumber} mendekati batas waktu SLA. Mohon segera ditindaklanjuti.`,
            isRead: Math.random() > 0.5, // 50% chance of being read
            readAt: Math.random() > 0.5 ? new Date(ticket.updatedAt.getTime() + Math.random() * 3 * 60 * 60 * 1000) : null,
            relatedId: ticket.id,
            relatedType: 'ticket',
            createdAt: new Date(ticket.slaDeadline!.getTime() - 2 * 60 * 60 * 1000),
          });
        }
      }
      
      // New message notifications
      if (index % 3 === 0) {
        notificationInserts.push({
          userId: ticket.userId,
          type: 'new_message',
          title: 'Pesan Baru',
          message: `Ada pesan baru pada tiket ${ticket.ticketNumber}.`,
          isRead: Math.random() > 0.4, // 60% chance of being read
          readAt: Math.random() > 0.4 ? new Date(now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000) : null,
          relatedId: ticket.id,
          relatedType: 'ticket',
          createdAt: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        });
      }
    });
    
    // System notifications for all users
    insertedUsers.forEach(user => {
      if (user.role !== 'mahasiswa' || Math.random() > 0.7) { // Only some students get system notifications
        notificationInserts.push({
          userId: user.id,
          type: 'system',
          title: 'Pemeliharaan Sistem',
          message: 'Sistem akan mengalami pemeliharaan pada tanggal 15 Juni 2023 pukul 22:00 - 02:00 WIB.',
          isRead: Math.random() > 0.5, // 50% chance of being read
          readAt: Math.random() > 0.5 ? new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
          relatedId: null,
          relatedType: null,
          createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        });
      }
    });
    
    await db.insert(notifications).values(notificationInserts);
    console.log(`✅ Inserted ${notificationInserts.length} notifications`);

    // ─── 11) Seed Ticket Analytics ───────────────────────────────────────────
    console.log('✨ Adding analytics data...');

    const analyticsData: InferInsertModel<typeof ticketAnalytics>[] = [];
    
    // Generate analytics for the past 90 days
    for (let i = 90; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate daily analytics for each department
      ['IT Support', 'Akademik', 'Keuangan', 'Fasilitas', 'Administrasi'].forEach(department => {
        ['Technical', 'Academic', 'Financial', 'Facility', 'Administrative'].forEach(category => {
          // Random data with some patterns
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          // Fewer tickets on weekends
          const baseTotalTickets = isWeekend ? 
            Math.floor(Math.random() * 5) + 1 : 
            Math.floor(Math.random() * 15) + 5;
          
          // More IT tickets on Monday, more Financial tickets near month end
          let totalTickets = baseTotalTickets;
          if (department === 'IT Support' && dayOfWeek === 1) totalTickets += 5;
          if (department === 'Keuangan' && date.getDate() >= 25) totalTickets += 3;
          
          const closedTickets = Math.floor(Math.random() * totalTickets);
          const openTickets = totalTickets - closedTickets;
          
          // SLA breaches more common for high volume days
          const slaBreaches = totalTickets > 10 ? 
            Math.floor(Math.random() * 3) + 1 : 
            Math.floor(Math.random() * 2);
          
          // Customer satisfaction tends to be higher for departments with fewer SLA breaches
          const customerSatisfactionAverage = slaBreaches > 1 ? 
            Math.floor(Math.random() * 2) + 3 : 
            Math.floor(Math.random() * 2) + 4;
          
          analyticsData.push({
            date,
            hour: null, // Daily aggregation
            department,
            category,
            totalTickets,
            openTickets,
            closedTickets,
            averageResolutionTime: Math.floor(Math.random() * 480) + 60, // 1-9 hours
            averageResponseTime: Math.floor(Math.random() * 60) + 10, // 10-70 minutes
            slaBreaches,
            customerSatisfactionAverage,
            createdAt: new Date(),
          });
        });
      });
      
      // Also generate hourly data for the most recent 7 days
      if (i < 7) {
        for (let hour = 8; hour < 17; hour++) { // Working hours 8 AM - 5 PM
          ['IT Support', 'Akademik'].forEach(department => { // Only track hourly for key departments
            const hourlyDate = new Date(date);
            hourlyDate.setHours(hour);
            
            const totalTickets = Math.floor(Math.random() * 5) + 1;
            const closedTickets = Math.floor(Math.random() * totalTickets);
            const openTickets = totalTickets - closedTickets;
            
            analyticsData.push({
              date: hourlyDate,
              hour,
              department,
              category: null, // Aggregated across categories
              totalTickets,
              openTickets,
              closedTickets,
              averageResolutionTime: Math.floor(Math.random() * 240) + 30, // 0.5-4.5 hours
              averageResponseTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
              slaBreaches: Math.floor(Math.random() * 2),
              customerSatisfactionAverage: Math.floor(Math.random() * 2) + 3, // 3-5 rating
              createdAt: new Date(),
            });
          });
        }
      }
    }
    
    await db.insert(ticketAnalytics).values(analyticsData);
    console.log(`✅ Inserted ${analyticsData.length} analytics records`);

    // ─── 12) Seed Ticket Audit Logs ───────────────────────────────────────────
    console.log('✨ Adding audit logs...');

    const ticketAuditInserts: InferInsertModel<typeof ticketAuditLogs>[] = [];
    
    // Create audit logs for ticket activities
    insertedTickets.forEach((ticket) => {
      // Creation audit
      ticketAuditInserts.push({
        ticketId: ticket.id,
        userId: ticket.userId,
        action: 'ticket_created',
        oldValue: null,
        newValue: JSON.stringify({
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          status: 'pending',
          priority: ticket.priority,
          category: ticket.category,
          subcategory: ticket.subcategory,
        }),
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        createdAt: ticket.createdAt,
      });
      
      // Status change audits
      if (ticket.status !== 'pending') {
        const statusChangeTime = new Date(ticket.createdAt.getTime() + 2 * 60 * 60 * 1000);
        
        ticketAuditInserts.push({
          ticketId: ticket.id,
          userId: ticket.assignedTo || admins[0].id,
          action: 'status_changed',
          oldValue: JSON.stringify({ status: 'pending' }),
          newValue: JSON.stringify({ status: ticket.status }),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          createdAt: statusChangeTime,
        });
      }
      
      // Assignment audits
      if (ticket.assignedTo) {
        const assignmentTime = new Date(ticket.createdAt.getTime() + 1 * 60 * 60 * 1000);
        
        ticketAuditInserts.push({
          ticketId: ticket.id,
          userId: executives[0].id,
          action: 'ticket_assigned',
          oldValue: JSON.stringify({ assignedTo: null }),
          newValue: JSON.stringify({ assignedTo: ticket.assignedTo }),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          createdAt: assignmentTime,
        });
      }
      
      // Progress update audits
      if (ticket.progress > 0) {
        const progressUpdateTime = new Date(ticket.createdAt.getTime() + 12 * 60 * 60 * 1000);
        
        ticketAuditInserts.push({
          ticketId: ticket.id,
          userId: ticket.assignedTo || admins[0].id,
          action: 'progress_updated',
          oldValue: JSON.stringify({ progress: 0 }),
          newValue: JSON.stringify({ progress: ticket.progress }),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          createdAt: progressUpdateTime,
        });
      }
      
      // Completion audits
      if (ticket.status === 'completed' && ticket.completedAt) {
        ticketAuditInserts.push({
          ticketId: ticket.id,
          userId: ticket.assignedTo || admins[0].id,
          action: 'ticket_completed',
          oldValue: JSON.stringify({ status: 'in-progress', completedAt: null }),
          newValue: JSON.stringify({ status: 'completed', completedAt: ticket.completedAt }),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          createdAt: ticket.completedAt,
        });
      }
      
      // SLA breach audits
      if (ticket.slaStatus === 'breached') {
        const breachTime = new Date(ticket.slaDeadline!.getTime() + 10 * 60 * 1000);
        
        ticketAuditInserts.push({
          ticketId: ticket.id,
          userId: admins[0].id,
          action: 'sla_breached',
          oldValue: JSON.stringify({ slaStatus: 'at-risk' }),
          newValue: JSON.stringify({ slaStatus: 'breached' }),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          createdAt: breachTime,
        });
      }
    });
    
    await db.insert(ticketAuditLogs).values(ticketAuditInserts);
    console.log(`✅ Inserted ${ticketAuditInserts.length} ticket audit logs`);

    // ─── 13) Seed User Audit Logs ───────────────────────────────────────────
    console.log('✨ Adding user audit logs...');

    const userAuditInserts: InferInsertModel<typeof userAuditLogs>[] = [];
    
    // Create login audit logs for some users
    insertedUsers.forEach((user, index) => {
      if (index % 3 === 0) { // Only create logs for some users
        // Login audit
        userAuditInserts.push({
          userId: user.id,
          action: 'user_login',
          performedBy: user.id,
          oldValue: null,
          newValue: JSON.stringify({
            lastLogin: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          }),
          createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      }
    });
    
    // Create profile update audit logs for some users
    insertedUsers.slice(0, 5).forEach((user) => {
      userAuditInserts.push({
        userId: user.id,
        action: 'profile_updated',
        performedBy: user.id,
        oldValue: JSON.stringify({
          email: user.email,
        }),
        newValue: JSON.stringify({
          email: user.email, // Same email, just for demonstration
        }),
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    });
    
    // Create password change audit logs for some users
    insertedUsers.slice(5, 10).forEach((user) => {
      userAuditInserts.push({
        userId: user.id,
        action: 'password_changed',
        performedBy: user.id,
        oldValue: null, // Don't log actual password values
        newValue: null,
        createdAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      });
    });
    
    // Create admin actions on users
    insertedUsers.slice(10, 15).forEach((user) => {
      userAuditInserts.push({
        userId: user.id,
        action: 'user_status_changed',
        performedBy: admins[0].id,
        oldValue: JSON.stringify({
          status: 'inactive',
        }),
        newValue: JSON.stringify({
          status: 'active',
        }),
        createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      });
    });
    
    await db.insert(userAuditLogs).values(userAuditInserts);
    console.log(`✅ Inserted ${userAuditInserts.length} user audit logs`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Executive (Wadek 1): wadek1@fik.ac.id / admin123');
    console.log('Executive (Wadek 2): wadek2@fik.ac.id / admin123');
    console.log('Executive (Wadek 3): wadek3@fik.ac.id / admin123');
    console.log('Admin: admin.it@fik.ac.id / admin123');
    console.log('Dosen: budi.santoso@fik.ac.id / dosen123');
    console.log('Mahasiswa: 2110511001@student.fik.ac.id / mahasiswa123');
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
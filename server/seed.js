/**
 * Seed script — run once: node seed.js
 * Populates MongoDB with sample hostel data
 */
require('dotenv').config();
const mongoose   = require('mongoose');
const connectDB  = require('./db');
const Room       = require('./models/Room');
const Student    = require('./models/Student');
const FeePayment = require('./models/FeePayment');
const Complaint  = require('./models/Complaint');
const Visitor    = require('./models/Visitor');

async function seed() {
  await connectDB();

  // Clear existing
  await Promise.all([
    Room.deleteMany(), Student.deleteMany(), FeePayment.deleteMany(),
    Complaint.deleteMany(), Visitor.deleteMany(),
  ]);
  console.log('🗑  Cleared existing data');

  // ── Rooms ──────────────────────────────────────────────────────────────
  const roomDefs = [
    // Block A
    { room_number:'A101',block:'A',floor:1,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A102',block:'A',floor:1,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A103',block:'A',floor:1,capacity:2,status:'available',monthly_fee:5000 },
    { room_number:'A104',block:'A',floor:1,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A105',block:'A',floor:1,capacity:2,status:'maintenance',monthly_fee:5000 },
    { room_number:'A106',block:'A',floor:1,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A201',block:'A',floor:2,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A202',block:'A',floor:2,capacity:2,status:'available',monthly_fee:5000 },
    { room_number:'A203',block:'A',floor:2,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A204',block:'A',floor:2,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A205',block:'A',floor:2,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A206',block:'A',floor:2,capacity:2,status:'available',monthly_fee:5000 },
    { room_number:'A301',block:'A',floor:3,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A302',block:'A',floor:3,capacity:2,status:'occupied',monthly_fee:5000 },
    { room_number:'A303',block:'A',floor:3,capacity:2,status:'available',monthly_fee:5000 },
    // Block B
    { room_number:'B101',block:'B',floor:1,capacity:2,status:'occupied',monthly_fee:4500 },
    { room_number:'B102',block:'B',floor:1,capacity:2,status:'occupied',monthly_fee:4500 },
    { room_number:'B103',block:'B',floor:1,capacity:2,status:'available',monthly_fee:4500 },
    { room_number:'B104',block:'B',floor:1,capacity:2,status:'occupied',monthly_fee:4500 },
    { room_number:'B105',block:'B',floor:1,capacity:2,status:'occupied',monthly_fee:4500 },
    { room_number:'B106',block:'B',floor:1,capacity:2,status:'maintenance',monthly_fee:4500 },
    { room_number:'B201',block:'B',floor:2,capacity:2,status:'available',monthly_fee:4500 },
    { room_number:'B202',block:'B',floor:2,capacity:2,status:'occupied',monthly_fee:4500 },
    { room_number:'B203',block:'B',floor:2,capacity:2,status:'occupied',monthly_fee:4500 },
    // Block C
    { room_number:'C101',block:'C',floor:1,capacity:3,status:'occupied',monthly_fee:3500 },
    { room_number:'C102',block:'C',floor:1,capacity:3,status:'available',monthly_fee:3500 },
    { room_number:'C103',block:'C',floor:1,capacity:3,status:'occupied',monthly_fee:3500 },
    { room_number:'C201',block:'C',floor:2,capacity:3,status:'occupied',monthly_fee:3500 },
    { room_number:'C202',block:'C',floor:2,capacity:3,status:'maintenance',monthly_fee:3500 },
    { room_number:'C203',block:'C',floor:2,capacity:3,status:'available',monthly_fee:3500 },
  ];
  const rooms = await Room.insertMany(roomDefs);
  console.log(`✅ ${rooms.length} rooms inserted`);

  // Map room_number → ObjectId for easy lookup
  const roomMap = {};
  rooms.forEach(r => { roomMap[r.room_number] = r._id; });

  // ── Students ──────────────────────────────────────────────────────────
  const studentDefs = [
    { student_id:'STU001',full_name:'Ahmed Khan',email:'ahmed.khan@uni.edu.pk',phone:'0300-1234567',department:'Computer Science',cnic:'42101-1234567-1',guardian_name:'Tariq Khan',guardian_phone:'0300-7654321',status:'active',room:roomMap['A104'],joined_date:new Date('2025-09-01') },
    { student_id:'STU002',full_name:'Sara Raza',email:'sara.raza@uni.edu.pk',phone:'0301-2345678',department:'Business Administration',cnic:'42201-2345678-2',guardian_name:'Rashid Raza',guardian_phone:'0301-8765432',status:'active',room:roomMap['A201'],joined_date:new Date('2025-09-01') },
    { student_id:'STU003',full_name:'Omar Malik',email:'omar.malik@uni.edu.pk',phone:'0302-3456789',department:'Electrical Engineering',cnic:'42301-3456789-3',guardian_name:'Imran Malik',guardian_phone:'0302-9876543',status:'pending',room:null,joined_date:new Date('2026-06-01') },
    { student_id:'STU004',full_name:'Fatima Noor',email:'fatima.noor@uni.edu.pk',phone:'0303-4567890',department:'MBA',cnic:'42401-4567890-4',guardian_name:'Khalid Noor',guardian_phone:'0303-0987654',status:'active',room:roomMap['A301'],joined_date:new Date('2025-09-01') },
    { student_id:'STU005',full_name:'Zain Ali',email:'zain.ali@uni.edu.pk',phone:'0304-5678901',department:'Mechanical Engineering',cnic:'42501-5678901-5',guardian_name:'Sohail Ali',guardian_phone:'0304-1098765',status:'active',room:roomMap['B101'],joined_date:new Date('2025-10-01') },
    { student_id:'STU006',full_name:'Hina Baig',email:'hina.baig@uni.edu.pk',phone:'0305-6789012',department:'Mathematics',cnic:'42601-6789012-6',guardian_name:'Naseer Baig',guardian_phone:'0305-2109876',status:'active',room:roomMap['B104'],joined_date:new Date('2025-10-01') },
    { student_id:'STU007',full_name:'Bilal Shah',email:'bilal.shah@uni.edu.pk',phone:'0306-7890123',department:'Physics',cnic:'42701-7890123-7',guardian_name:'Arif Shah',guardian_phone:'0306-3210987',status:'active',room:roomMap['C101'],joined_date:new Date('2025-11-01') },
    { student_id:'STU008',full_name:'Ayesha Siddiqui',email:'ayesha.s@uni.edu.pk',phone:'0307-8901234',department:'Chemistry',cnic:'42801-8901234-8',guardian_name:'Usman Siddiqui',guardian_phone:'0307-4321098',status:'active',room:roomMap['C101'],joined_date:new Date('2025-11-01') },
  ];
  const students = await Student.insertMany(studentDefs);
  console.log(`✅ ${students.length} students inserted`);

  const stuMap = {};
  students.forEach(s => { stuMap[s.student_id] = s._id; });

  // ── Fee Payments ──────────────────────────────────────────────────────
  const feeDefs = [
    { student:stuMap['STU001'],amount:5000,month:'May 2026',payment_date:new Date('2026-05-03'),method:'bank_transfer',status:'paid',receipt_no:'RCP-2026-001' },
    { student:stuMap['STU001'],amount:5000,month:'June 2026',payment_date:new Date('2026-06-01'),method:'online',status:'paid',receipt_no:'RCP-2026-002' },
    { student:stuMap['STU002'],amount:5000,month:'May 2026',payment_date:new Date('2026-05-05'),method:'cash',status:'paid',receipt_no:'RCP-2026-003' },
    { student:stuMap['STU002'],amount:5000,month:'June 2026',payment_date:new Date(),method:'online',status:'paid',receipt_no:'RCP-2026-004' },
    { student:stuMap['STU003'],amount:5000,month:'June 2026',payment_date:new Date(),method:'cash',status:'pending' },
    { student:stuMap['STU004'],amount:5000,month:'May 2026',payment_date:new Date('2026-05-10'),method:'bank_transfer',status:'paid',receipt_no:'RCP-2026-005' },
    { student:stuMap['STU004'],amount:5000,month:'June 2026',payment_date:new Date(),method:'cash',status:'pending' },
    { student:stuMap['STU005'],amount:4500,month:'May 2026',payment_date:new Date('2026-05-02'),method:'cash',status:'paid',receipt_no:'RCP-2026-006' },
    { student:stuMap['STU005'],amount:4500,month:'June 2026',payment_date:new Date(),method:'online',status:'paid',receipt_no:'RCP-2026-007' },
    { student:stuMap['STU006'],amount:4500,month:'May 2026',payment_date:new Date('2026-05-15'),method:'cash',status:'overdue',receipt_no:'RCP-2026-008' },
    { student:stuMap['STU006'],amount:4500,month:'June 2026',payment_date:new Date(),method:'cash',status:'pending' },
    { student:stuMap['STU007'],amount:3500,month:'May 2026',payment_date:new Date('2026-05-08'),method:'bank_transfer',status:'paid',receipt_no:'RCP-2026-009' },
    { student:stuMap['STU008'],amount:3500,month:'May 2026',payment_date:new Date('2026-05-20'),method:'cash',status:'paid',receipt_no:'RCP-2026-010' },
  ];
  await FeePayment.insertMany(feeDefs);
  console.log(`✅ ${feeDefs.length} fee payments inserted`);

  // ── Complaints ─────────────────────────────────────────────────────────
  const complaintDefs = [
    { student:stuMap['STU001'],category:'electrical',title:'Broken fan in room A204',description:'The ceiling fan is not working since 2 days, very hot at night.',priority:'high',status:'open' },
    { student:stuMap['STU006'],category:'plumbing',title:'Water leakage in Room B104',description:'Water dripping from the ceiling near the bathroom.',priority:'high',status:'in_progress' },
    { student:stuMap['STU005'],category:'wifi',title:'WiFi not working in Block B',description:'No internet connectivity since yesterday morning.',priority:'medium',status:'resolved',resolved_at:new Date('2026-05-31T14:00:00') },
    { student:stuMap['STU004'],category:'electrical',title:'AC not working in A301',description:'Air conditioning unit shows error code E3.',priority:'high',status:'open' },
    { student:stuMap['STU002'],category:'cleanliness',title:'Common area not cleaned',description:'Hallway on floor 1 Block A has not been cleaned in 3 days.',priority:'low',status:'closed',resolved_at:new Date('2026-05-28T10:00:00') },
    { student:stuMap['STU007'],category:'furniture',title:'Broken chair',description:'Study chair in Room C101 has a broken leg.',priority:'low',status:'open' },
    { student:stuMap['STU008'],category:'security',title:'Main gate light not working',description:'The entrance light at Block C is out, security concern at night.',priority:'medium',status:'in_progress' },
  ];
  await Complaint.insertMany(complaintDefs);
  console.log(`✅ ${complaintDefs.length} complaints inserted`);

  // ── Visitors ───────────────────────────────────────────────────────────
  const visitorDefs = [
    { visitor_name:'Tariq Khan',cnic:'42101-0001111-1',phone:'0300-7654321',relation:'Father',student:stuMap['STU001'],check_in:new Date('2026-06-02T10:30:00'),check_out:null,purpose:'Monthly visit' },
    { visitor_name:'Maryam Iqbal',cnic:'42201-0002222-2',phone:'0301-9876543',relation:'Mother',student:stuMap['STU002'],check_in:new Date('2026-06-02T09:15:00'),check_out:new Date('2026-06-02T11:30:00'),purpose:'Document delivery' },
    { visitor_name:'Bilal Shah Sr',cnic:'42301-0003333-3',phone:'0302-8765432',relation:'Father',student:stuMap['STU003'],check_in:new Date('2026-06-01T14:00:00'),check_out:new Date('2026-06-01T16:00:00'),purpose:'Admission inquiry' },
    { visitor_name:'Nadia Noor',cnic:'42401-0004444-4',phone:'0303-7654321',relation:'Sister',student:stuMap['STU004'],check_in:new Date('2026-06-01T16:30:00'),check_out:new Date('2026-06-01T18:00:00'),purpose:'Personal visit' },
    { visitor_name:'Sohail Ali',cnic:'42501-0005555-5',phone:'0304-6543210',relation:'Father',student:stuMap['STU005'],check_in:new Date('2026-05-31T11:00:00'),check_out:new Date('2026-05-31T13:00:00'),purpose:'Fee payment discussion' },
  ];
  await Visitor.insertMany(visitorDefs);
  console.log(`✅ ${visitorDefs.length} visitors inserted`);

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Facility = require('../models/Facility');
const ComplaintCategory = require('../models/ComplaintCategory');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const ComplaintComment = require('../models/ComplaintComment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Counter = require('../models/Counter');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clear existing data safely
    console.log('[Seed] Clearing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Facility.deleteMany({}),
      ComplaintCategory.deleteMany({}),
      Complaint.deleteMany({}),
      ComplaintHistory.deleteMany({}),
      ComplaintComment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    console.log('[Seed] Creating Departments...');
    const [deptCSE, deptECE, deptMECH, deptADMIN] = await Department.create([
      { name: 'Computer Science & Engineering', code: 'CSE', isActive: true },
      { name: 'Electronics & Communication', code: 'ECE', isActive: true },
      { name: 'Mechanical Engineering', code: 'MECH', isActive: true },
      { name: 'Campus Facilities Administration', code: 'ADMIN', isActive: true },
    ]);

    console.log('[Seed] Creating Facilities...');
    const [
      facClassroom204,
      facLabAIML,
      facCentralLibrary,
      facHostelBlockA,
      facMainCafeteria,
      facAuditorium,
      facSportsComplex,
    ] = await Facility.create([
      {
        name: 'Classroom C-204',
        facilityType: 'Classroom',
        building: 'Academic Block C',
        floorOrBlock: '2nd Floor, Room 204',
        departmentIds: [deptCSE._id],
        isActive: true,
      },
      {
        name: 'AI/ML Advanced Laboratory',
        facilityType: 'Laboratory',
        building: 'Turing Computing Center',
        floorOrBlock: '3rd Floor, Lab 301',
        departmentIds: [deptCSE._id],
        isActive: true,
      },
      {
        name: 'Central Campus Library',
        facilityType: 'Library',
        building: 'Knowledge Hub',
        floorOrBlock: 'Ground & 1st Floor',
        departmentIds: [deptADMIN._id],
        isActive: true,
      },
      {
        name: 'Boys Hostel Block A',
        facilityType: 'Hostel',
        building: 'Hostel Residency Block A',
        floorOrBlock: 'Block A, Wing 2',
        departmentIds: [deptADMIN._id],
        isActive: true,
      },
      {
        name: 'Central Cafeteria',
        facilityType: 'Cafeteria',
        building: 'Student Amenities Center',
        floorOrBlock: 'Ground Floor Dining Hall',
        departmentIds: [deptADMIN._id],
        isActive: true,
      },
      {
        name: 'Grand Auditorium',
        facilityType: 'Auditorium',
        building: 'Auditorium Complex',
        floorOrBlock: 'Main Hall',
        departmentIds: [deptADMIN._id],
        isActive: true,
      },
      {
        name: 'Indoor Sports Complex',
        facilityType: 'Sports Facility',
        building: 'Gymnasium & Sports Arena',
        floorOrBlock: 'Court 1 & 2',
        departmentIds: [deptADMIN._id],
        isActive: true,
      },
    ]);

    console.log('[Seed] Creating Complaint Categories...');
    const [
      catElectrical,
      catNetwork,
      catPlumbing,
      catFurniture,
      catEquipment,
      catSanitation,
    ] = await ComplaintCategory.create([
      {
        name: 'Electrical & Lighting',
        description: 'Issues regarding power sockets, projectors, lights, and fans',
        applicableFacilityTypes: ['Classroom', 'Laboratory', 'Library', 'Hostel', 'Auditorium'],
        defaultDepartmentId: deptADMIN._id,
        defaultPriority: 'Medium',
        resolutionTargetHours: 24,
      },
      {
        name: 'Wi-Fi & Network Infrastructure',
        description: 'Network outages, slow Wi-Fi access, and lab switch failures',
        applicableFacilityTypes: ['Classroom', 'Laboratory', 'Library', 'Hostel'],
        defaultDepartmentId: deptCSE._id,
        defaultPriority: 'High',
        resolutionTargetHours: 12,
      },
      {
        name: 'Plumbing & Water Supply',
        description: 'Water leaks, tap damages, washroom blockages, and supply issues',
        applicableFacilityTypes: ['Washroom', 'Hostel', 'Cafeteria'],
        defaultDepartmentId: deptADMIN._id,
        defaultPriority: 'Critical',
        resolutionTargetHours: 8,
      },
      {
        name: 'Furniture & Fixtures',
        description: 'Broken benches, chairs, podiums, and door locks',
        applicableFacilityTypes: ['Classroom', 'Library', 'Cafeteria', 'Auditorium'],
        defaultDepartmentId: deptMECH._id,
        defaultPriority: 'Low',
        resolutionTargetHours: 48,
      },
      {
        name: 'Lab Hardware & Computers',
        description: 'Malfunctioning workstations, monitors, and specialized lab equipment',
        applicableFacilityTypes: ['Laboratory'],
        defaultDepartmentId: deptCSE._id,
        defaultPriority: 'High',
        resolutionTargetHours: 24,
      },
      {
        name: 'Sanitation & Cleanliness',
        description: 'Cafeteria hygiene, waste disposal, and general maintenance',
        applicableFacilityTypes: ['Cafeteria', 'Washroom', 'Hostel'],
        defaultDepartmentId: deptADMIN._id,
        defaultPriority: 'Medium',
        resolutionTargetHours: 12,
      },
    ]);

    console.log('[Seed] Creating Users...');
    const defaultPassword = 'Password@123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // 1. Super Admin
    const adminUser = await User.create({
      name: 'Campus Administrator',
      email: 'admin@campuscare.edu',
      username: 'admin',
      collegeId: 'ADM-001',
      passwordHash,
      role: 'admin',
      departmentId: deptADMIN._id,
      organizationalLevel: 4,
      permissions: [
        'complaints.viewSubmitterIdentity',
        'complaints.assign',
        'complaints.escalate',
        'complaints.resolve',
        'users.manage',
        'departments.manage',
        'facilities.manage',
        'reports.export',
      ],
      isActive: true,
    });

    // 2. Head of Department (HOD) - CSE
    const hodCSE = await User.create({
      name: 'Dr. Ramesh Sharma',
      email: 'hod.cse@campuscare.edu',
      username: 'hod_cse',
      collegeId: 'FAC-HOD-01',
      passwordHash,
      role: 'hod',
      departmentId: deptCSE._id,
      organizationalLevel: 3,
      permissions: ['complaints.assign', 'complaints.escalate'],
      isActive: true,
    });

    // 3. Department Coordinator - CSE
    const coordCSE = await User.create({
      name: 'Prof. Ananya Gupta',
      email: 'coord.cse@campuscare.edu',
      username: 'coord_cse',
      collegeId: 'FAC-CRD-01',
      passwordHash,
      role: 'coordinator',
      departmentId: deptCSE._id,
      organizationalLevel: 2,
      permissions: ['complaints.assign', 'complaints.escalate'],
      isActive: true,
    });

    // 4. Facility Manager - Central Campus
    const facilityManager = await User.create({
      name: 'Mr. Rajesh Verma',
      email: 'manager.facilities@campuscare.edu',
      username: 'fac_mgr',
      collegeId: 'FAC-MGR-01',
      passwordHash,
      role: 'facility_manager',
      departmentId: deptADMIN._id,
      assignedFacilityIds: [
        facClassroom204._id,
        facCentralLibrary._id,
        facHostelBlockA._id,
        facMainCafeteria._id,
        facAuditorium._id,
        facSportsComplex._id,
      ],
      organizationalLevel: 2,
      permissions: ['complaints.assign', 'complaints.escalate'],
      isActive: true,
    });

    // 5. Faculty Members
    const faculty1 = await User.create({
      name: 'Prof. Vikram Sen',
      email: 'vikram.sen@campuscare.edu',
      username: 'vikram_sen',
      collegeId: 'FAC-101',
      passwordHash,
      role: 'faculty',
      departmentId: deptCSE._id,
      assignedFacilityIds: [facClassroom204._id, facLabAIML._id],
      organizationalLevel: 1,
      permissions: [],
      isActive: true,
    });

    const faculty2 = await User.create({
      name: 'Prof. Sunita Mehta',
      email: 'sunita.mehta@campuscare.edu',
      username: 'sunita_mehta',
      collegeId: 'FAC-102',
      passwordHash,
      role: 'faculty',
      departmentId: deptADMIN._id,
      assignedFacilityIds: [facCentralLibrary._id, facHostelBlockA._id],
      organizationalLevel: 1,
      permissions: [],
      isActive: true,
    });

    // 6. Students
    const student1 = await User.create({
      name: 'Aarav Patel',
      email: 'aarav.patel@student.campuscare.edu',
      username: 'aarav_patel',
      collegeId: '2023CSE045',
      passwordHash,
      role: 'student',
      departmentId: deptCSE._id,
      academicYear: '3rd Year / 6th Semester',
      isActive: true,
    });

    const student2 = await User.create({
      name: 'Sneha Rao',
      email: 'sneha.rao@student.campuscare.edu',
      username: 'sneha_rao',
      collegeId: '2023ECE012',
      passwordHash,
      role: 'student',
      departmentId: deptECE._id,
      academicYear: '2nd Year / 4th Semester',
      isActive: true,
    });

    const student3 = await User.create({
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@student.campuscare.edu',
      username: 'rohan_deshmukh',
      collegeId: '2024MECH088',
      passwordHash,
      role: 'student',
      departmentId: deptMECH._id,
      academicYear: '1st Year / 2nd Semester',
      isActive: true,
    });

    // Update departments with leadership links
    await Department.findByIdAndUpdate(deptCSE._id, {
      hodId: hodCSE._id,
      coordinatorIds: [coordCSE._id],
      facilityIds: [facClassroom204._id, facLabAIML._id],
    });

    // Update facilities with responsible users
    await Facility.findByIdAndUpdate(facClassroom204._id, {
      responsibleUserIds: [faculty1._id],
    });
    await Facility.findByIdAndUpdate(facLabAIML._id, {
      responsibleUserIds: [faculty1._id],
    });
    await Facility.findByIdAndUpdate(facCentralLibrary._id, {
      responsibleUserIds: [faculty2._id],
    });

    console.log('[Seed] Creating Sample Complaints...');
    const now = new Date();

    const complaintsData = [
      {
        ticketId: 'CC-2026-00001',
        title: 'Projector not working in Classroom C-204',
        description: 'The overhead HDMI projector fails to turn on and displays a solid red error indicator during lectures.',
        submittedBy: student1._id,
        facilityId: facClassroom204._id,
        location: 'Academic Block C, 2nd Floor, Room C-204',
        categoryId: catElectrical._id,
        departmentId: deptCSE._id,
        assignedTo: faculty1._id,
        priority: 'High',
        status: 'In Progress',
        resolutionDeadline: new Date(now.getTime() + 24 * 3600 * 1000),
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
      },
      {
        ticketId: 'CC-2026-00002',
        title: 'Computers malfunctioning in the AI/ML laboratory',
        description: 'Workstations 08, 09, and 14 fail to boot Ubuntu OS due to corrupted boot sectors. Needed for practical exams.',
        submittedBy: student1._id,
        facilityId: facLabAIML._id,
        location: 'Turing Computing Center, 3rd Floor, Lab 301 (Row 2)',
        categoryId: catEquipment._id,
        departmentId: deptCSE._id,
        assignedTo: faculty1._id,
        priority: 'High',
        status: 'Assigned',
        resolutionDeadline: new Date(now.getTime() + 18 * 3600 * 1000),
        createdAt: new Date(now.getTime() - 6 * 3600 * 1000),
      },
      {
        ticketId: 'CC-2026-00003',
        title: 'Air conditioning not working in the central library',
        description: 'The south-wing AC unit is blowing warm air, making the quiet study floor uncomfortable during peak hours.',
        submittedBy: student2._id,
        facilityId: facCentralLibrary._id,
        location: 'Knowledge Hub, 1st Floor South Reading Room',
        categoryId: catElectrical._id,
        departmentId: deptADMIN._id,
        assignedTo: faculty2._id,
        priority: 'Medium',
        status: 'Under Review',
        resolutionDeadline: new Date(now.getTime() + 36 * 3600 * 1000),
        createdAt: new Date(now.getTime() - 10 * 3600 * 1000),
      },
      {
        ticketId: 'CC-2026-00004',
        title: 'Water leakage in Hostel Block A washroom',
        description: 'Severe pipe rupture under the 2nd-floor washroom sink causing water accumulation across the hallway floor.',
        submittedBy: student1._id,
        facilityId: facHostelBlockA._id,
        location: 'Hostel Block A, 2nd Floor, Washroom 2B',
        categoryId: catPlumbing._id,
        departmentId: deptADMIN._id,
        assignedTo: facilityManager._id,
        priority: 'Critical',
        status: 'Escalated',
        escalationReason: 'Requires external campus civil plumbing contractor urgently to prevent floor damage.',
        resolutionDeadline: new Date(now.getTime() - 4 * 3600 * 1000), // Overdue for testing
        createdAt: new Date(now.getTime() - 14 * 3600 * 1000),
      },
      {
        ticketId: 'CC-2026-00005',
        title: 'Poor Wi-Fi connectivity in academic block',
        description: 'High packet loss and random SSID disconnection on eduroam/campus Wi-Fi near lecture halls 201 to 206.',
        submittedBy: student2._id,
        facilityId: facClassroom204._id,
        location: 'Academic Block C, Corridor AP-04',
        categoryId: catNetwork._id,
        departmentId: deptCSE._id,
        assignedTo: faculty1._id,
        priority: 'High',
        status: 'Submitted',
        resolutionDeadline: new Date(now.getTime() + 8 * 3600 * 1000),
        createdAt: new Date(now.getTime() - 1 * 3600 * 1000),
      },
      {
        ticketId: 'CC-2026-00006',
        title: 'Cafeteria cleanliness and hygiene issue',
        description: 'Waste bin overflowing near water dispensary in main dining hall, causing unhygienic conditions.',
        submittedBy: student3._id,
        facilityId: facMainCafeteria._id,
        location: 'Student Amenities Center, Central Dining Counter 3',
        categoryId: catSanitation._id,
        departmentId: deptADMIN._id,
        assignedTo: facilityManager._id,
        priority: 'Medium',
        status: 'Resolved',
        resolvedAt: new Date(now.getTime() - 3 * 3600 * 1000),
        resolutionNotes: 'Janitorial staff cleaned the area, emptied bins, and scheduled twice-hourly clearing.',
        resolutionDeadline: new Date(now.getTime() + 12 * 3600 * 1000),
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000),
      },
      {
        ticketId: 'CC-2026-00007',
        title: 'Broken classroom bench and desk in C-204',
        description: 'Row 4 student desk has a fractured wooden support and exposed screws.',
        submittedBy: student1._id,
        facilityId: facClassroom204._id,
        location: 'Academic Block C, Room 204, Row 4 Bench 2',
        categoryId: catFurniture._id,
        departmentId: deptMECH._id,
        priority: 'Low',
        status: 'Closed',
        resolvedAt: new Date(now.getTime() - 48 * 3600 * 1000),
        closedAt: new Date(now.getTime() - 24 * 3600 * 1000),
        resolutionNotes: 'Carpentry unit replaced broken timber frame with reinforced steel fixtures.',
        feedback: {
          rating: 5,
          comment: 'Repaired swiftly before morning classes. Thank you!',
          submittedAt: new Date(now.getTime() - 24 * 3600 * 1000),
        },
        createdAt: new Date(now.getTime() - 72 * 3600 * 1000),
      },
    ];

    for (const c of complaintsData) {
      const createdComplaint = await Complaint.create(c);

      // Create history
      await ComplaintHistory.create({
        complaintId: createdComplaint._id,
        action: 'COMPLAINT_CREATED',
        newStatus: 'Submitted',
        performedBy: createdComplaint.submittedBy,
        remarks: 'Complaint filed by student',
      });

      if (createdComplaint.status !== 'Submitted') {
        await ComplaintHistory.create({
          complaintId: createdComplaint._id,
          action: `STATUS_${createdComplaint.status.toUpperCase()}`,
          previousStatus: 'Submitted',
          newStatus: createdComplaint.status,
          performedBy: createdComplaint.assignedTo || adminUser._id,
          remarks: createdComplaint.resolutionNotes || createdComplaint.escalationReason || 'Status progressed',
        });
      }

      // Add a sample progress comment
      await ComplaintComment.create({
        complaintId: createdComplaint._id,
        authorId: faculty1._id,
        message: 'Technician notified. Preliminary inspection in progress.',
        visibility: 'student-visible',
      });
    }

    // Set counter sequence
    await Counter.create({ _id: `complaint_ticket_${now.getFullYear()}`, seq: 7 });

    console.log('[Seed] SUCCESS! Database successfully seeded with test users and complaints.');
    console.log('================================================================');
    console.log('DEVELOPMENT LOGIN CREDENTIALS (Password for all: Password@123)');
    console.log('----------------------------------------------------------------');
    console.log('1. Admin:               admin@campuscare.edu         (ADM-001)');
    console.log('2. HOD (CSE):           hod.cse@campuscare.edu       (FAC-HOD-01)');
    console.log('3. Coordinator (CSE):   coord.cse@campuscare.edu     (FAC-CRD-01)');
    console.log('4. Facility Manager:    manager.facilities@campuscare.edu (FAC-MGR-01)');
    console.log('5. Faculty:             vikram.sen@campuscare.edu    (FAC-101)');
    console.log('6. Student 1:           aarav.patel@student.campuscare.edu (2023CSE045)');
    console.log('7. Student 2:           sneha.rao@student.campuscare.edu   (2023ECE012)');
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

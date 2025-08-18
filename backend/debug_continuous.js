const axios = require('axios');

async function debugContinuousSeating() {
  try {
    console.log('🔍 Debugging Continuous Seat Numbering...\n');

    const examSession = `debug_${new Date().getTime()}_CS201_AI201`;

    // First allocation - smaller batch
    console.log('1️⃣ First allocation (20 students total)...');
    const response1 = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', {
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201',
      examSession,
      classroomCapacity: 20  // Smaller capacity first
    });

    console.log(`Response 1:`, {
      branch1: response1.data.branch1Students.length,
      branch2: response1.data.branch2Students.length,
      allocatedCount: response1.data.allocatedCount,
      lastSeatNumber: response1.data.lastSeatNumber,
      remainingCapacity: response1.data.remainingCapacity
    });

    // Assign seat numbers and save
    let seatNum = response1.data.lastSeatNumber + 1;
    response1.data.branch1Students.forEach(student => {
      student.seatNumber = seatNum++;
    });
    response1.data.branch2Students.forEach(student => {
      student.seatNumber = seatNum++;
    });

    await axios.post('http://localhost:5000/api/seatAllocation/save-seat-allocation', {
      examSession,
      classroomId: 1,
      branch1Students: response1.data.branch1Students,
      branch2Students: response1.data.branch2Students,
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201'
    });

    console.log('✅ First allocation saved\n');

    // Second allocation - different classroom, same exam session
    console.log('2️⃣ Second allocation (continuing seat numbers)...');
    const response2 = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', {
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201',
      examSession,  // Same exam session
      classroomCapacity: 20  // Different classroom capacity
    });

    console.log(`Response 2:`, {
      branch1: response2.data.branch1Students.length,
      branch2: response2.data.branch2Students.length,
      allocatedCount: response2.data.allocatedCount,
      lastSeatNumber: response2.data.lastSeatNumber,
      remainingCapacity: response2.data.remainingCapacity
    });

    // Assign seat numbers continuing from previous
    let seatNum2 = response2.data.lastSeatNumber + 1;
    response2.data.branch1Students.forEach(student => {
      student.seatNumber = seatNum2++;
    });
    response2.data.branch2Students.forEach(student => {
      student.seatNumber = seatNum2++;
    });

    await axios.post('http://localhost:5000/api/seatAllocation/save-seat-allocation', {
      examSession,
      classroomId: 2,
      branch1Students: response2.data.branch1Students,
      branch2Students: response2.data.branch2Students,
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201'
    });

    console.log('✅ Second allocation saved');

    console.log('\n🎉 Success! Continuous seat numbering works:');
    console.log(`   First batch: seats 1-${response1.data.branch1Students.length + response1.data.branch2Students.length}`);
    console.log(`   Second batch: seats ${response1.data.branch1Students.length + response1.data.branch2Students.length + 1}-${seatNum2 - 1}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugContinuousSeating();

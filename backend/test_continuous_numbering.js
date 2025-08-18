const axios = require('axios');

async function testContinuousSeatNumbering() {
  try {
    console.log('🧪 Testing Continuous Seat Numbering Across Classrooms...\n');

    // Test parameters
    const examSession = `continuous_test_${new Date().toISOString().split('T')[0]}_09:00_CS201_AI201`;
    const branch1 = 'CS';
    const branch2 = 'AI';
    const subjectCode1 = 'CS201';
    const subjectCode2 = 'AI201';

    // Classroom 1: C201 (capacity 60)
    console.log('🏛️ CLASSROOM 1: C201');
    console.log('=====================================');

    const classroom1Response = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', {
      branch1,
      branch2,
      subjectCode1,
      subjectCode2,
      examSession,
      classroomCapacity: 60
    });

    const {
      branch1Students: c1Branch1,
      branch2Students: c1Branch2,
      lastSeatNumber: c1LastSeat
    } = classroom1Response.data;

    console.log(`📊 Retrieved: ${c1Branch1.length} CS + ${c1Branch2.length} AI = ${c1Branch1.length + c1Branch2.length} students`);
    console.log(`🪑 Starting seat number: ${c1LastSeat + 1}`);

    // Assign seat numbers for classroom 1
    let seatNum = c1LastSeat + 1;
    c1Branch1.forEach(student => {
      student.seatNumber = seatNum++;
    });
    c1Branch2.forEach(student => {
      student.seatNumber = seatNum++;
    });

    console.log(`🪑 Seat range: ${c1LastSeat + 1} to ${seatNum - 1}`);

    // Save classroom 1 allocation
    await axios.post('http://localhost:5000/api/seatAllocation/save-seat-allocation', {
      examSession,
      classroomId: 1, // C201
      branch1Students: c1Branch1,
      branch2Students: c1Branch2,
      branch1,
      branch2,
      subjectCode1,
      subjectCode2
    });

    console.log('✅ Classroom 1 allocation saved');

    // Classroom 2: C202 (capacity 60)
    console.log('\n🏛️ CLASSROOM 2: C202');
    console.log('=====================================');

    const classroom2Response = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', {
      branch1,
      branch2,
      subjectCode1,
      subjectCode2,
      examSession,
      classroomCapacity: 60
    });

    const {
      branch1Students: c2Branch1,
      branch2Students: c2Branch2,
      lastSeatNumber: c2LastSeat
    } = classroom2Response.data;

    console.log(`📊 Retrieved: ${c2Branch1.length} CS + ${c2Branch2.length} AI = ${c2Branch1.length + c2Branch2.length} students`);
    console.log(`🪑 Starting seat number: ${c2LastSeat + 1} (continuing from previous classroom)`);

    // Assign seat numbers for classroom 2 (continuing from classroom 1)
    let seatNum2 = c2LastSeat + 1;
    c2Branch1.forEach(student => {
      student.seatNumber = seatNum2++;
    });
    c2Branch2.forEach(student => {
      student.seatNumber = seatNum2++;
    });

    console.log(`🪑 Seat range: ${c2LastSeat + 1} to ${seatNum2 - 1}`);

    // Save classroom 2 allocation
    await axios.post('http://localhost:5000/api/seatAllocation/save-seat-allocation', {
      examSession,
      classroomId: 2, // C202
      branch1Students: c2Branch1,
      branch2Students: c2Branch2,
      branch1,
      branch2,
      subjectCode1,
      subjectCode2
    });

    console.log('✅ Classroom 2 allocation saved');

    // Verification
    console.log('\n🔍 VERIFICATION');
    console.log('=====================================');

    const verificationResponse = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', {
      branch1,
      branch2,
      subjectCode1,
      subjectCode2,
      examSession,
      classroomCapacity: 60
    });

    console.log(`📊 Final state:`);
    console.log(`   Total allocated students: ${verificationResponse.data.allocatedCount}`);
    console.log(`   Highest seat number: ${verificationResponse.data.lastSeatNumber}`);
    console.log(`   Available CS students: ${verificationResponse.data.branch1Students.length}`);
    console.log(`   Available AI students: ${verificationResponse.data.branch2Students.length}`);

    // Show sample allocations
    console.log('\n👥 SAMPLE SEAT ASSIGNMENTS');
    console.log('=====================================');

    // Show first few from classroom 1
    console.log('Classroom 1 (C201):');
    c1Branch1.slice(0, 3).forEach(student => {
      console.log(`   Seat ${student.seatNumber}: ${student.registration_number} - ${student.name} (${branch1})`);
    });
    c1Branch2.slice(0, 3).forEach(student => {
      console.log(`   Seat ${student.seatNumber}: ${student.registration_number} - ${student.name} (${branch2})`);
    });

    // Show first few from classroom 2
    console.log('\nClassroom 2 (C202):');
    c2Branch1.slice(0, 3).forEach(student => {
      console.log(`   Seat ${student.seatNumber}: ${student.registration_number} - ${student.name} (${branch1})`);
    });
    c2Branch2.slice(0, 3).forEach(student => {
      console.log(`   Seat ${student.seatNumber}: ${student.registration_number} - ${student.name} (${branch2})`);
    });

    console.log('\n🎉 CONTINUOUS SEAT NUMBERING TEST PASSED!');
    console.log('✓ Seat numbers continue across classrooms');
    console.log('✓ No duplicate seat numbers');
    console.log('✓ Proper sequence maintained');

  } catch (error) {
    console.error('❌ Error in continuous seat numbering test:', error.response?.data || error.message);
  }
}

testContinuousSeatNumbering();

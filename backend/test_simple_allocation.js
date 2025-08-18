const axios = require('axios');

async function testSeatAllocationSimple() {
  try {
    console.log('🧪 Testing Seat Allocation (Simplified)...\n');
    
    // Use a known classroom ID from our database setup
    const testClassroom = {
      id: 1, // Assuming C201 has ID 1
      room_number: 'C201',
      capacity: 60
    };
    
    console.log(`📍 Using classroom: ${testClassroom.room_number} (capacity: ${testClassroom.capacity})`);
    
    // Step 1: Get available students
    console.log('\n1️⃣ Getting available students...');
    const studentsPayload = {
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201',
      examSession: `test_${new Date().toISOString().split('T')[0]}_10:00_C201_CS201_AI201`,
      classroomCapacity: testClassroom.capacity
    };
    
    const studentsResponse = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', studentsPayload);
    const { branch1Students, branch2Students } = studentsResponse.data;
    
    console.log(`✅ Retrieved ${branch1Students.length} CS students and ${branch2Students.length} AI students`);
    
    if (branch1Students.length === 0 && branch2Students.length === 0) {
      console.log('⚠️  No students available for allocation. This might be normal if all students are already allocated.');
      return;
    }
    
    // Step 2: Assign seat numbers to students
    console.log('\n2️⃣ Assigning seat numbers...');
    let seatNumber = 1;
    
    // Assign seat numbers to branch1 students
    branch1Students.forEach((student, index) => {
      student.seatNumber = seatNumber;
      student.subjectCode = 'CS201';
      seatNumber++;
    });
    
    // Assign seat numbers to branch2 students  
    branch2Students.forEach((student, index) => {
      student.seatNumber = seatNumber;
      student.subjectCode = 'AI201';
      seatNumber++;
    });
    
    console.log(`✅ Assigned seat numbers 1-${seatNumber-1}`);
    
    // Step 3: Save the allocation
    console.log('\n3️⃣ Saving seat allocation...');
    const savePayload = {
      examSession: studentsPayload.examSession,
      classroomId: testClassroom.id,
      branch1Students,
      branch2Students,
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201'
    };
    
    const saveResponse = await axios.post('http://localhost:5000/api/seatAllocation/save-seat-allocation', savePayload);
    console.log(`✅ ${saveResponse.data.message}`);
    console.log(`📊 Total allocated students: ${saveResponse.data.allocatedStudents}`);
    
    console.log('\n🎉 Seat allocation test PASSED!');
    console.log('\n📋 Test Summary:');
    console.log(`   ✓ Classroom: ${testClassroom.room_number}`);
    console.log(`   ✓ CS Students: ${branch1Students.length}`);
    console.log(`   ✓ AI Students: ${branch2Students.length}`);
    console.log(`   ✓ Total Allocated: ${branch1Students.length + branch2Students.length}`);
    console.log(`   ✓ Database Save: SUCCESS`);
    
    // Show some allocated students
    if (branch1Students.length > 0) {
      console.log('\n👥 Sample allocated CS students:');
      branch1Students.slice(0, 3).forEach(student => {
        console.log(`   Seat ${student.seatNumber}: ${student.registration_number} - ${student.name}`);
      });
    }
    
    if (branch2Students.length > 0) {
      console.log('\n👥 Sample allocated AI students:');
      branch2Students.slice(0, 3).forEach(student => {
        console.log(`   Seat ${student.seatNumber}: ${student.registration_number} - ${student.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in seat allocation test:', error.response?.data || error.message);
    console.error('Full error:', error.response?.status, error.response?.statusText);
  }
}

testSeatAllocationSimple();

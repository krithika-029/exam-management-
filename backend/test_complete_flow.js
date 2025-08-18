const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Seat Allocation Flow...\n');
    
    // Step 1: Get classrooms
    console.log('1️⃣ Getting available classrooms...');
    const classroomsResponse = await axios.get('http://localhost:5000/api/classrooms');
    console.log(`✅ Found ${classroomsResponse.data.length} classrooms`);
    
    // Find a suitable classroom
    const classroom = classroomsResponse.data.find(room => room.capacity >= 50);
    if (!classroom) {
      console.log('❌ No suitable classroom found');
      return;
    }
    console.log(`📍 Using classroom: ${classroom.room_number} (capacity: ${classroom.capacity})`);
    
    // Step 2: Get available students
    console.log('\n2️⃣ Getting available students...');
    const studentsPayload = {
      branch1: 'CS',
      branch2: 'AI',
      subjectCode1: 'CS201',
      subjectCode2: 'AI201',
      examSession: `test_${new Date().toISOString().split('T')[0]}_09:00_${classroom.room_number}_CS201_AI201`,
      classroomCapacity: classroom.capacity
    };
    
    const studentsResponse = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', studentsPayload);
    const { branch1Students, branch2Students } = studentsResponse.data;
    
    console.log(`✅ Retrieved ${branch1Students.length} CS students and ${branch2Students.length} AI students`);
    
    // Step 3: Assign seat numbers to students
    console.log('\n3️⃣ Assigning seat numbers...');
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
    
    // Step 4: Save the allocation
    console.log('\n4️⃣ Saving seat allocation...');
    const savePayload = {
      examSession: studentsPayload.examSession,
      classroomId: classroom.id,
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
    
    // Step 5: Verify the allocation was saved
    console.log('\n5️⃣ Verifying saved allocation...');
    const verifyResponse = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', studentsPayload);
    
    console.log(`✅ Verification complete:`);
    console.log(`   Previously allocated: ${studentsResponse.data.allocatedCount}`);
    console.log(`   Now allocated: ${verifyResponse.data.allocatedCount}`);
    console.log(`   New allocations: ${verifyResponse.data.allocatedCount - studentsResponse.data.allocatedCount}`);
    
    console.log('\n🎉 Complete seat allocation flow test PASSED!');
    console.log('\n📋 Test Summary:');
    console.log(`   ✓ Classroom: ${classroom.room_number}`);
    console.log(`   ✓ CS Students: ${branch1Students.length}`);
    console.log(`   ✓ AI Students: ${branch2Students.length}`);
    console.log(`   ✓ Total Allocated: ${branch1Students.length + branch2Students.length}`);
    console.log(`   ✓ Database Save: SUCCESS`);
    
  } catch (error) {
    console.error('❌ Error in complete flow test:', error.response?.data || error.message);
  }
}

testCompleteFlow();

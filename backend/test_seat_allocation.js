const axios = require('axios');

async function testSeatAllocation() {
  try {
    console.log('🧪 Testing Seat Allocation API...\n');
    
    // Test 1: Get available students
    console.log('1️⃣ Testing get-available-students endpoint...');
    const testPayload = {
      branch1: 'CS',
      branch2: 'AI', 
      subjectCode1: 'CS201',
      subjectCode2: 'AI201',
      examSession: 'test_2025-07-30_09:00_C201_CS201_AI201',
      classroomCapacity: 60
    };
    
    const response = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', testPayload);
    
    console.log('✅ Response received:');
    console.log(`   Branch 1 (${testPayload.branch1}) students: ${response.data.branch1Students.length}`);
    console.log(`   Branch 2 (${testPayload.branch2}) students: ${response.data.branch2Students.length}`);
    console.log(`   Total available Branch 1: ${response.data.totalAvailableBranch1}`);
    console.log(`   Total available Branch 2: ${response.data.totalAvailableBranch2}`);
    console.log(`   Already allocated: ${response.data.allocatedCount}`);
    console.log(`   Remaining capacity: ${response.data.remainingCapacity}`);
    
    // Show sample students
    if (response.data.branch1Students.length > 0) {
      console.log('\n📋 Sample Branch 1 students:');
      response.data.branch1Students.slice(0, 3).forEach(student => {
        console.log(`   ${student.registration_number} - ${student.name} (${student.branch})`);
      });
    }
    
    if (response.data.branch2Students.length > 0) {
      console.log('\n📋 Sample Branch 2 students:');
      response.data.branch2Students.slice(0, 3).forEach(student => {
        console.log(`   ${student.registration_number} - ${student.name} (${student.branch})`);
      });
    }
    
    console.log('\n✅ Seat allocation API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing seat allocation:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔍 This might be a database connectivity or query issue.');
      console.log('💡 Check if the backend server is running and database is accessible.');
    }
  }
}

testSeatAllocation();

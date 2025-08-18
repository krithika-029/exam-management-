#!/usr/bin/env python3
"""
Generate full student dataset for Sahyadri College
Creates CSV with 680 students across all branches with proper USN format
"""

import csv
import json
from pathlib import Path

# Branch configuration
BRANCHES = {
    'CS': {
        'count': 240,
        'classrooms': ['C201', 'C202', 'C203', 'C301', 'C302'],  # 48 students per classroom
        'subjects': {
            'CS201': 'Data Structures',
            'CS202': 'Computer Organization', 
            'CS203': 'Discrete Mathematics',
            'CS204': 'Digital Logic',
            'CS205': 'Object Oriented Programming',
            'CS206': 'Microprocessors'
        }
    },
    'AI': {
        'count': 120,
        'classrooms': ['C401', 'C402'],  # 60 students per classroom
        'subjects': {
            'AI201': 'Intro to AI',
            'AI202': 'Machine Learning',
            'AI203': 'Data Science', 
            'AI204': 'Python Programming',
            'AI205': 'Neural Networks',
            'AI206': 'Deep Learning'
        }
    },
    'ECE': {
        'count': 100,
        'classrooms': ['C501', 'C502'],  # 50 students per classroom
        'subjects': {
            'EC201': 'Analog Electronics',
            'EC202': 'Signals & Systems',
            'EC203': 'Logic Design',
            'EC204': 'Control Systems', 
            'EC205': 'Microprocessors',
            'EC206': 'Communication Engineering'
        }
    },
    'ISE': {
        'count': 100,
        'classrooms': ['C601', 'C701'],  # 50 students per classroom
        'subjects': {
            'IS201': 'Software Engineering',
            'IS202': 'Data Structures',
            'IS203': 'Database Management',
            'IS204': 'Computer Networks',
            'IS205': 'Operating Systems', 
            'IS206': 'Web Technologies'
        }
    },
    'ME': {
        'count': 60,
        'classrooms': ['A101'],  # 60 students in one large classroom
        'subjects': {
            'ME201': 'Thermodynamics',
            'ME202': 'Engineering Mechanics',
            'ME203': 'Fluid Mechanics',
            'ME204': 'Manufacturing Processes',
            'ME205': 'Mechanical Measurements',
            'ME206': 'Kinematics of Machines'
        }
    },
    'CE': {
        'count': 60,
        'classrooms': ['A102'],  # 60 students in one large classroom
        'subjects': {
            'CE201': 'Surveying',
            'CE202': 'Building Materials',
            'CE203': 'Strength of Materials',
            'CE204': 'Fluid Mechanics',
            'CE205': 'Concrete Technology',
            'CE206': 'Structural Analysis'
        }
    }
}

# Common Indian names for generating diverse student data
FIRST_NAMES = [
    'Aarav', 'Aditi', 'Aishwarya', 'Akash', 'Alok', 'Amita', 'Amith', 'Ananya', 'Anil', 'Anita',
    'Anjali', 'Ankit', 'Anup', 'Arjun', 'Arun', 'Ashish', 'Bharti', 'Deepa', 'Divya', 'Gaurav',
    'Harish', 'Ishita', 'Jaya', 'Karan', 'Kavya', 'Keerthi', 'Kishore', 'Lakshmi', 'Manoj', 'Maya',
    'Meera', 'Mohan', 'Nandini', 'Neha', 'Nikhil', 'Nitesh', 'Pooja', 'Prakash', 'Priya', 'Rahul',
    'Rajesh', 'Ramesh', 'Ravi', 'Rekha', 'Rohit', 'Sanjay', 'Shreya', 'Sita', 'Sunil', 'Sunita',
    'Suresh', 'Swati', 'Tanvi', 'Uma', 'Varun', 'Vidya', 'Vijay', 'Vinay', 'Yash', 'Zara'
]

LAST_NAMES = [
    'Agarwal', 'Bhat', 'Chandra', 'Das', 'Gowda', 'Gupta', 'Hegde', 'Iyer', 'Jain', 'Kamath',
    'Kumar', 'Lakshman', 'Mehra', 'Nair', 'Pai', 'Patel', 'Rao', 'Reddy', 'Sharma', 'Shetty',
    'Singh', 'Srinivas', 'Upadhyay', 'Varma', 'Yadav', 'Mathew', 'Joseph', 'Thomas', 'Fernandes', 'D\'Souza'
]

def generate_student_data():
    """Generate complete student dataset"""
    students = []
    name_index = 0
    
    for branch_code, branch_info in BRANCHES.items():
        count = branch_info['count']
        classrooms = branch_info['classrooms']
        subjects = branch_info['subjects']
        
        # Calculate students per classroom
        students_per_classroom = count // len(classrooms)
        extra_students = count % len(classrooms)
        
        student_num = 1
        
        for classroom_idx, classroom in enumerate(classrooms):
            # Calculate how many students for this classroom
            classroom_count = students_per_classroom
            if classroom_idx < extra_students:
                classroom_count += 1
                
            for i in range(classroom_count):
                # Generate USN
                usn = f"4SF22{branch_code}{student_num:03d}"
                
                # Generate name
                first_name = FIRST_NAMES[name_index % len(FIRST_NAMES)]
                last_name = LAST_NAMES[(name_index // len(FIRST_NAMES)) % len(LAST_NAMES)]
                name = f"{first_name} {last_name}"
                
                # Generate email
                email_name = f"{first_name.lower()}.{last_name.lower()}"
                email = f"{email_name}@scem.edu"
                
                # Create student record
                student = {
                    'usn': usn,
                    'name': name,
                    'email': email,
                    'branch': branch_code,
                    'classroom': classroom
                }
                
                # Add subjects
                subject_codes = list(subjects.keys())
                for j, subject_code in enumerate(subject_codes):
                    student[f'sub{j+1}_code'] = subject_code
                    student[f'sub{j+1}_name'] = subjects[subject_code]
                
                students.append(student)
                student_num += 1
                name_index += 1
    
    return students

def write_csv(students, filename):
    """Write student data to CSV file"""
    fieldnames = [
        'usn', 'name', 'email', 'branch', 'classroom',
        'sub1_code', 'sub1_name', 'sub2_code', 'sub2_name',
        'sub3_code', 'sub3_name', 'sub4_code', 'sub4_name', 
        'sub5_code', 'sub5_name', 'sub6_code', 'sub6_name'
    ]
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(students)

def main():
    print("Generating full student dataset for Sahyadri College...")
    
    # Generate student data
    students = generate_student_data()
    
    # Write to CSV
    csv_filename = 'full_students_data.csv'
    write_csv(students, csv_filename)
    
    # Print summary
    print(f"\n✅ Generated {len(students)} student records")
    print("\n📊 Branch-wise distribution:")
    
    branch_counts = {}
    for student in students:
        branch = student['branch']
        branch_counts[branch] = branch_counts.get(branch, 0) + 1
    
    total = 0
    for branch, count in sorted(branch_counts.items()):
        print(f"   {branch}: {count} students")
        total += count
    
    print(f"\n📁 Total: {total} students")
    print(f"💾 Saved to: {csv_filename}")
    
    # Show classroom distribution
    print("\n🏫 Classroom distribution:")
    classroom_counts = {}
    for student in students:
        classroom = student['classroom']
        classroom_counts[classroom] = classroom_counts.get(classroom, 0) + 1
    
    for classroom, count in sorted(classroom_counts.items()):
        print(f"   {classroom}: {count} students")

if __name__ == "__main__":
    main()

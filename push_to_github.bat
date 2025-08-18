@echo off
echo Initializing git repository...
git init

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Complete exam management system with continuous seat allocation and 680 student dataset"

echo Adding remote origin...
git remote add origin https://github.com/krithika-029/exam-management-.git

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause

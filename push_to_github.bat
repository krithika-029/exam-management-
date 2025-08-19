@echo off
echo Pushing to GitHub Repository...
echo.

echo Checking git status...
git status

echo.
echo Adding remote origin...
git remote add origin https://github.com/krithika-029/exam-management-.git 2>nul || echo "Remote already exists"

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Push completed! Check GitHub repository at:
echo https://github.com/krithika-029/exam-management-.git
echo.

pause

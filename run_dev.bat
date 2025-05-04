@echo off
title InfoPekerjaan.id - Dev Mode
echo ============================
echo  Cek Folder dan Jalankan Project
echo ============================

:: Cek dan buat folder backend jika belum ada
if not exist "backend" (
    echo Folder backend tidak ditemukan. Membuat folder backend...
    mkdir backend
) else (
    echo Folder backend ditemukan.
)

:: Cek dan buat folder frontend jika belum ada
if not exist "frontend" (
    echo Folder frontend tidak ditemukan. Membuat folder frontend...
    mkdir frontend
) else (
    echo Folder frontend ditemukan.
)

echo ============================
echo  Mulai jalankan backend...
echo ============================
start cmd /k "cd backend && npm install && npm run dev"

echo ============================
echo  Mulai jalankan frontend...
echo ============================
start cmd /k "cd frontend && npm install && npm start"

echo Semua service sudah dijalankan! 🚀
exit

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../dialog/dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { StudentService } from '../student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
  ]
})
export class StudentListComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchTerm: string = '';
  importFormat: 'csv' | 'json' = 'csv';
  exportFormat: string = 'CSV';
  // Pagination config
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pageNumbers: number[] = [];
  paginatedStudents: any[] = [];

  messages: string[] = [];
  messageType: 'success' | 'error' = 'success';



  displayedColumns: string[] = [
    'select', 'id', 'nrc', 'name', 'fathername',
    'email', 'phone', 'state', 'address', 'major', 'dob', 'actions'
  ];

  constructor(
    private dialog: MatDialog,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe(
      (data: any[]) => {
        this.students = data.map(s => ({ ...s, selected: false }));
        this.filteredStudents = [...this.students];
        this.updatePagination();
      },
      (error) => console.error('Error loading students:', error)
    );
  }

  searchStudents(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(
      s =>
        s.name.toLowerCase().includes(term) ||
        s.studentid?.toString().includes(term)
    );
    this.updatePagination();
  }
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
    this.updatePageNumbers();
  }

  updatePageNumbers(): void {
    const maxPagesToShow = 5;
    let start = Math.max(this.currentPage - 2, 1);
    let end = Math.min(start + maxPagesToShow - 1, this.totalPages);
    if (end - start < maxPagesToShow - 1) {
      start = Math.max(end - maxPagesToShow + 1, 1);
    }
    this.pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages);
  }


  goToAdd(): void {
    this.router.navigate(['/create']);
  }

  editStudent(student: any): void {
    this.router.navigate(['/update', student.studentid]);
  }

  deleteStudent(student: any): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: {
        studentid: student.studentid,
        name: student.name,
        email: student.email
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentService.deleteStudent(student.studentid).subscribe(() => {
          this.snackBar.open('✅ Student deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['bg-green-600', 'text-white']
          });
          this.loadStudents();
        });
      }
    });
  }

  toggleAll(event: any): void {
    const checked = event.checked;
    this.filteredStudents.forEach(student => student.selected = checked);
  }

  /*exportAll(): void {
    if (this.exportFormat === 'CSV') {
      this.studentService.exportAllCsv().subscribe({
        next: (blob: Blob) => this.downloadFileFromBlob(blob, 'students.csv'),
        error: () => this.snackBar.open('❌ Failed to export CSV.', 'Close', { duration: 3000 })
      });
    } else {
      this.studentService.exportAllJson().subscribe({
        next: (data: any) => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          this.downloadFileFromBlob(blob, 'students.json');
        },
        error: () => this.snackBar.open('❌ Failed to export JSON.', 'Close', { duration: 3000 })
      });
    }
  }

  // start export selected student csv and json file

  get selectedCount(): number {
    return this.filteredStudents.filter(s => s.selected).length;
  }

  exportSelectedStudents(): void {
    const selected = this.filteredStudents.filter(s => s.selected);
    const selectedIds = selected.map(s => s.studentid);

    if (selectedIds.length === 0) {
      this.snackBar.open('⚠️ Please select at least one student.', 'Close', { duration: 3000 });
      return;
    }

    const filename = `selected_${selectedIds.length}_students.${this.exportFormat.toLowerCase()}`;

    if (this.exportFormat === 'CSV') {
      this.studentService.exportSelectedStudentsCsv(selectedIds).subscribe({
        next: (blob: Blob) => {
          this.downloadFileFromBlob(blob, filename);
          this.snackBar.open(`✅ Exported ${selectedIds.length} student(s) to CSV.`, 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('❌ Failed to export selected CSV.', 'Close', { duration: 3000 })
      });
    } else {
      this.studentService.exportSelectedStudentsJson(selectedIds).subscribe({
        next: (data: any) => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          this.downloadFileFromBlob(blob, filename);
          this.snackBar.open(`✅ Exported ${selectedIds.length} student(s) to JSON.`, 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('❌ Failed to export selected JSON.', 'Close', { duration: 3000 })
      });
    }
  }*/

  get selectedCount(): number {
    return this.filteredStudents.filter(s => s.selected).length;
  }

  downloadFileFromBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  exportStudents(): void {
    const format = this.exportFormat.toLowerCase(); // 'csv' or 'json'
    const selected = this.filteredStudents.filter(s => s.selected);
    const selectedIds = selected.map(s => s.studentid);
    const isSearchActive = this.searchTerm.trim().length > 0;

    // 📦 Filename prefix
    let filename = 'students';

    // Case 1: Selected students
    if (selectedIds.length > 0) {
      filename = `selected_${selectedIds.length}_students.${format}`;

      if (format === 'csv') {
        this.studentService.exportSelectedStudentsCsv(selectedIds).subscribe({
          next: (blob: Blob) => {
            this.downloadFileFromBlob(blob, filename);
            this.snackBar.open(`✅ Exported ${selectedIds.length} selected student(s).`, 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('❌ Failed to export selected students.', 'Close', { duration: 3000 })
        });
      } else {
        this.studentService.exportSelectedStudentsJson(selectedIds).subscribe({
          next: (data: any) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadFileFromBlob(blob, filename);
            this.snackBar.open(`✅ Exported ${selectedIds.length} selected student(s).`, 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('❌ Failed to export selected students.', 'Close', { duration: 3000 })
        });
      }

      // Case 2: Filtered search results
    } else if (isSearchActive) {
      filename = `filtered_students.${format}`;
      if (format === 'csv') {
        this.studentService.exportFilteredStudents(this.filteredStudents, format).subscribe({
          next: (blob: Blob) => {
            this.downloadFileFromBlob(blob, filename);
            this.snackBar.open('✅ Exported filtered students.', 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('❌ Failed to export filtered students.', 'Close', { duration: 3000 })
        });
      } else {
        const blob = new Blob([JSON.stringify(this.filteredStudents, null, 2)], { type: 'application/json' });
        this.downloadFileFromBlob(blob, filename);
        this.snackBar.open('✅ Exported filtered students.', 'Close', { duration: 3000 });
      }

      // Case 3: Export all
    } else {
      filename = `all_students.${format}`;
      if (format === 'csv') {
        this.studentService.exportAllCsv().subscribe({
          next: (blob: Blob) => {
            this.downloadFileFromBlob(blob, filename);
            this.snackBar.open('✅ Exported all students.', 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('❌ Failed to export all students.', 'Close', { duration: 3000 })
        });
      } else {
        this.studentService.exportAllJson().subscribe({
          next: (data: any) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadFileFromBlob(blob, filename);
            this.snackBar.open('✅ Exported all students.', 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('❌ Failed to export all students.', 'Close', { duration: 3000 })
        });
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Clear old messages
      this.messages = [];

      this.studentService.importStudents(file, this.importFormat).subscribe({
        next: (res) => {
          this.messages = res.messages || ['✅ Import successful.'];
          this.messageType = 'success';
          this.loadStudents();

          // ✅ Auto-hide messages after 5 seconds
          setTimeout(() => {
            this.messages = [];
          }, 5000);
        },
        error: (err) => {
          if (err.error?.messages) {
            this.messages = err.error.messages;
          } else if (err.error?.error) {
            this.messages = [err.error.error];
          } else {
            this.messages = ['❌ Unknown error occurred.'];
          }
          this.messageType = 'error';

          // ❌ Auto-hide error too
          setTimeout(() => {
            this.messages = [];
          }, 5000);
        }
      });
    }
  }
}

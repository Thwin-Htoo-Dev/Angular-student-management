import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl,
  ValidationErrors, ValidatorFn
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StudentService } from '../student.service';

// Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatOptionModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class StudentFormComponent implements OnInit {
  studentForm!: FormGroup;
  readonly phonePrefix = '+959';
  states: string[] = ['Yangon', 'Mandalay', 'Naypyidaw', 'Magway', 'Shan', 'Ayeyarwaddy'];
  studentId: number | null = null;
  isUpdateMode = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      fathername: ['', Validators.required],
      nrc: ['', [Validators.required, Validators.pattern(/^(1[0-4]|[1-9])\/[A-Za-z]{3,10}\((N|NA)\)\d{6}$/)]],
      email: ['', [Validators.required, Validators.email]],
      state: ['', Validators.required],
      address: ['', Validators.required],
      dob: ['', [Validators.required, this.minimumAgeValidator(18)]],
      phone: [this.phonePrefix, [Validators.required, Validators.pattern(/^\+959\d{7,9}$/)]],
      major: ['', Validators.required]
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    this.studentId = paramId ? +paramId : null;
    this.isUpdateMode = !!this.studentId;

    if (this.isUpdateMode) {
      this.studentService.getStudent(this.studentId!).subscribe((data) => {
        this.studentForm.patchValue(data);
      });
    }
  }

  minimumAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      if (isNaN(inputDate.getTime())) return null;

      const today = new Date();
      let age = today.getFullYear() - inputDate.getFullYear();
      const m = today.getMonth() - inputDate.getMonth();
      const d = today.getDate() - inputDate.getDate();

      if (m < 0 || (m === 0 && d < 0)) age--;

      return age < minAge ? { ageInvalid: true } : null;
    };
  }

  allowOnlyPhoneDigits(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const isDigit = /^[0-9]$/.test(event.key);
    const isBackspaceOrDelete = ['Backspace', 'Delete'].includes(event.key);
    const cursor = input.selectionStart || 0;

    if (cursor < this.phonePrefix.length && !isBackspaceOrDelete) {
      event.preventDefault();
      return;
    }

    if (!isDigit && !isBackspaceOrDelete && event.key.length === 1) {
      event.preventDefault();
    }
  }

  enforcePhonePrefix(): void {
    const phoneControl = this.studentForm.get('phone');
    if (!phoneControl) return;

    const value = phoneControl.value || '';

    if (!value.startsWith(this.phonePrefix)) {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 9);
      phoneControl.setValue(this.phonePrefix + digitsOnly, { emitEvent: false });
    } else {
      const digitsOnly = value.slice(this.phonePrefix.length).replace(/\D/g, '').slice(0, 9);
      phoneControl.setValue(this.phonePrefix + digitsOnly, { emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const rawData = this.studentForm.value;
    const formattedDob = new Date(rawData.dob).toISOString().split('T')[0];

    const studentData = {
      ...rawData,
      dob: formattedDob
    };

    if (this.isUpdateMode) {
      this.studentService.updateStudent(this.studentId!, studentData).subscribe({
        next: () => {
          this.snackBar.open('✅ Student updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['bg-green-500', 'text-white']
          });
          this.router.navigate(['/list']);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.studentService.createStudent(studentData).subscribe({
        next: () => {
          this.snackBar.open('✅ Student added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['bg-green-500', 'text-white']
          });
          this.router.navigate(['/list']);
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    if (err && typeof err === 'object') {
      const firstErrorKey = Object.keys(err)[0];
      const firstErrorMsg = err[firstErrorKey][0];
      this.snackBar.open(`❌ ${firstErrorKey.toUpperCase()}: ${firstErrorMsg}`, 'Close', {
        duration: 4000,
        panelClass: ['bg-red-600', 'text-white']
      });
    } else {
      this.snackBar.open('❌ Something went wrong.', 'Close', {
        duration: 4000,
        panelClass: ['bg-red-600', 'text-white']
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/list']);
  }
}

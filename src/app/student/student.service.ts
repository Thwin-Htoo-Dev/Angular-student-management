import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse,HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Student {
  studentid?: number;
  nrc: string;
  name: string;
  fathername: string;
  email: string;
  phone: string;
  state: string;
  address: string;
  major: string;
  dob: string; // ISO format: YYYY-MM-DD
  selected?: boolean; // For UI checkbox
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = 'http://127.0.0.1:8000/api/students/'; // Ensure /api/ prefix if defined in Django

  constructor(private http: HttpClient) { }

  getStudents(q: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('q', q)
      .set('page', page)
      .set('page_size', pageSize);
    return this.http.get<any>(this.baseUrl, { params });
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}${id}/`);
  }

  createStudent(data: Student): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, data).pipe(
      catchError(this.handleValidationError)
    );
  }

  updateStudent(id: number, data: Student): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}${id}/`, data).pipe(
      catchError(this.handleValidationError)
    );
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}/`);
  }

  importStudents(file: File, format: 'csv' | 'json'): Observable<any> {
    const formData = new FormData();
    formData.append('importFile', file);
    formData.append('file_format', format.toLowerCase());

    return this.http.post<any>(`${this.baseUrl}import/`, formData).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
  exportAllCsv(): Observable<Blob> {
    // Notice: no double slashes, baseUrl ends without slash, endpoint starts with slash
    return this.http.get(`${this.baseUrl}export/csv/`, {
      responseType: 'blob'
    });
  }

  exportAllJson(): Observable<any> {
    return this.http.get(`${this.baseUrl}export/json/`);
  }
  exportSelectedStudentsCsv(ids: string[]): Observable<Blob> {
    return this.http.post('http://localhost:8000/api/students/export/selected/', {
      selected_students: ids,
      file_format: 'csv'
    }, { responseType: 'blob' });
  }

  exportSelectedStudentsJson(ids: string[]): Observable<any> {
    return this.http.post('http://localhost:8000/api/students/export/selected/', {
      selected_students: ids,
      file_format: 'json'
    }, { responseType: 'json' });
  }



  /**
   * Handle validation errors coming from DRF backend
   */
  private handleValidationError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 400 && error.error) {
      return throwError(() => error.error); // Return the error object directly
    }
    return throwError(() => new Error('Something went wrong.'));
  }
  exportFilteredStudents(students: Student[], fileFormat: 'csv' | 'json'): Observable<Blob> {
    const url = `${this.baseUrl}export/filtered/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, { students, file_format: fileFormat }, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleValidationError)
    );
  }
}

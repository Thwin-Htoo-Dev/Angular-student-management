import { Routes } from '@angular/router';
import { StudentListComponent } from './student/list/list.component';
import { StudentFormComponent } from './student/form/form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: StudentListComponent },
  { path: 'create', component: StudentFormComponent },
  { path: 'update/:id', component: StudentFormComponent },
];

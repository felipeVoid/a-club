import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {HomeComponent} from './components/main/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth.guard';
import {DataCenterComponent} from './components/main/data-center/data-center.component';
import {ExamComponent} from './components/main/exam/exam.component';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DataCenterComponent, canActivate: [AuthGuard]},
      { path: 'chart', component: HomeComponent, canActivate: [AuthGuard]},
      { path: 'exam', component: ExamComponent, canActivate: [AuthGuard]},
    ]
  },
  { path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

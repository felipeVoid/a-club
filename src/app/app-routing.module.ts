import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {HomeComponent} from './components/main/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth.guard';
import {DataCenterComponent} from './components/main/data-center/data-center.component';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard]},
      { path: 'datacenter', component: DataCenterComponent, canActivate: [AuthGuard]},
    ]
  },
  { path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

/*
{
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard]},
    ]
  }
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {HomeComponent} from './components/main/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth.guard';
import {DataCenterComponent} from './components/main/data-center/data-center.component';
import {ExamComponent} from './components/main/exam/exam.component';
import { NodesComponent } from './components/main/nodes/nodes.component';
import { ArtComponent } from './components/main/art/art.component';
import { LocalDataComponent } from './components/local-data/local-data.component';
import { GamesComponent } from './components/main/games/games.component';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'data', component: DataCenterComponent, canActivate: [AuthGuard]},
      { path: 'chart', component: HomeComponent, canActivate: [AuthGuard]},
      { path: 'exam', component: ExamComponent, canActivate: [AuthGuard]},
      { path: '', component: NodesComponent, canActivate: [AuthGuard]},
      { path: 'art', component: ArtComponent, canActivate: [AuthGuard]},
      { path: 'games', component: GamesComponent, canActivate: [AuthGuard]}
    ]
  },
  { path: 'login', component: LoginComponent},
  { path: 'shared-link', component: LocalDataComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, OnInit } from '@angular/core';
import {auth} from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  opened: boolean;
  user: any;
  constructor(public afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.init();
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(data => {
      localStorage.setItem('data', JSON.stringify({
        uid: data.user.uid,
        email: data.user.email,
        photo: data.additionalUserInfo.profile['picture']
      }));
      this.init();
    }).catch( error => {
      console.log(error);
    });
  }

  logout() {
    localStorage.removeItem('data');
    this.afAuth.auth.signOut().then(action => {
      window.location.reload();
    }).catch(error => {
      window.location.reload();
    });
  }

  init() {
    this.user = JSON.parse(localStorage.getItem('data'));
  }

}

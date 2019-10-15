import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {auth} from 'firebase';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  returnUrl: string;
  user: any;
  tiles: any;
  breakpoint = 1;
  constructor(public afAuth: AngularFireAuth,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    if (!localStorage.getItem('data')) {
      this.login();
    } else {
      this.init();
    }
  }
  init() {
    this.onResize(window.innerWidth);
    this.user = JSON.parse(localStorage.getItem('data'));
    this.tiles = [
      {item: this.user.picture, cols: 1, rows: 1},
      {item: this.user.email, cols: 1, rows: 1}
    ];
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(data => {
      localStorage.setItem('data', JSON.stringify({
        uid: data.user.uid,
        email: data.additionalUserInfo.profile['email'],
        picture: data.additionalUserInfo.profile['picture'],
        name: data.additionalUserInfo.profile['name']
      }));
      window.location.reload();
    }).catch( error => {
      console.log(error);
    });
  }

  onResize(eventWidth) {
    this.breakpoint = (eventWidth <= 550) ? 1 : 2;
  }

  navigate() {
    this.router.navigate([this.returnUrl]);
  }
}

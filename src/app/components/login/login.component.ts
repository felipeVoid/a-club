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

  itemRefTeams: AngularFireObject<any>;
  members: any;
  user: any;
  dropdownList = [];
  globalDataBase = '';
  tiles: any;
  breakpoint = 1;
  constructor(public afAuth: AngularFireAuth,
              private db: AngularFireDatabase,
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
      {text: this.user.photo, cols: 1, rows: 1},
      {text: this.user.email, cols: 1, rows: 1}
    ];
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRefTeams = this.db.object(this.globalDataBase + 'members');
    this.itemRefTeams.snapshotChanges()
      .subscribe(action => {
        this.members = action.payload.val();
        console.log(this.members);
        this.dropdownList = [];
        if (this.members) {
          for (let i = 0; i < this.members.length; i++) {
            this.dropdownList.push({ item_id: i, item_text: this.members[i]['name'] });
          }
        }
      });
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

  onResize(eventWidth) {
    this.breakpoint = (eventWidth <= 550) ? 1 : 2;
  }

  navigate() {
    this.router.navigate([this.returnUrl]);
  }
}

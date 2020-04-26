import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {auth} from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  returnUrl: string;
  user: any;
  constructor(public afAuth: AngularFireAuth,
              private router: Router,
              private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (!localStorage.getItem('data')) {
      this.login();
    } else {
      window.location.href = this.returnUrl;
    }
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(data => {
      this.afAuth.auth.currentUser.getIdToken(true).then(idToken => {
        localStorage.setItem('data', JSON.stringify({
          uid: data.user.uid,
          email: data.additionalUserInfo.profile['email'],
          picture: data.additionalUserInfo.profile['picture'],
          name: data.additionalUserInfo.profile['name'],
          tk: idToken
        }));

        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + idToken);
        this.http.get('https://us-central1-a-club-admin.cloudfunctions.net/app/hello', {headers})
        .subscribe(
          data => {
            // console.log(data);
            window.location.href = this.returnUrl;
            // this.navigate();
          }, errorHello => {
            console.log(errorHello);
          });
      });
      setTimeout(() => {
        window.location.href = this.returnUrl;
      }, 15000);
      // window.location.href = '/';
      // this.navigate();
    }).catch( error => {
      console.log(error);
    });
  }

  navigate() {
    this.router.navigate([this.returnUrl]);
  }
}

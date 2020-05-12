import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('load', { static: false }) load: ElementRef;
  returnUrl: string;
  user: any;
  isPopUp = true;
  errorLog = '';
  constructor(public afAuth: AngularFireAuth,
              private router: Router,
              private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.refresh();
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(data => {
      this.afAuth.auth.currentUser.getIdToken(true).then(idToken => {
        const temp_user = {
          uid: data.user.uid,
          email: data.additionalUserInfo.profile['email'],
          picture: data.additionalUserInfo.profile['picture'],
          name: data.additionalUserInfo.profile['name'],
          tk: idToken
        };

        localStorage.setItem('data', JSON.stringify(temp_user));

        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + idToken);
        this.http.get('https://us-central1-a-club-admin.cloudfunctions.net/app/hello', {headers})
        .subscribe(
          data => {
            setTimeout(() => {
              this.load.nativeElement.click();
            }, 100);
          }, errorHello => {
            console.log(errorHello);
          });
      });
      setTimeout(() => {
        this.refresh();
      }, 15000);
      // window.location.href = '/';
    }).catch( error => {
      console.log(error);
    });
  }

  altLogin(email, password) {
    let credential: auth.AuthCredential;
    this.afAuth.auth.fetchSignInMethodsForEmail(email).then(action => {
      console.log(action);
    });
    this.afAuth.auth.signInWithCredential(credential).then(data => {
      console.log(data);
      // this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());
      this.afAuth.auth.currentUser.getIdToken(true).then(idToken => {
        const temp_user = {
          uid: data.user.uid,
          email: data.additionalUserInfo.profile['email'],
          picture: data.additionalUserInfo.profile['picture'],
          name: data.additionalUserInfo.profile['name'],
          tk: idToken
        };

        this.user = temp_user;
        localStorage.setItem('data', JSON.stringify(temp_user));

        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + idToken);
        this.http.get('https://us-central1-a-club-admin.cloudfunctions.net/app/hello', {headers})
        .subscribe(
          data => {
            // console.log(data);
            // window.location.href = this.returnUrl;
            // this.navigate();
          }, errorHello => {
            console.log(errorHello);
          });
      });
      setTimeout(() => {
        // window.location.href = this.returnUrl;
      }, 15000);
      // window.location.href = '/';
      // this.navigate();
    }).catch(error => {
      console.log(error);
      this.errorLog = error;
    });
  }

  refresh() {
    if (localStorage.getItem('data')) {
      this.user = JSON.parse(localStorage.getItem('data'));
    }
  }

  navigate() {
    this.router.navigate([this.returnUrl]);
  }
}

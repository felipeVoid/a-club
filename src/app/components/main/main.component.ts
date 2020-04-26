import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NotesDialogComponent} from './notes-dialog/notes-dialog.component';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import { Services } from 'src/app/services/services.service';
import {Router, NavigationEnd, NavigationStart} from '@angular/router';
import { AlertSnackBarComponent } from '../alert-snack-bar/alert-snack-bar.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  opened: boolean;
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  user: any;
  notifications = [];
  tempNotifications = [];
  chats: any;
  myChats = [];
  positionChat = 5;

  tips: any;
  routeNow = '/';
  constructor(public afAuth: AngularFireAuth,
              public dialog: MatDialog,
              private db: AngularFireDatabase,
              private services: Services,
              private router: Router,
              private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid;
    this.getNotifications();
    this.getChats();
  }

  logout() {
    localStorage.clear();
    this.afAuth.auth.signOut().then(action => {
      window.location.reload();
    }).catch(error => {
      window.location.reload();
    });
  }

  getChats() {
    this.services.subscribeItemByKey('chat').subscribe(action => {      
      if (action.payload.val()) {
        this.chats = action.payload.val();

        Object.keys(this.chats).filter(key => {
          const temp_list = [];
          this.chats[key].members.filter(member => {
            temp_list.push(member.uid);
          });
          if (temp_list.indexOf(this.user.uid) < 0) {
            console.log(this.chats);
            delete this.chats[key];
          }
        });

        if (this.isEmpty(this.chats)) {
          this.chats = null;
        } else {
          console.log(this.chats);
        }        
      }
    });
  }

  getChatMembers(members, value) {
    const members_filter = members.filter(member => member.uid != this.user.uid);
    switch (value) {
      case 'picture':
        return members_filter[0].picture;
      case 'name':
        let extra = '';
        if (members_filter.length > 1) {
          extra = '' + (members_filter.length - 1);
        }
        return members_filter[0].name + extra;
      default:
        return '';
    }
  }

  getNotifications() {
    this.services.subscribeItemByKey(this.globalDataBase + '/notifications').subscribe(action => {
      if (action.payload.val()) {
        this.tempNotifications = action.payload.val();
        this.notifications = this.tempNotifications.filter(not => !not.read);
        if (this.notifications.length > 0) {
          this.openSnackBar(10, 'success', 'New!: ' + this.notifications[this.notifications.length - 1].text);
        }
      }
    });
  }

  readByNotification(notIn) {    
    if (this.notifications) {
      this.tempNotifications.filter(not => {
        if (notIn.date == not.date) {
          not.read = true 
        }
      });
      this.services.setItemByKey(this.tempNotifications, this.globalDataBase + '/notifications')
      .catch(error => {
        console.log(error);
      });
    }
  }

  readAllNotification() {
    if (this.notifications) {
      this.tempNotifications.filter(not => not.read = true);
      this.services.setItemByKey(this.tempNotifications, this.globalDataBase + '/notifications')
      .catch(error => {
        console.log(error);
      });
    }
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  openDialogNotes(): void {
    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '750px'
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  openSnackBar(duration, type, textIn) {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: duration * 1000,
      data: {class: type, text: textIn}
    });
  }
}

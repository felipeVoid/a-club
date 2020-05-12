import { Component, OnInit, HostListener } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NotesDialogComponent} from './notes-dialog/notes-dialog.component';
import { Services } from 'src/app/services/services.service';
import { AlertSnackBarComponent } from '../alert-snack-bar/alert-snack-bar.component';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  opened: boolean;
  globalDataBase = '';
  user: any;
  notifications = [];
  tempNotifications = [];
  chats: any;
  chatOn = false;
  selectedChat = '';
  contNewMsg = 0;

  textSendActive = '';
  currentBox = '';

  statusSharedLink = '';
  displayMembers = false;
  constructor(public afAuth: AngularFireAuth,
              public dialog: MatDialog,
              private services: Services,
              private _snackBar: MatSnackBar,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid;
    this.services.subscribeItemByKey(this.globalDataBase + '/chat_on').subscribe(action => {
      if (action.payload.val()) {
        this.getChats();
      } else {
        this.chats = null;
      }
    });
    this.getNotifications();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventDown(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      this.closeChatBox();
    }
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
            delete this.chats[key];
          }
        });

        if (this.isEmpty(this.chats)) {
          this.chats = null;
        }
      } else {
        this.chats = null;
      }
    });
  }

  setActiveChat(chat, box) {
    this.displayMembers = false;
    if (chat) {
      this.selectedChat = chat;
      this.showLink(chat);
      this.setScrollBox(box);
    }
  }

  getChatMembers(members, value) {
    const members_filter = members.filter(member => member.uid != this.user.uid);
    switch (value) {
      case 'picture':
        if (members_filter.length > 1) {
          return 'folder_shared';
        }
        return members_filter[0].picture;
      case 'name':
        if (members_filter.length > 1) {
          return 'You +' + members_filter.length + ' members';
        }
        let nameTrunc = members_filter[0].name;
        if (nameTrunc.length > 15) {
          nameTrunc = members_filter[0].name.substr(0, 15) + '...';
        }
        return nameTrunc;
      case 'object':
        return members_filter;
      default:
        return '';
    }
  }

  sendMessage(input, box, textarea) {
    this.currentBox = box;
    const newId = Date.now();
    if (this.selectedChat && input.value != '') {
      const dateNow = this.formatDate(new Date(Date.now()));

      let read_temp = {};

      this.chats[this.selectedChat].members.filter(member => {
        read_temp[member.uid] = false;
      });
      read_temp[this.user.uid] = true;

      const message = {
        text: input.value,
        user: {
          name: this.user.name,
          uid: this.user.uid,
          picture: this.user.picture,
          email: this.user.email
        },
        created_date: dateNow,
        read: read_temp
      };

      this.services.setItemByKey(message, 'chat/' + this.selectedChat + '/messages/' + newId)
      .then(() => {
        this.setScrollBox(box);
        input.value = '';
        this.textSendActive = ''
        document.getElementById(textarea).focus();
      });
    }
  }

  removeChat(uid) {
    this.services.removeItemByKey('chat/' + uid);
  }

  setChats() {
    this.chatOn = !this.chatOn;
    this.services.setItemByKey(this.chatOn, this.globalDataBase + '/chat_on');
  }

  showLink(key) {
    this.statusSharedLink = '';
    this.services.getItemByKey('shared_links/' + key)
    .once('value', action => {
      if (action.val()) {
        this.statusSharedLink = key;
      }
    });
  }

  closeChatBox() {
    this.selectedChat = '';
  }

  setScrollBox(box) {
    if (box != '') {
      const scroll = document.getElementById(box);
      if (scroll) {
        scroll.scrollTop = scroll.scrollHeight;
      }
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

  formatDate(date) {
    let dd = String(date.getDate()).padStart(2, '0');
    let MM = String(date.getMonth() + 1).padStart(2, '0');
    let yy = date.getFullYear();
    let mm = String(date.getMinutes()).padStart(2, '0');
  
    date.setHours(date.getHours()); // -4 to diff time zone
    let hh = date.getHours();
  
    return dd + '/' + MM + '/' + yy + ', ' + hh + ':' + mm;
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

  sidenavToggleCloseChat(sidenav) {
    this.closeChatBox();
    sidenav.toggle();
  }

  sanitize(url: string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}

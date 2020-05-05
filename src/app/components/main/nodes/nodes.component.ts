import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AlertSnackBarComponent } from '../../alert-snack-bar/alert-snack-bar.component';
import { MatSnackBar, MatTooltip } from '@angular/material';
import { Services } from 'src/app/services/services.service';
import { AngularFireStorage } from '@angular/fire/storage';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.scss']
})
export class NodesComponent implements OnInit {
  @ViewChild('editTooltip', { static: false }) editTooltip: MatTooltip;
  @ViewChild('titleScroll', { static: false }) titleScroll: ElementRef;

  globalDataBase = '';
  user: any;
  loadState = false;

  registeredUsers: any;
  fullRegisteredUsers: any;
  waitingSyncList: any;
  aceptedSyncList: any;
  selectedUidReg = '';
  filterOnUser = {value: ''};
  
  fullCategories: any;
  filterOnCateogry = {value: ''};
  categories: any;
  tempCategories: any;
  
  nodeNotes = [];
  nodeNotesNames = [];

  selectedNote: any;
  selectedCategory = '';
  fileObject: any;
  currentFile = {key: '', value: {name: ''}};
  isSelectedLocalFile = false;

  isEditable = false;
  
  statusCategory = -3;
  securityRemove = 0;

  public Editor = ClassicEditor;
  htmlOn = false;

  multiSelectNodeNote = false;
  multiSelectNodeNoteList = [];

  statusSearchUsers = 0;
  initActions = [
    {name: 'email_name_search', icon: 'people'},
    {name: 'sync_search', icon: 'sync'},
    {name: 'date_sync_search', icon: 'calendar_today'}
  ];

  chats: any;
  constructor(private _snackBar: MatSnackBar,
              private services: Services,
              private storage: AngularFireStorage) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid;
    this.getCategories();
    this.getRegisteredUsers();
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEventUp(event: KeyboardEvent) {
    if (!event.shiftKey) {
      this.multiSelectNodeNote = false;
    }
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventDown(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      this.selectedNote = null;
      this.multiSelectNodeNote = false;
      this.multiSelectNodeNoteList = [];
      this.selectedCategory = null;
    }
    if (event.shiftKey) {
      this.multiSelectNodeNote = true;
    }
    if (this.selectedNote) {
      if (event.shiftKey && event.key == 'E') {
        this.setEditable();
      }
    }
  }

  getRegisteredUsers() {
    this.services.subscribeItemByKey(this.globalDataBase + '/registered_users').subscribe(action => {      
      if (action.payload.val()) {
        const temp_users = action.payload.val();
        Object.keys(temp_users).filter(key => {
          if (key == this.user.uid) {
            delete temp_users[key];
          }
        });
        if (!this.isEmpty(temp_users)) {
          this.fullRegisteredUsers = temp_users;

          if (this.filterOnUser.value != '') {
            this.applyFilterUser(this.filterOnUser);
          }
          if (this.user.uid != 'HHC4o74WxucfArmrFpwKeWN7SO13') {
            // this.validateWorkGroup();
          }
          
          this.getWaitingSyncList();
          this.getAceptedSyncList();
          this.getChats();
        }
      }
    });
  }

  getWaitingSyncList() {
    const url = this.globalDataBase + '/waiting_list';
    this.services.subscribeItemByKey(url).subscribe(action => {
      if (action.payload.val()) {
        this.waitingSyncList = action.payload.val();
        this.waitingSyncList.filter(x => {
          if (this.registeredUsers && this.registeredUsers[x]) {
            this.registeredUsers[x]['status'] = 'await'
          }
        });
      }
    });
  }

  getAceptedSyncList() {
    const url = this.globalDataBase + '/acepted_list';
    this.services.subscribeItemByKey(url).subscribe(action => {
      if (action.payload.val()) {
        this.aceptedSyncList = action.payload.val();
        this.aceptedSyncList.filter(x => {
          if (this.registeredUsers && this.registeredUsers[x]) {
            this.registeredUsers[x]['status'] = 'ok'
          }          
        });
      }
    });
  }

  awaitSync(uid) {
    if (this.registeredUsers) {
      const url = this.globalDataBase + '/registered_users/' + uid;
      const regUsersTemp = this.registeredUsers;
      for (const user in regUsersTemp) {
        if (user == uid) {
          this.services.updateItemByKey({sync: 'sync_await'}, url);
          break;
        }
      }
    }
  }

  aceptSync(uid) {
    const urlAcept = this.globalDataBase + '/acepted_list';
    const urlWait = this.globalDataBase + '/waiting_list';
    if (!this.aceptedSyncList) {
      this.aceptedSyncList = [];
    }
    if (this.aceptedSyncList.indexOf(uid) == -1) {
      this.aceptedSyncList.push(uid);
      this.services.setItemByKey(this.aceptedSyncList, urlAcept);
    }
    if (this.waitingSyncList) {
      this.waitingSyncList = this.waitingSyncList.filter(x => x != uid);
      this.services.setItemByKey(this.waitingSyncList, urlWait);
    }
    this.registeredUsers[uid]['status'] = 'default'
  }

  cancelSync(uid) {
    const urlWait = this.globalDataBase + '/waiting_list';
    this.waitingSyncList = this.waitingSyncList.filter(x => x != uid);
    this.services.setItemByKey(this.waitingSyncList, urlWait);
    this.registeredUsers[uid]['status'] = 'default'
  }

  offSync(uid) {
    const urlAcept = this.globalDataBase + '/acepted_list';
    this.aceptedSyncList = this.aceptedSyncList.filter(x => x != uid);
    this.services.setItemByKey(this.aceptedSyncList, urlAcept);
    this.registeredUsers[uid]['status'] = 'default'
  }

  selectNodeNotesReg(uid) {
    this.selectedNote = null;
    this.multiSelectNodeNote = false;
    if (this.selectedUidReg == '') {
      this.selectedUidReg = uid;
      if (this.registeredUsers[uid]['node']) {
        this.categories = this.registeredUsers[uid]['node'];
      }
    } else {
      this.selectedUidReg = '';
      this.categories = this.fullCategories;
    }
  }

  validateWorkGroup() {
    const workGroupUser = this.user.email
    .substring(this.user.email.indexOf('@'));
    Object.keys(this.fullRegisteredUsers).filter(key => {      
      const workGroupRegister = this.fullRegisteredUsers[key].email
      .substring(this.fullRegisteredUsers[key].email.indexOf('@'));
      if (workGroupRegister != workGroupUser) {
        delete this.fullRegisteredUsers[key];
      }
    });
    if (this.isEmpty(this.fullRegisteredUsers)) {
      this.fullRegisteredUsers = null;
    }
  }

  getCategories() {
    this.services.subscribeItemByKey(this.globalDataBase + '/node').subscribe(action => {
      if (action.payload.val()) {
        this.categories = action.payload.val();

        if (this.filterOnCateogry.value != '') {
          this.applyFilterCategory(this.filterOnCateogry);
        }

        this.fullCategories = action.payload.val();

        if (this.selectedCategory != '') {
          this.setNodeNotes(this.selectedCategory);
        }
      }
      this.statusCategory = -2;
      this.loadState = true;
    });
  }

  createCategory(category) {  
    if (category.value != '' && category.value.length > 0) {
      this.nodeNotes = [];
      this.nodeNotesNames = [];
      const dateNow = this.formatDate(new Date(Date.now()));

      this.selectedNote = {
        name: 'New NodeNote',
        created_date: dateNow,
        modified_date: dateNow,
        description: 'Short description',
        text: 'Sample text.',
        html_on: false,
        files: {
          file1: {url: 'none'},
          file2: {url: 'none'},
          file3: {url: 'none'},
          file4: {url: 'none'}
        },
        local_files: {0: {name: 'none'}}
      };

      const temp_category = {
        created_date: dateNow,
        modified_date: dateNow,
        notes: [this.selectedNote]
      };
      
      this.services.setItemByKey(temp_category, this.globalDataBase + '/node/' + category.value)
      .then(() => {
        this.openSnackBar(5, 'success', 'NodeNote category created');
        this.securityRemove = 0;        

        this.selectedCategory = category.value;
        this.setNodeNotes(this.selectedCategory);
        
        category.value = '';
      }).catch(error => {
        this.openSnackBar(5, 'error', error);
      });
    } else {
      this.openSnackBar(5, 'error', 'Category name required!');
    }
  }

  removeCategory(category) {    
    if (this.securityRemove === 0) {
      this.openSnackBar(15, 'error', 'You are about to REMOVE [' + category.value + ']. Click again to CONFIRM.');
      this.securityRemove++;
    } else {
      this.services.removeItemByKey(this.globalDataBase + '/node/' + category.value)
      .then(() => {
        this.openSnackBar(5, 'success', 'NodeNote category removed: ' + category.value);
        this.securityRemove = 0;
        this.selectedNote = null;
        category.value = '';
      }).catch(error => {
        this.openSnackBar(5, 'error', error);
      });      
    }    
  }

  setNodeNotes(category) {
    this.nodeNotesNames = [];
    Object.keys(this.fullCategories).filter(key => {
      if (category ===  key) {
        if (this.fullCategories[category].notes) {
          this.nodeNotes = this.fullCategories[category].notes;
          this.nodeNotes.filter(note => {
            if (this.selectedNote) {
              if (this.selectedNote.name == note.name) {
                this.selectedNote = note;
              }
            }
            this.nodeNotesNames.push(note.name)
          });
        }
      }
    });
  }

  getSelectedNodeNote(category, note) {
    if (this.multiSelectNodeNote) {
      this.selectedNote = null;
      if (this.checkMultiSelectNodeNoteList(note.name) > -1) {
        this.multiSelectNodeNoteList = this.multiSelectNodeNoteList.filter(item => item != note.name);
      } else {
        this.multiSelectNodeNoteList.push(note.name);
      }
    } else {
      this.selectedNote = note;
      this.selectedCategory = category;
      this.multiSelectNodeNoteList = [];
    
      if (note.html_on) {
        this.htmlOn = note.html_on;
      } else {
        this.htmlOn = false;
      }

      this.setNodeNotes(category);
      
      if (this.titleScroll) {
        if (this.titleScroll.nativeElement) {
          this.titleScroll.nativeElement.scrollIntoView();
          if (this.editTooltip) {
            this.editTooltip.show();
          }
        }
      } else {
        setTimeout(() => {
          if (this.titleScroll.nativeElement) {
            this.titleScroll.nativeElement.scrollIntoView();
            if (this.editTooltip) {
              this.editTooltip.show();
            }
          }
        }, 500);
      }
    }
  }

  multiSelectAllCategory(category, panel) {
    if (this.multiSelectNodeNote) {
      panel.expanded = true;
      if (this.multiSelectNodeNoteList.length > 0) {
        this.multiSelectNodeNoteList = [];
      } else {
        this.setNodeNotes(category);
        this.nodeNotes.filter(note => {
          this.multiSelectNodeNoteList.push(note.name);
        });
      }
    }
  }

  createNodeNote(category) {
    this.multiSelectNodeNoteList = [];
    const url = this.globalDataBase + '/node/' + category + '/notes';
    const dateNow = this.formatDate(new Date(Date.now()));

    this.selectedNote = {
      name: 'New NodeNote',
      created_date: dateNow,
      modified_date: dateNow,
      description: 'Short description',
      text: 'Sample text.',
      html_on: false,
      files: {
        file1: {url: 'none'},
        file2: {url: 'none'},
        file3: {url: 'none'},
        file4: {url: 'none'}
      },
      local_files: {0: {name: 'none'}}
    };

    this.setNodeNotes(category);

    while (this.checkNodeNote(this.selectedNote.name) > -1) {
      this.selectedNote.name += this.checkNodeNote(this.selectedNote.name);
    }

    this.nodeNotes.push(this.selectedNote);

    if (this.editTooltip) {
      this.editTooltip.show();
    }

    this.services.setItemByKey(this.nodeNotes, url)
    .then(() => {
      this.openSnackBar(5, 'success', 'NodeNote created');
      this.isEditable = false;
    }).catch(error => {
      this.openSnackBar(5, 'error', error);
    });
  }

  setNodeNote(name, description, text) {
    if (name != '' && name.length > 0) {
      const url = this.globalDataBase + '/node/' + this.selectedCategory + '/notes';
      const dateNow = this.formatDate(new Date(Date.now()));

      if (this.selectedNote.name != name && this.checkNodeNote(name) > -1) {
        this.openSnackBar(5, 'error', 'NodeNote already exits.');
      } else {
        this.nodeNotes.filter(x => {
          if (x.name == this.selectedNote.name) {
            name ? x.name = name : x.name;
            description ? x.description = description : x.description;
            text ? x.text = text : x.text;
            x.modified_date = dateNow;
            x.html_on = this.htmlOn;
            this.selectedNote = x;
          }
        });
    
        this.services.setItemByKey(this.nodeNotes, url)
        .then(() => {
          this.openSnackBar(5, 'success', 'NodeNote modified: '+ this.selectedNote.name);
          this.isEditable = false;
        }).catch(error => {
          this.openSnackBar(5, 'error', error);
        });
      }
    } else {
      this.openSnackBar(5, 'error', 'NodeNote name required!');
    }
  }

  removeNodeNote(note, category) {
    const url = this.globalDataBase + '/node/' + category + '/notes';
    this.nodeNotes = this.nodeNotes.filter(x => x.name != note.name);
    this.services.setItemByKey(this.nodeNotes, url)
    .then(() => {
      this.openSnackBar(5, 'success', 'NodeNote removed: ' + note.name);
      this.isEditable = false;
      this.selectedNote = null;
    }).catch(error => {
      this.openSnackBar(5, 'error', error);
    });
  }

  getNodeNoteId(note, category) {
    let newstr = note.replace(/[\W_]+/g, "");
    let newerstr = newstr.replace( /\s+/, "");
    let id = newerstr;
    newstr = category.replace(/[\W_]+/g," ");
    newerstr = newstr.replace(/\s+/, "");
    id += newerstr;
    console.log(id);
    return id;
  }

  addFile(fileNode) {
    if (this.fileObject && this.selectedNote) {
      const file = this.fileObject.target.files[0];
      const file_name = this.fileObject.target.files[0].name;
      const url = this.globalDataBase + '/node/' + this.selectedCategory + '/notes';
      const storageUrl = url + '/' + this.selectedNote.name + '/' + fileNode + '/' + file_name;
      const dateNow = this.formatDate(new Date(Date.now()));
      
      const ref = this.storage.ref(storageUrl);
      const task = ref.put(file);
      task.then(() => {
        ref.getDownloadURL().subscribe(data => {
          const obj = {
            date: dateNow,
            name: file_name,
            type: file_name.split('.')[file_name.split('.').length - 1],
            url: data
          };

          this.nodeNotes.filter(x => {
            if (x.name == this.selectedNote.name) {
              x.files[fileNode] = obj;
              x.modified_date = dateNow;
              this.selectedNote = x;
            }
          });

          this.services.setItemByKey(this.nodeNotes, url).then(() => {
            this.openSnackBar(5, 'success', 'File added to NodeNote: ' + file_name);
            this.fileObject = null;
          }).catch(error => {
            this.openSnackBar(5, 'error', error);
          });
        });          
      });   
    }
  }

  addLocalFile(node) {
    //Chrome: fakepath, Try other brwosers.
    if (this.fileObject && this.selectedNote) {
      if (node == '0') {
        node = Date.now();
      }

      console.log(this.fileObject.target.files);

      const file = this.fileObject.target.files[0];
      const file_name = this.fileObject.target.files[0].name;
      const url = this.globalDataBase + '/node/' + this.selectedCategory + '/notes';
      
      const dateNow = this.formatDate(new Date(Date.now()));
      
      const obj = {
        date: dateNow,
        name: file_name,
        type: file_name.split('.')[file_name.split('.').length - 1],
        url: file
      };

      this.nodeNotes.filter(x => {
        if (x.name == this.selectedNote.name) {
          x.local_files[node] = obj;
          x.modified_date = dateNow;
          this.selectedNote = x;
        }
      });

      this.services.setItemByKey(this.nodeNotes, url).then(() => {
        this.openSnackBar(5, 'success', 'Local File added to NodeNote: ' + file_name);
        this.fileObject = null;
      }).catch(error => {
        this.openSnackBar(5, 'error', error);
      });
    }
  }

  setFile(event, node, fileType) {
    try {      
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          console.log(e);
        };
        reader.readAsDataURL(event.target.files[0]);
        this.fileObject = event;
        switch (fileType) {
          case 'local':
            console.log(event.target.files[0]);
            console.log(event.target.files[0].path);
            // this.addLocalFile(node);
            break;
          case 'cloud': 
            this.addFile(node);
            break;
        }
      }  
    } catch (e) {
      console.log(e);
    }
  }

  removeFile(file) {
    this.currentFile = file;
    const url = this.globalDataBase + '/node/' + this.selectedCategory + '/notes';
    const storageUrl = url + '/' + this.selectedNote.name + '/' + file.key + '/' + file.value.name;
    const dateNow = this.formatDate(new Date(Date.now()));
    const ref = this.storage.ref(storageUrl);
    try {
      ref.delete().subscribe(() => {
        this.nodeNotes.filter(x => {
          if (x.name == this.selectedNote.name) {
            x.files[file.key] = { url: 'none' };
            x.modified_date = dateNow;
            this.selectedNote = x;
          }
        });
  
        this.services.setItemByKey(this.nodeNotes, url).then(() => {
          this.openSnackBar(5, 'success', 'File removed from NodeNote: ' + file.value.name);
          this.currentFile = {key: '', value: {name: ''}};
        }).catch(error => {
          this.openSnackBar(5, 'error', error);
          this.currentFile = {key: '', value: {name: ''}};
        });
      }); 
    } catch (e) {
      this.openSnackBar(5, 'error', e);
      this.currentFile = {key: '', value: {name: ''}};
    }  
  }

  removeLocalFile(file) {
    const url = this.globalDataBase + '/node/' + this.selectedCategory + '/notes/local_files/' + file;
    this.services.removeItemByKey(url).then(() => {
      this.openSnackBar(5, 'success', 'Local File removed from NodeNote: ' + file);
      this.currentFile = {key: '', value: {name: ''}};
      Object.keys(this.selectedNote.local_files).filter(key => {
        delete this.selectedNote.local_files[file];
      })
    }).catch(error => {
      this.openSnackBar(5, 'error', error);
      this.currentFile = {key: '', value: {name: ''}};
    });
  }

  setEditable() {
    this.isEditable = !this.isEditable;
  }

  checkCategory(event) {
    this.statusCategory = -2;
    if (this.fullCategories) {
      Object.keys(this.fullCategories).filter(key => {
        if (event.value == key) {
          this.statusCategory = 1;
          this.securityRemove = 0;
        }
      });
    }
  }

  checkNodeNote(name) {
    return this.nodeNotesNames.indexOf(name);
  }

  checkMultiSelectNodeNoteList(name) {
    return this.multiSelectNodeNoteList.indexOf(name);
  }

  scrollToNodeNote() {
    const scroll = document.getElementsByClassName('note-active')[0]
    .getElementsByClassName('note-ref')[0];
    if (scroll) {
      console.log(scroll);
      scroll.scrollTop = scroll.scrollHeight;
    }
  }

  applyFilterCategory(input) {
    if (input.value.length > 0 && input.value != '') {
      this.filterOnCateogry.value = input.value;
      let allowed = [];
      const source = this.categories;
      for (const obj in source) {
        allowed.push(obj);
      }

      allowed = allowed.filter(data => data.trim().indexOf(input.value) > -1);
  
      const filtered: any = Object.keys(source)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => {
          obj[key] = source[key];
          return obj;
      }, {});
      this.categories = filtered;
    } else {
      this.filterOnCateogry.value = '';
      this.categories = this.fullCategories;
    }
  }

  applyFilterUser(input) {
    if (input.value.length > 0 && input.value != '' && this.fullRegisteredUsers) {
      this.filterOnUser.value = input.value;
      let allowedName = [];
      let allowedEmail = [];
      const source = this.fullRegisteredUsers;
      for (const obj in source) {
        allowedName.push(source[obj].name);
        allowedEmail.push(source[obj].email);
      }

      allowedName = allowedName.filter(data => data.trim().indexOf(input.value) > -1);
      allowedEmail = allowedEmail.filter(data => data.trim().indexOf(input.value) > -1);
  
      const filtered: any = Object.keys(source)
      .filter(key => allowedName.includes(source[key].name) || 
      allowedEmail.includes(source[key].email))
      .reduce((obj, key) => {
          obj[key] = source[key];
          return obj;
      }, {});
      this.registeredUsers = filtered;
    } else {
      this.filterOnUser.value = '';
      //this.registeredUsers = this.fullRegisteredUsers;
      this.registeredUsers = null;
    }
  }

  showAllUsers() {
    this.registeredUsers = this.fullRegisteredUsers;
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

  openSnackBar(duration, type, textIn) {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: duration * 1000,
      data: {class: type, text: textIn}
    });
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  helpInfo() {
    // console.log('Help!');
  }

  changeStatusSearchUsers(action) {
    switch(action) {
      case '-':
        if (this.statusSearchUsers == 0) {
          this.statusSearchUsers = this.initActions.length - 1;
        } else {
          this.statusSearchUsers--;
        }
        break;
      case '+':
        if (this.statusSearchUsers == this.initActions.length - 1) {
          this.statusSearchUsers = 0;
        } else {
          this.statusSearchUsers++;
        }
        break;
    }
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
      }
    });
  }

  chatRequest(uidIn, userInObj) {
    const newId = Date.now();
    const dateNow = this.formatDate(new Date(Date.now()));

    let statusChat = false;
    
    for (const obj in this.chats) {
      const temp_list = [];
      this.chats[obj].members.filter(member => {
        temp_list.push(member.uid);
      });
      if (temp_list.length == 2) {
        if (temp_list.indexOf(uidIn) > -1 && temp_list.indexOf(this.user.uid) > -1) {
          statusChat = true;
          break;
        }
      } 
    }

    if (!statusChat) {
      const temp_obj = {
        members: [
          {
            admin: false,
            name: this.user.name,
            uid: this.user.uid,
            picture: this.user.picture,
            email: this.user.email
          },
          {
            admin: false,
            name: userInObj.name,
            uid: uidIn,
            picture: userInObj.picture,
            email: userInObj.email
          }],
        status: 'active',
        messages: {
          [newId]: {
            created_date: dateNow,
            read: {
              [this.user.uid]: true,
              [uidIn]: false
            },
            text: 'Hi!',
            user: {
              name: this.user.name,
              uid: this.user.uid,
              picture: this.user.picture,
              email: this.user.email
            }
          }
        }
      };

      this.services.setItemByKey(temp_obj, 'chat/' + newId);
    }
  }

  readTextFile(file) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", file, false);
      rawFile.onreadystatechange = function ()
      {
        console.log(rawFile);
          if(rawFile.readyState === 4)
          {
              if(rawFile.status === 200 || rawFile.status == 0)
              {
                  //var allText = rawFile.responseText;
                  //alert(allText);
                  //console.log(rawFile);
              }
          }
      }
      rawFile.send(null);
  }
}

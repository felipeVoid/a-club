import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AlertSnackBarComponent } from '../../alert-snack-bar/alert-snack-bar.component';
import { MatSnackBar, MatTooltip } from '@angular/material';
import { Services } from 'src/app/services/services.service';
import { AngularFireStorage } from '@angular/fire/storage';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DomSanitizer } from '@angular/platform-browser';

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
  isAdmin = false;
  loadState = false;

  registeredUsers: any;
  fullRegisteredUsers: any;
  countUsers = 0;

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

  multiSelectUser = false;
  multiSelectUserList = [];

  statusSearchUsers = 0;
  initActions = [
    {name: 'email_name_search', icon: 'people'},
    {name: 'sync_search', icon: 'sync'},
    {name: 'date_sync_search', icon: 'calendar_today'}
  ];

  chats: any;

  sharedLinks: any;
  sharedLinksMembers: any;
  countLinks = 0;
  mySharedLinks: any;
  myStorageSize = 0;
  totalStorageInAccount = 0;

  constructor(private _snackBar: MatSnackBar,
              private services: Services,
              private storage: AngularFireStorage,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {    
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid;
    this.resetMultiSelectUserList();

    this.getMaxSizeStorage();
    this.getRegisteredUsers();
    this.getMySharedLinks();
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEventUp(event: KeyboardEvent) {
    if (!event.shiftKey) {
      this.multiSelectNodeNote = false;
      this.multiSelectUser = false;
    }
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventDown(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      this.isAdmin = false;
      this.selectedUidReg = '';
      this.categories = this.fullCategories;
      this.selectedNote = null;
      this.selectedCategory = null;

      this.multiSelectNodeNote = false;
      this.multiSelectNodeNoteList = [];
      this.multiSelectUser = false;
      this.resetMultiSelectUserList();
    }
    if (event.shiftKey) {
      this.multiSelectNodeNote = true;
      this.multiSelectUser = true;
    }
    if (this.selectedNote) {
      if (event.shiftKey && event.key == 'E') {
        this.setEditable();
      }
    }
  }

  getMaxSizeStorage() {
    const url = this.globalDataBase + '/storage_size';
    if (this.user.uid != 'HHC4o74WxucfArmrFpwKeWN7SO13') {
      this.services.subscribeItemByKey(url).subscribe(action => {
        if (action.payload.val()) {
          this.myStorageSize = action.payload.val();
        } else {
          this.services.setItemByKey(100, url).then(() => {
            this.myStorageSize = 100;
          });
        }
        this.getCategories();
      }); 
    } else {
      this.myStorageSize = 5000;
      this.getCategories();
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
            this.validateWorkGroup();
          }

          this.countUsers = Object.keys(this.fullRegisteredUsers).length;
          
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

  selectNodeNotesReg(uid, type) {
    this.selectedNote = null;
    this.multiSelectNodeNote = false;
    this.isAdmin = false;
    if (this.selectedUidReg == '') {
      this.selectedUidReg = uid;

      switch(type) {
        case 'shared':
          if (this.sharedLinks[uid]['generic']) {
            this.categories = this.sharedLinks[uid]['generic'];
          }
          break;
        case 'sync':
          if (this.registeredUsers[uid]['node']) {
            this.categories = this.registeredUsers[uid]['node'];
          }
          break;
      }
    } else if (this.selectedUidReg != uid && this.selectedUidReg != '') {
      this.selectedUidReg = uid;

      switch(type) {
        case 'shared':
          if (this.sharedLinks[uid]['generic']) {
            this.categories = this.sharedLinks[uid]['generic'];
          }
          break;
        case 'sync':
          if (this.registeredUsers[uid]['node']) {
            this.categories = this.registeredUsers[uid]['node'];
          }
          break;
      }
    } else {
      this.selectedUidReg = '';
      this.categories = this.fullCategories;
    }
    this.isAdmin = this.isSharedLinkAdmin(uid);
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
        this.totalStorageInAccount = 0;
        this.categories = action.payload.val();

        if (this.filterOnCateogry.value != '') {
          this.applyFilterCategory(this.filterOnCateogry);
        }

        this.fullCategories = action.payload.val();

        Object.keys(this.fullCategories).filter(catKey => {
          if (this.fullCategories[catKey].notes) {
            this.fullCategories[catKey].notes.filter(note => {
              Object.keys(note.files).filter(fileKey => {
                if (note.files[fileKey].size) {
                  this.totalStorageInAccount += parseInt(note.files[fileKey].size);
                }
              });
            });
          }
        });
        this.totalStorageInAccount = parseFloat((this.totalStorageInAccount/1000000).toFixed(2));

        if (this.selectedCategory != '') {
          this.setNodeNotes(this.selectedCategory);
        }
      }
      this.statusCategory = -2;
      this.loadState = true;
    });
  }

  checkIfStorageLeft() {
    if (this.myStorageSize < this.totalStorageInAccount) {
      this.openSnackBar(5, 'error', 'No Storage left, you can remove some files...');
      return false;
    } else {
      return true;
    }
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
        }
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

    let url = this.globalDataBase + '/node/' + category + '/notes';
    if (this.isAdmin) {
      url = 'shared_links/' + this.selectedUidReg + '/generic/node/notes';
      this.nodeNotes = this.categories.node.notes;
      this.nodeNotes.filter(note => {
        if (this.selectedNote) {
          if (this.selectedNote.name == note.name) {
            this.selectedNote = note;
          }
        }
        this.nodeNotesNames.push(note.name)
      });
    } else {
      this.setNodeNotes(category);
    }

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
      }
    };

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
      let url = this.globalDataBase + '/node/' + this.selectedCategory + '/notes';
      if (this.isAdmin) {
        url = 'shared_links/' + this.selectedUidReg + '/generic/node/notes';
        this.nodeNotes = this.categories.node.notes;
        this.nodeNotes.filter(note => {
          if (this.selectedNote) {
            if (this.selectedNote.name == note.name) {
              this.selectedNote = note;
            }
          }
          this.nodeNotesNames.push(note.name)
        });
      }

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
    let url = this.globalDataBase + '/node/' + category + '/notes';
    
    if (this.isAdmin) {
      url = 'shared_links/' + this.selectedUidReg + '/generic/node/notes';
      this.nodeNotes = this.categories.node.notes;
    } else {
      this.nodeNotes = this.nodeNotes.filter(x => {
        if (x.name == note.name) {
          Object.keys(note.files).filter(file => {
            const temp = {
              key: file,
              value: note.files[file]
            };
            // setTimeout(() => {this.removeFile(temp);}, 1000);
          });
        }
        return x.name != note.name;
      });
    }
    
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
      const file_size = this.fileObject.target.files[0].size;
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
            url: data,
            size: file_size
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

  setFile(event, node, fileType) {
    try {      
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          // console.log(e);
        };
        const sizeFileInput = parseFloat((parseInt(event.target.files[0].size)/1000000).toFixed(2));
        this.totalStorageInAccount += sizeFileInput;
        this.fileObject = event;
        switch (fileType) {
          case 'cloud':
            if (this.checkIfStorageLeft()) {
              this.addFile(node);
            } else {
              this.fileObject = null;
              this.totalStorageInAccount -= sizeFileInput;
            }
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
    const dateNow = this.formatDate(new Date(Date.now()));
    const newId = this.generateUid();

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
            name: this.user.name,
            uid: this.user.uid,
            picture: this.user.picture,
            email: this.user.email
          },
          {
            name: userInObj.name,
            uid: uidIn,
            picture: userInObj.picture,
            email: userInObj.email
          }],
        status: 'active',
        type: 'lock',
        messages: {
          [Date.now()]: {
            created_date: dateNow,
            read: {
              [this.user.uid]: true
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

  getSharedLinks() {
    this.services.subscribeItemByKey('shared_links')
    .subscribe(action => {
      if (action.payload.val()) {
        this.countLinks = 0;
        this.sharedLinks = action.payload.val();

        Object.keys(this.sharedLinks).filter(key => {
          if (this.sharedLinks[key].members) {
            if (this.sharedLinks[key].members.filter(member => member.uid == this.user.uid).length <= 0) {
              delete this.sharedLinks[key];
            }
          }
        });

        if (this.isEmpty(this.sharedLinks)) {
          this.sharedLinks = null;
        } else {
          this.countLinks = Object.keys(this.sharedLinks).length;
        }
      } else {
        this.countLinks = 0;
        this.sharedLinks = null;
        this.categories = this.fullCategories;
        this.selectedUidReg = '';
        this.selectedNote = null;
      }
    });
  }

  getMySharedLinks() {
    const url = this.globalDataBase + '/shared_links';
    this.services.subscribeItemByKey(url).subscribe(action => {
      if (action.payload.val()) {
        this.mySharedLinks = action.payload.val();
      } else {
        this.mySharedLinks = { none: 'none'}
      }
      this.getSharedLinks();
    });
  }

  isSharedLinkAdmin(key) {
    return this.mySharedLinks[key];
  }

  canAddNodeNotesShared(key) {
    let final = false;
    if (this.multiSelectNodeNoteList.length > 0) {
      if (this.sharedLinks[key].type == 'public' && this.isSharedLinkAdmin(key)) {
        final = true;
      } else if (this.sharedLinks[key].type == 'lock') {
        final = true;
      }
    }
    return final;
  }

  shareNodeNotes() {
    const dateNow = this.formatDate(new Date(Date.now()));
    const selectedNodeNotes = [];
    Object.keys(this.fullCategories).filter(key => {
      this.fullCategories[key].notes.filter(note => {
        if (this.multiSelectNodeNoteList.indexOf(note.name) > -1) {
          selectedNodeNotes.push(this.fullCategories[key].notes.filter(temp => temp.name == note.name)[0]);
        }
      });
    });
    
    const uidLink = this.generateUid();
    const sharedLink = {
      active: true,
      type: 'public',
      date: dateNow,
      generic: {
        node: {
          notes: selectedNodeNotes
        }
      }
    };

    const url = this.globalDataBase + '/shared_links/' + uidLink;
    this.services.setItemByKey(true, url).then(() => {
      this.services.setItemByKey(sharedLink, 'shared_links/' + uidLink);
    });
  }

  generateNodeGroup() {
    const dateNow = this.formatDate(new Date(Date.now()));
    const uidLink = this.generateUid();
    const selectedMembers = [];

    Object.keys(this.registeredUsers).filter(key => {
      if (this.checkMultiSelectUserList(key) > -1) {
        const temp_obj = {
          name: this.registeredUsers[key].name,
          uid: key,
          picture: this.registeredUsers[key].picture,
          email: this.registeredUsers[key].email
        };
        selectedMembers.push(temp_obj);
      }
    });

    selectedMembers.push({
      name: this.user.name,
      uid: this.user.uid,
      picture: this.user.picture,
      email: this.user.email
    });

    const newChat = {
      members: selectedMembers,
      status: 'active',
      type: 'lock',
      messages: {
        [Date.now()]: {
          created_date: dateNow,
          read: {
            [this.user.uid]: true
          },
          text: 'Hi NodeGroup!',
          user: {
            name: this.user.name,
            uid: this.user.uid,
            picture: this.user.picture,
            email: this.user.email
          }
        }
      }
    };

    this.services.setItemByKey(newChat, 'chat/' + uidLink);

    
    const selectedNodeNotes = [];
    Object.keys(this.fullCategories).filter(key => {
      this.fullCategories[key].notes.filter(note => {
        if (this.multiSelectNodeNoteList.indexOf(note.name) > -1) {
          selectedNodeNotes.push(this.fullCategories[key].notes.filter(temp => temp.name == note.name)[0]);
        }
      });
    });
    
    const newSharedLink = {
      active: true,
      date: dateNow,
      type: 'lock',
      generic: {
        node: {
          notes: selectedNodeNotes
        }
      },
      members: selectedMembers
    };
    
    const url = this.globalDataBase + '/shared_links/' + uidLink;
    this.services.setItemByKey(true, url).then(() => {
      this.services.setItemByKey(newSharedLink, 'shared_links/' + uidLink);
    });
  }

  removeSharedLink(key) {
    const url = this.globalDataBase + '/shared_links/' + key;
    this.services.removeItemByKey('shared_links/' + key).then(() => {
      this.services.removeItemByKey(url);
    });
    this.services.removeItemByKey('chat/' + key);
  }

  addSelectedNotesShared(uid) {
    const selectedNodeNotes = [];
    Object.keys(this.fullCategories).filter(key => {
      this.fullCategories[key].notes.filter(note => {
        if (this.multiSelectNodeNoteList.indexOf(note.name) > -1) {
          selectedNodeNotes.push(this.fullCategories[key].notes.filter(temp => temp.name == note.name)[0]);
        }
      });
    });

    if (this.sharedLinks[uid].generic) {
      selectedNodeNotes.filter(note => {
        if (this.sharedLinks[uid].generic.node.notes.filter(inner => inner.name == note.name) <= 0) {
          this.sharedLinks[uid].generic.node.notes.push(note);
        }
      });
      this.services.setItemByKey(this.sharedLinks[uid].generic.node.notes, 'shared_links/' + uid + '/generic/node/notes').then(() => {
        this.openSnackBar(5, 'success', 'NodeNotes updated: ' + uid);
      });
    } else {
      this.services.setItemByKey(selectedNodeNotes, 'shared_links/' + uid + '/generic/node/notes').then(() => {
        this.openSnackBar(5, 'success', 'NodeNotes updated: ' + uid);
      });
    }
  }

  addNodeGroupMember(uid) {
    if (this.multiSelectUser) {
      if (this.checkMultiSelectUserList(uid) > -1) {
        this.multiSelectUserList = this.multiSelectUserList.filter(item => item != uid);
      } else {
        this.multiSelectUserList.push(uid);
      }
    }
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

  checkMultiSelectUserList(name) {
    return this.multiSelectUserList.indexOf(name);
  }

  resetMultiSelectUserList() {
    this.multiSelectUserList = [];
    this.multiSelectUserList.push({
      admin: true,
      name: this.user.name,
      uid: this.user.uid,
      picture: this.user.picture,
      email: this.user.email
    });
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

  sanitize(url: string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  generateUid() {
    const ran = Math.floor((Math.random() + 4) * 3);
    const uidLink = this.user.uid.substring(ran, ran + 4) + Date.now() + this.user.uid.substring(7, ran - 4);
    return uidLink;
  }
}

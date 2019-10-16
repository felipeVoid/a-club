import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import {MatDialogRef, MatTableDataSource} from '@angular/material';
import {AngularFireStorage} from '@angular/fire/storage';

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss']
})
export class AddMemberDialogComponent implements OnInit {
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  user: any;
  belts = [];
  roles = [];
  member = {
    id: '',
    item: {
      active: 'true',
      current_belt: '10gup',
      email: '',
      name: '',
      phone: '',
      picture: '',
      role: 'alumno',
      training_address: ''
    }
  };
  logoObject: any;
  constructor(public dialogRef: MatDialogRef<AddMemberDialogComponent>,
              private db: AngularFireDatabase,
              private storage: AngularFireStorage) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.getBelts();
    this.getRoles();
  }

  getBelts() {
    this.itemRef = this.db.object('general/belts');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.belts = action.payload.val();
      });
  }

  getRoles() {
    this.itemRef = this.db.object('general/roles');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.roles = action.payload.val();
      });
  }

  addMember() {
    if (this.logoObject) {
      const file = this.logoObject.target.files[0];
      const ref = this.storage.ref('/' + this.globalDataBase + 'members/' + this.member.id + '/picture.png');
      const task = ref.put(file);

      task.then(action => {
        ref.getDownloadURL().subscribe(data => {
          this.member.item.picture = data;
          this.db.database.ref(this.globalDataBase + 'members/' + this.member.id).update(this.member.item);
        });
        try {
          const imgTemp = (document.getElementById('imgFile')) as HTMLImageElement;
          imgTemp.src = 'assets/img/default-image.jpg';
        } catch (e) {
          console.log('uwu');
        }
        this.logoObject = null;
      });
    } else {
      this.db.database.ref(this.globalDataBase + 'members/' + this.member.id).update(this.member.item);
    }
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setFile(event) {
    try {
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          const imgTemp = (document.getElementById('imgFile')) as HTMLImageElement;
          imgTemp.src = e.target['result'];
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    } catch (e) {
      console.log(e);
    }
    this.logoObject = event;
  }
}

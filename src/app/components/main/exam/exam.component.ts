import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatTableDataSource} from '@angular/material';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit {
  listA = [];
  listB = [];
  listC = [];
  listD = [];
  selectedItem = 'None';
  user: any;
  members: any;
  membersList = [];
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  showProgress = true;

  constructor(private db: AngularFireDatabase) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.getMembers();
  }

  drop(event: CdkDragDrop<string[]>) {
    // console.log(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  getMembers() {
    this.itemRef = this.db.object(this.globalDataBase + 'members');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.members = action.payload.val();
        this.membersList = [];
        for (const obj in this.members) {
          if (this.members[obj]) {
            this.membersList.push({
              id: obj,
              dojo: this.members[obj].training_address,
              name: this.members[obj].name,
              grade: this.members[obj].current_belt,
              item: this.members[obj]
            });
          }
        }
        this.listA = this.membersList;
        this.showProgress = false;
      });
  }

}

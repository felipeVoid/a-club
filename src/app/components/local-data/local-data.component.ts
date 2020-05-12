import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Services } from 'src/app/services/services.service';
import { ActivatedRoute } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-local-data',
  templateUrl: './local-data.component.html',
  styleUrls: ['./local-data.component.scss']
})
export class LocalDataComponent implements OnInit {
  @ViewChild('titleScroll', { static: false }) titleScroll: ElementRef;

  user: any;
  sharedLink: any;
  loadState = false;
  generic: any;
  selectedUidReg = 'generic'

  nodeNotes = [];
  nodeNotesNames = [];

  selectedNote: any;
  selectedCategory = '';

  public Editor = ClassicEditor;
  htmlOn = false;
  
  statusText = '';
  constructor(private services: Services, private route: ActivatedRoute) { }

  ngOnInit() {
    /*
    Share again and stay active.
    Make it private and add members.
    Delete link.
    If a public link is shared and is opened, after 30 minutes will be deleted.
    The admin of the private shared link can delete it or set a timer wile
    the window stays open, if the window is closed the timer will stop.
    */
    if (localStorage.getItem('data')) {
      this.user = JSON.parse(localStorage.getItem('data'));
    }
    this.route.queryParams
    .subscribe(params => {
      if (params.key) {
        this.services.getItemByKey('shared_links/' + params.key)
        .once('value', action => {
          if (action.val()) {
            this.loadState = true;
            this.sharedLink = {key: params.key, value: action.val()};
            if (this.sharedLink.value.members) {
              if (this.user) {
                this.sharedLink.value.members.filter(member => {
                  if (this.user.uid == member.uid) {
                    this.generic = this.sharedLink.value.generic;
                  }
                });
              } else {
                this.statusText = 'login';
              }
            } else {
              this.generic = this.sharedLink.value.generic;
            }
          } else {
            this.statusText = '404';
          }
          if (this.generic) {
            let cont = 1;
            this.generic.node.notes.filter(note => {
              note.name = cont + ' - ' + note.name;
              cont++;
            });
          }
        });
      }
    });
  }

  setNodeNotes(category) {
    this.nodeNotesNames = [];
    Object.keys(this.generic).filter(key => {
      if (category ===  key) {
        if (this.generic[category].notes) {
          this.nodeNotes = this.generic[category].notes;
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

  getSelectedNodeNote(category, note, panel) {
    panel.expanded = false;
    this.selectedNote = note;
    this.selectedCategory = category;
  
    if (note.html_on) {
      this.htmlOn = note.html_on;
    } else {
      this.htmlOn = false;
    }

    this.setNodeNotes(category);
  }

}

import { Component, OnInit, HostListener, ViewChild, ElementRef} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { Services } from 'src/app/services/services.service';
import { MatAccordion, MatSnackBar } from '@angular/material';
import { AlertSnackBarComponent } from '../../alert-snack-bar/alert-snack-bar.component';

@Component({
  selector: 'app-art',
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.scss']
})

export class ArtComponent implements OnInit {
  user: any;

  artZone: any;
  selectedArt = '';

  canChangePosition = false;
  
  constructor(public afAuth: AngularFireAuth,
              private services: Services,
              private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    
    this.initArtZone();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key == 'S') {
      this.setArtZone();
    }

    if (this.selectedArt != '') {
      if (event.key == 'Escape') {
        this.closeOptions();
      }

      if (event.shiftKey && !event.ctrlKey) {
        if (event.key == 'S') {
          this.setArtZoneChar();
        }
        if (event.key == 'R') {
          this.removeArtZoneChar();
        }
        if (event.key == 'C') {
          this.copyArtZoneChar();
        }
      } else if (this.canChangePosition) {
        if (event.key == 'a') {
          this.setPositionX('-');
        }
        if (event.key == 'd') {
          this.setPositionX('+');
        }
        if (event.key == 'w') {
          this.setPositionY('-');
        }
        if (event.key == 's') {
          this.setPositionY('+');
        }
  
        if (event.key == 'ArrowUp') {
          this.artZone[this.selectedArt].options.speed++;
        }
        if (event.key == 'ArrowDown') {
          this.artZone[this.selectedArt].options.speed--;
        }
  
        if (event.key == 'ArrowRight') {
          this.artZone[this.selectedArt].options.z_index++;
        }
        if (event.key == 'ArrowLeft') {
          this.artZone[this.selectedArt].options.z_index--;
        }
      }
    }
  }

  initArtZone() {
    this.services.subscribeItemByKey('art_zone').subscribe(action => {
      this.artZone = action.payload.val();
    });
  }

  editOptions(keyIn) {
    this.selectedArt = keyIn;
    this.canChangePosition = true;
  }

  closeOptions() {
    this.selectedArt = '';
    this.canChangePosition = false;
  }

  setArtZoneChar() {
    const dateNow = this.formatDate(new Date(Date.now()));
    this.artZone[this.selectedArt].modified =  {
      user: {
        name: this.user.name,
        picture: this.user.picture,
        email: this.user.email
      },
      date: dateNow
    }
    this.services.setItemByKey(this.artZone[this.selectedArt], 'art_zone/' + this.selectedArt)
    .then(() => {
      this.openSnackBar(5, 'success', 'ArtZone Char Saved => ' + this.selectedArt);
      this.closeOptions();
    });
  }

  setArtZone() {
    const dateNow = this.formatDate(new Date(Date.now()));

    Object.keys(this.artZone).filter(key => {
      this.artZone[key].modified =  {
        user: {
          name: this.user.name,
          picture: this.user.picture,
          email: this.user.email
        },
        date: dateNow
      }
    });

    this.services.setItemByKey(this.artZone, 'art_zone')
    .then(() => {
      this.openSnackBar(5, 'success', 'ArtZone Saved');
      this.closeOptions();
    });
  }

  addArtZoneChar(name) {
    const dateNow = this.formatDate(new Date(Date.now()));
    let newName = name.value;

    if (newName != '') {
      const newChar = {
        author: {
          user: {
            name: this.user.name,
            picture: this.user.picture,
            email: this.user.email
          },
          date: dateNow
        },
        modified: {
          user: {
            name: this.user.name,
            picture: this.user.picture,
            email: this.user.email
          },
          date: dateNow
        },
        content: {
          text: '',
          image: 'assets/img/emoji.svg',
          edit: false // uid del usuario que esta editando, validar cambios al guardar, que no se borren
        },
        options: {
          width: '200px',
          height: 'auto',
          z_index: 10,
          background_color: '#673ab7',
          color: '#ffd740',
          opacity: 1,
          border_radius: '0',
          font_size: '18px',
          font_family: 'Roboto',
          transform: 'rotate3d(0,0,0,180deg)',
          transform_origin : 'bottom left',
          speed: 35,
          position: {
            x: 0,
            y: 0
          }
        }
      };
  
      let cont_name = 0;
      while (this.artZone[newName]) {
        newName += cont_name;
        cont_name++;
      }
  
      this.services.setItemByKey(newChar, 'art_zone/' + newName)
      .then(() => {
        this.openSnackBar(5, 'success', 'ArtZone Char Created => ' + newName);
        this.closeOptions();
        name.value = '';
      });
    } else {
      this.openSnackBar(5, 'error', 'ArtZone Char Name is required');
      this.closeOptions();
    }
    
  }

  removeArtZoneChar() {
    this.services.removeItemByKey('art_zone/' + this.selectedArt)
    .then(() => {
      this.openSnackBar(5, 'success', 'ArtZone Char Removed => ' + this.selectedArt);
      this.closeOptions();
    });
  }

  copyArtZoneChar() {
    const dateNow = this.formatDate(new Date(Date.now()));
    let cont_name = 0;
    let newName = this.selectedArt + '_cp';
    const tempChar = this.artZone[this.selectedArt];

    while (this.artZone[newName]) {
      newName += cont_name;
      cont_name++;
    }

    tempChar.options.position.x += 5;
    tempChar.options.position.y += 5;
    tempChar.modified =  {
      user: {
        name: this.user.name,
        picture: this.user.picture,
        email: this.user.email
      },
      date: dateNow
    }
  
    this.services.setItemByKey(tempChar, 'art_zone/' + newName)
    .then(() => {
      this.openSnackBar(5, 'success', 'ArtZone Char Copied => ' + newName);
      this.closeOptions();
    });
  }

  setPositionX(action) {
    this.artZone[this.selectedArt].options.position.x = parseInt(this.artZone[this.selectedArt].options.position.x);
    switch(action) {
      case '+':
        this.artZone[this.selectedArt].options.position.x +=
        parseInt(this.artZone[this.selectedArt].options.speed);
        break;
      case '-':
        this.artZone[this.selectedArt].options.position.x -=
        parseInt(this.artZone[this.selectedArt].options.speed);
        break;
    }
  }

  setPositionY(action) {
    this.artZone[this.selectedArt].options.position.y = parseInt(this.artZone[this.selectedArt].options.position.y);
    switch(action) {
      case '+':
        this.artZone[this.selectedArt].options.position.y +=
        parseInt(this.artZone[this.selectedArt].options.speed);
        break;
      case '-':
        this.artZone[this.selectedArt].options.position.y -=
        parseInt(this.artZone[this.selectedArt].options.speed);
        break;
    }
  }

  enablePositionChange(positionPanel) {
    this.canChangePosition = !positionPanel;
  }

  openSnackBar(duration, type, textIn) {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: duration * 1000,
      data: {class: type, text: textIn}
    });
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
}

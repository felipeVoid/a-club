import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { Services } from 'src/app/services/services.service';
import { MatAccordion, MatSnackBar } from '@angular/material';
import { AlertSnackBarComponent } from '../../alert-snack-bar/alert-snack-bar.component';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import html2canvas from 'html2canvas';

@Component({
  selector: 'app-art',
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.scss']
})

export class ArtComponent implements OnInit {
  @ViewChild('boundaryArt', { static: false }) boundaryArt: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;

  globalDataBase = '';
  user: any;
  imageLibrary = [];
  availableImages = ['jpg', 'jpeg', 'png', 'svg', 'ico', 'gif', 'tiff'];

  artZone: any;
  fullArtZone: any;
  artZoneKey = 'default';
  selectedArt = '';
  tempSelectedArt: any;

  posDetailSelected = true;
  activeItem = '';
  canChangePosition = false;
  
  last: MouseEvent;
  el: HTMLElement;

  mouseDown = false;
  ctrlDown = false;

  selectedWidth = 0;
  selectedHeight = 0;

  dotsList = [];

  isDev = false;
  
  constructor(public afAuth: AngularFireAuth,
              private services: Services,
              private _snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    if (this.user.uid == 'HHC4o74WxucfArmrFpwKeWN7SO13') {
      this.isDev = true;
    }
    this.globalDataBase = '/users/' + this.user.uid;
    
    this.getImageLibrary();
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEventUp(event: KeyboardEvent) {
    if (!event.ctrlKey) {
      this.ctrlDown = false;
    }
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventDown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      this.ctrlDown = true;
    }

    if (event.ctrlKey && event.shiftKey && event.key == 'S') {
      this.setArtZone();
    }

    if (event.key == 'Escape') {
      this.dotsList.filter(dot => {
        if (document.getElementById(dot)) {
          document.getElementById(dot).remove();
        }
      });
      this.dotsList = [];
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
      } else if (this.canChangePosition && (this.activeItem == '' || this.activeItem == 'none')) {
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
          this.artZone.chars[this.selectedArt].options.speed++;
        }
        if (event.key == 'ArrowDown') {
          this.artZone.chars[this.selectedArt].options.speed--;
        }
  
        if (event.key == 'ArrowRight') {
          this.artZone.chars[this.selectedArt].options.z_index++;
        }
        if (event.key == 'ArrowLeft') {
          this.artZone.chars[this.selectedArt].options.z_index--;
        }
      }
    }
  }

  @HostListener('mouseup')
  onMouseup() {
      this.mouseDown = false;
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
      if(this.mouseDown && this.selectedArt != '' && this.ctrlDown && (this.activeItem == '' || this.activeItem == 'none')) {
        let tempWidth = document.getElementById(this.selectedArt).offsetWidth;
        let tempHeight = document.getElementById(this.selectedArt).offsetHeight;

        tempWidth += (event.clientX - this.last.clientX);
        tempHeight += (event.clientY - this.last.clientY);

        this.artZone.chars[this.selectedArt].options.width = tempWidth;
        this.artZone.chars[this.selectedArt].options.height = tempHeight;
        this.last = event;
      } else if (this.mouseDown && this.selectedArt == '') {

        /*
          Drawing test: Check for better lineas
          const idDot = 'dot' + this.dotsList.length;
          const canvas = document.getElementById('art').getElementsByTagName('div')[0];
          const dot = document.createElement("p");
          dot.setAttribute('id',idDot);
          dot.setAttribute('style',
          'left: ' + event.clientX + 'px; top: ' + (event.clientY - 17) + 'px; z-index: 300; width: 2px; height: 2px; background-color: green; position: absolute;' 
          );
          canvas.appendChild(dot);
          this.dotsList.push(idDot);
        */
        
      } else if (this.mouseDown && !this.ctrlDown && (this.activeItem == '' || this.activeItem == 'none')) {
        let tempX = this.artZone.chars[this.selectedArt].options.position.x;
        let tempY = this.artZone.chars[this.selectedArt].options.position.y;

        tempX += (event.clientX - this.last.clientX);
        tempY += (event.clientY - this.last.clientY);

        this.artZone.chars[this.selectedArt].options.position.x = tempX;
        this.artZone.chars[this.selectedArt].options.position.y = tempY;
        this.last = event;
      }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event) {
      this.mouseDown = true;
      this.last = event;
  }

  getImageLibrary() {
    this.services.subscribeItemByKey(this.globalDataBase + '/node').subscribe(action => {
      this.initArtZone();

      if (action.payload.val()) {
        this.imageLibrary = [];
        const temp = action.payload.val();
        Object.keys(temp).filter(catKey => {
          if (temp[catKey].notes) {
            temp[catKey].notes.filter(note => {
              Object.keys(note.files).filter(fileKey => {
                if (note.files[fileKey].url && note.files[fileKey].url != 'none' && this.availableImages.indexOf(note.files[fileKey].type) > -1) {
                  this.imageLibrary.push(note.files[fileKey].url);
                }
              });
            });
          }
        });        
      }
    });
  }

  initArtZone() {
    this.route.queryParams
    .subscribe(params => {
      if (params.key) {
        this.artZoneKey = params.key;
        this.services.subscribeItemByKey('art_zone/' + params.key).subscribe(action => {
          
          this.fullArtZone = action.payload.val();
          
          if (this.fullArtZone.members) {
            if (this.user) {
              this.fullArtZone.members.filter(member => {
                if (this.user.uid == member.uid) {
                  this.artZone = action.payload.val();
                }
              });
            }
          } else {
            this.artZone = action.payload.val();
          }
          
          var lastScrollTop = 0;
      
          if (this.boundaryArt) {
            this.boundaryArt.nativeElement.addEventListener("scroll", function(){ // or window.addEventListener("scroll"....
              var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
              if (st > lastScrollTop){
                  // downscroll code
                  console.log('down');
              } else {
                  // upscroll code
                  console.log('up');
              }
              lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
            }, false);
          }
          
        });
      }
    });
  }

  editOptions(keyIn, active) {
    if (this.artZone.active) {
      if (this.artZone.active[this.user.uid]) {
        this.selectedArt = keyIn;

        this.canChangePosition = true;
        this.activeItem = active;
      } else {
        this.canChangePosition = false;
      }
    } else {
      this.selectedArt = keyIn;

      this.canChangePosition = true;
      this.activeItem = active;
      
      const activeUser = {
        [this.user.uid]: {
          name: this.user.name,
          picture: this.user.picture,
          email: this.user.email
        }
      };
      this.services.setItemByKey(activeUser, 'art_zone/' + this.artZoneKey + '/active');
    }

    /*
    Test function to undo changes
    List of changes(?) changes: []

    if (active == 'none') {
      this.tempSelectedArt = this.artZone.chars[this.selectedArt];
    }
    */
  }

  setImageFromLibrary(image) {
    this.artZone.chars[this.selectedArt].content.image = image
  }

  unDoChanges() {
    // Test function to undo changes
    // List of changes(?) changes: []
    this.artZone.chars[this.selectedArt] = this.tempSelectedArt;
    this.openSnackBar(5, 'warning', 'Undo => ' + this.selectedArt);
  }

  removeActiveUser() {
    this.services.removeItemByKey('art_zone/' + this.artZoneKey + '/active')
  }

  changePosDetail() {
    this.posDetailSelected = !this.posDetailSelected;
  }

  closeOptions() {
    if (this.artZone.active[this.user.uid]) {
      if (this.activeItem != '' && this.activeItem != 'none') {
        this.activeItem = '';
      } else if (this.activeItem == 'none' || this.activeItem == '') {
        this.closeOptionsDeep();
      }
    }
  }

  closeOptionsDeep() {
    this.selectedArt = '';
    this.canChangePosition = false;
    this.activeItem = '';
    this.artZone = this.fullArtZone;
    this.removeActiveUser();
  }

  setArtZoneChar() {
    const dateNow = this.formatDate(new Date(Date.now()));
    this.artZone.chars[this.selectedArt].modified =  {
      user: {
        name: this.user.name,
        picture: this.user.picture,
        email: this.user.email
      },
      date: dateNow
    }
    this.services.setItemByKey(this.artZone.chars[this.selectedArt], 'art_zone/' + this.artZoneKey + '/chars/' + this.selectedArt)
    .then(() => {
      this.openSnackBar(5, 'success', 'NodeChar Saved => ' + this.selectedArt);
      this.closeOptions();
    });
  }

  setArtZone() {
    const dateNow = this.formatDate(new Date(Date.now()));

    Object.keys(this.artZone.chars).filter(key => {
      this.artZone.chars[key].modified =  {
        user: {
          name: this.user.name,
          picture: this.user.picture,
          email: this.user.email
        },
        date: dateNow
      }
    });

    this.services.setItemByKey(this.artZone, 'art_zone/' + this.artZoneKey)
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
          width: 200,
          height: 200,
          z_index: 10,
          background_color: '#673ab7',
          color: '#ffd740',
          opacity: 1,
          border_radius: {
            type: 'px',
            radius: 0
          },
          font_size: '18px',
          font_family: 'Roboto',
          transform: {
            x: 0,
            y: 0,
            z: 0,
            deg: 180
          },
          transform_origin : 'bottom left',
          filter: {
            blur: 0,
            brightness: 100,
            contrast: 100,
            hue_rotate: 0,
            sepia: 0,
            saturate: 100,
            drop_shadow: {
              h_shadow: 0,
              v_shadow: 0,
              blur: 0,
              color: 'gray'
            },
            grayscale: 0,
            invert: 0,
          },
          speed: 35,
          position: {
            x: 200,
            y: 200
          }
        }
      };
  
      let cont_name = 0;
      while (this.artZone[newName]) {
        newName += cont_name;
        cont_name++;
      }
  
      this.services.setItemByKey(newChar, 'art_zone/' + this.artZoneKey + '/chars/' + newName)
      .then(() => {
        this.openSnackBar(5, 'success', 'NodeChar Created => ' + newName);
        this.closeOptions();
        name.value = '';
      });
    } else {
      this.openSnackBar(5, 'error', 'NodeChar Name is required');
      this.closeOptions();
    }
  }

  removeArtZoneChar() {
    this.services.removeItemByKey('art_zone/' + this.artZoneKey + '/chars/' + this.selectedArt)
    .then(() => {
      this.openSnackBar(5, 'success', 'NodeChar Removed => ' + this.selectedArt);
      this.closeOptions();
    });
  }

  copyArtZoneChar() {
    const dateNow = this.formatDate(new Date(Date.now()));
    let cont_name = 0;
    let newName = this.selectedArt + '_cp';
    const tempChar = this.artZone.chars[this.selectedArt];

    while (this.artZone.chars[newName]) {
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
  
    this.services.setItemByKey(tempChar, 'art_zone/' + this.artZoneKey + '/chars/' + newName)
    .then(() => {
      this.openSnackBar(5, 'success', 'NodeChar [' + this.selectedArt + '] Copied => ' + newName);
      this.closeOptions();
    });
  }

  setColorBg() {
    if (this.artZone.active) {
      if (this.artZone.active[this.user.uid]) {
        this.services.setItemByKey(this.artZone.general.background_color, 'art_zone/' + this.artZoneKey + '/general/background_color');
      }
    }
  }

  getRotationCss(transform): string {
    let finale = 'rotate3d(';
    finale += transform.x + ',';
    finale += transform.y + ',';
    finale += transform.z + ',';
    finale += transform.deg + 'deg)';
    return finale;
  }

  getFilterCss(filter): string {
    let finale = 'blur(' + filter.blur + 'px) ';
    finale += 'brightness(' + filter.brightness + '%) ';
    finale += 'contrast(' + filter.contrast + '%) ';
    finale += 'hue-rotate(' + filter.hue_rotate + 'deg) ';
    finale += 'sepia(' + filter.sepia + '%) ';
    finale += 'saturate(' + filter.saturate + '%) ';
    finale += 'drop-shadow(' + filter.drop_shadow.h_shadow + 'px ';
    finale += filter.drop_shadow.v_shadow + 'px ';
    finale += filter.drop_shadow.blur + 'px ';
    finale += filter.drop_shadow.color + ') ';
    finale += 'grayscale(' + filter.grayscale + '%) ';
    finale += 'invert(' + filter.invert + '%)';
    return finale;
  }

  setPositionX(action) {
    this.artZone.chars[this.selectedArt].options.position.x = parseInt(this.artZone.chars[this.selectedArt].options.position.x);
    switch(action) {
      case '+':
        this.artZone.chars[this.selectedArt].options.position.x +=
        parseInt(this.artZone.chars[this.selectedArt].options.speed);
        break;
      case '-':
        this.artZone.chars[this.selectedArt].options.position.x -=
        parseInt(this.artZone.chars[this.selectedArt].options.speed);
        break;
    }
  }

  setPositionY(action) {
    this.artZone.chars[this.selectedArt].options.position.y = parseInt(this.artZone.chars[this.selectedArt].options.position.y);
    switch(action) {
      case '+':
        this.artZone.chars[this.selectedArt].options.position.y +=
        parseInt(this.artZone.chars[this.selectedArt].options.speed);
        break;
      case '-':
        this.artZone.chars[this.selectedArt].options.position.y -=
        parseInt(this.artZone.chars[this.selectedArt].options.speed);
        break;
    }
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

  generateUid() {
    const ran = Math.floor((Math.random() + 4) * 3);
    const uidLink = this.user.uid.substring(ran, ran + 4) + Date.now() + this.user.uid.substring(7, ran - 4);
    return uidLink;
  }

  sanitizeStyle(style: string){
    return this.sanitizer.bypassSecurityTrustStyle(style);
  } 

  downloadImage(){
    const options = {
      allowTaint: true,
      logging: true,
      taintTest: false,
      useCORS: true
    }
    html2canvas(this.boundaryArt.nativeElement, options).then(canvas => {
      try {
        this.canvas.nativeElement.src = canvas.toDataURL();
        this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
        this.downloadLink.nativeElement.download = 'artzone.png';
        this.downloadLink.nativeElement.click();

        /*
          Add "crossorigin" to image to support CORS
          html2canvas(this.boundaryArt.nativeElement, { allowTaint : true })
        */

      } catch (e) {
        this.openSnackBar(5, 'error', 'ArtZone download fail (Testing...)');
        if (this.isDev) {
          console.log(e);
        }
      }
    });
  }
}

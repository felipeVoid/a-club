import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable()
export class Services {
  localData = {
    "users" : {
      "HHC4o74WxucfArmrFpwKeWN7SO13" : {
        "node" : {
          "A-Club" : {
            "created_date" : "12/03/2020, 18:12",
            "modified_date" : "12/03/2020, 18:12",
            "notes" : [ {
              "created_date" : "13/03/2020, 10:47",
              "description" : "wysiwyg",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 20:08",
              "name" : "HTML <-> Simple Text",
              "text" : "https://github.com/froala/angular-froala-wysiwyg\n\nAdd button to switch between HTML <-> Simple Text\n\n<mat-icon>view_headline</mat-icon>\n<mat-icon>view_quilt</mat-icon>"
            }, {
              "created_date" : "15/04/2020, 2:03",
              "description" : "Functions",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "15/04/2020, 2:28",
              "name" : "Request Sync",
              "text" : "Agregar boton para solicitar sincronizacion con los usuarios registrados en la plataforma\nAgregar icono para mostrar estado de \"sync\"\n\nagregar a cada usuario un campo \"sync\" para saber si aceptan o no, esto puede ser un listado de uid`s para saber qué notas se tienen que cargar.\n\ncrear sevicio para solicitar \"sync\"\n\nal desactivar \"sync\" cambiar estado de \"sync\" en los usuarios asociados\n\nal entrar un usuario registrar usuarios registrados en usuario admin\n\nvalidar que no se muestre el usuario que esta con la sesión activa"
            }, {
              "created_date" : "15/04/2020, 2:31",
              "description" : "Create",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "15/04/2020, 2:32",
              "name" : "Add NodeNotes tilte",
              "text" : "users to the right tilte to the left"
            } ]
          },
          "Angular" : {
            "created_date" : "13/03/2020, 23:07",
            "modified_date" : "13/03/2020, 23:07",
            "notes" : [ {
              "created_date" : "13/03/2020, 23:07",
              "description" : "Transform: FileIconPipe",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 23:50",
              "name" : "Pipes",
              "text" : "import { Pipe, PipeTransform } from '@angular/core';\n\n@Pipe({\n  name: 'fileIcon'\n})\n\nexport class FileIconPipe implements PipeTransform {\n  transform(type: any): string {\n    try {\n      switch(type.trim().toLowerCase()) {\n        case 'jpg':\n        case 'jpeg':\n        case 'png':\n          return 'photo_library';\n        case 'mp4':\n          return 'video_library';\n        case 'pdf':\n          return 'picture_as_pdf';\n        case 'mp3':\n          return 'library_music';\n        default:\n          return 'library_books';\n      }\n    } catch (e) {\n      return 'library_books';\n    }\n  }\n}\n"
            }, {
              "created_date" : "13/03/2020, 23:47",
              "description" : "Subscribe to key events",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 23:49",
              "name" : "HostListener",
              "text" : "import { HostListener } from '@angular/core';\n\n@HostListener('document:keydown', ['$event'])\nhandleKeyboardEvent(event: KeyboardEvent) {\n    if (event.key == 'a') {\n        console.log(event.key);\n    }\n}"
            }, {
              "created_date" : "13/03/2020, 23:55",
              "description" : "HTML",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 23:57",
              "name" : "Loop Object.keys",
              "text" : "<ng-container *ngFor=\"let not of notifications | keyvalue\">\n    {{not.key}} : {{not.value}}\n</ng-container>"
            }, {
              "created_date" : "14/04/2020, 22:28",
              "description" : "Firebase",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "14/04/2020, 22:30",
              "name" : "Functions",
              "text" : "https://firebase.google.com/docs/functions/database-events?hl=es\n\nhttps://firebase.google.com/docs/reference/functions/cloud_functions_.eventcontext?hl=es#.optional-auth\n\nhttps://firebase.google.com/docs/reference/functions/providers_database_.datasnapshot?hl=es"
            } ]
          },
          "Javascript" : {
            "created_date" : "13/03/2020, 22:57",
            "modified_date" : "13/03/2020, 22:57",
            "notes" : [ {
              "created_date" : "13/03/2020, 22:57",
              "description" : "Includes",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 23:02",
              "name" : "Array.includes()",
              "text" : "https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/includes\n\nconst array1 = [1, 2, 3];\n\nconsole.log(array1.includes(2));\n// expected output: true\n\nconst pets = ['cat', 'dog', 'bat'];\n\nconsole.log(pets.includes('cat'));\n// expected output: true\n\nconsole.log(pets.includes('at'));\n// expected output: false"
            }, {
              "created_date" : "13/03/2020, 22:59",
              "description" : "Reduce",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 23:02",
              "name" : "Array.reduce()",
              "text" : "https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/reduce\n\nconst array1 = [1, 2, 3, 4];\nconst reducer = (accumulator, currentValue) => accumulator + currentValue;\n\n// 1 + 2 + 3 + 4\nconsole.log(array1.reduce(reducer));\n// expected output: 10\n\n// 5 + 1 + 2 + 3 + 4\nconsole.log(array1.reduce(reducer, 5));\n// expected output: 15"
            }, {
              "created_date" : "13/03/2020, 23:03",
              "description" : "version 1.2",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "14/04/2020, 15:24",
              "name" : "Format Date",
              "text" : "function formatDate(date) {\n  const dd = String(date.getDate()).padStart(2, '0');\n  const MM = String(date.getMonth() + 1).padStart(2, '0');\n  const yy = date.getFullYear();\n  const mm = String(date.getMinutes()).padStart(2, '0');\n\n  date.setHours(date.getHours() - 4); // -4 to diff time zone\n  const hh = date.getHours();\n\n  return dd + '/' + MM + '/' + yy + ', ' + hh + ':' + mm;\n}"
            }, {
              "created_date" : "13/03/2020, 23:12",
              "description" : "version 1.0",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "13/03/2020, 23:51",
              "name" : "Filter Object.keys",
              "text" : "const input = document.getElementById('inputFilter');\n\nconst source = {\n item1: {name: 'Dog'},\n item2: {name: 'Cat'},\n item3: {name: 'Bird'}\n};\n\nlet allowed = ['item1', 'item3'];\n\nallowed = allowed.filter(data => data.trim().indexOf(input.value) > -1);\n  \nconst filtered = Object.keys(source)\n.filter(key => allowed.includes(key))\n.reduce((obj, key) => {\n obj[key] = source[key];\n return obj;\n}, {});"
            }, {
              "created_date" : "14/04/2020, 23:59",
              "description" : "Compare Objects",
              "files" : {
                "file1" : {
                  "url" : "none"
                },
                "file2" : {
                  "url" : "none"
                },
                "file3" : {
                  "url" : "none"
                },
                "file4" : {
                  "url" : "none"
                }
              },
              "modified_date" : "15/04/2020, 0:03",
              "name" : "DiffMapper",
              "text" : "deepDiffMapper = function () {\n    return {\n      VALUE_CREATED: 'created',\n      VALUE_UPDATED: 'updated',\n      VALUE_DELETED: 'deleted',\n      VALUE_UNCHANGED: 'unchanged',\n      map: function(obj1, obj2) {\n        if (this.isFunction(obj1) || this.isFunction(obj2)) {\n          throw 'Invalid argument. Function given, object expected.';\n        }\n        if (this.isValue(obj1) || this.isValue(obj2)) {\n          return {\n            type: this.compareValues(obj1, obj2),\n            data: obj1 === undefined ? obj2 : obj1\n          };\n        }\n  \n        var diff = {};\n        for (var key in obj1) {\n          if (this.isFunction(obj1[key])) {\n            continue;\n          }\n  \n          var value2 = undefined;\n          if (obj2[key] !== undefined) {\n            value2 = obj2[key];\n          }\n  \n          diff[key] = this.map(obj1[key], value2);\n        }\n        for (var key in obj2) {\n          if (this.isFunction(obj2[key]) || diff[key] !== undefined) {\n            continue;\n          }\n  \n          diff[key] = this.map(undefined, obj2[key]);\n        }\n  \n        return diff;\n  \n      },\n      compareValues: function (value1, value2) {\n        if (value1 === value2) {\n          return this.VALUE_UNCHANGED;\n        }\n        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {\n          return this.VALUE_UNCHANGED;\n        }\n        if (value1 === undefined) {\n          return this.VALUE_CREATED;\n        }\n        if (value2 === undefined) {\n          return this.VALUE_DELETED;\n        }\n        return this.VALUE_UPDATED;\n      },\n      isFunction: function (x) {\n        return Object.prototype.toString.call(x) === '[object Function]';\n      },\n      isArray: function (x) {\n        return Object.prototype.toString.call(x) === '[object Array]';\n      },\n      isDate: function (x) {\n        return Object.prototype.toString.call(x) === '[object Date]';\n      },\n      isObject: function (x) {\n        return Object.prototype.toString.call(x) === '[object Object]';\n      },\n      isValue: function (x) {\n        return !this.isObject(x) && !this.isArray(x);\n      }\n    }\n}();\n\nconst item1 = { a: 1, b: 2 };\nconst item2 = { a: 1, b: 3 };\nconst result = deepDiffMapper.map(item1, item2);"
            } ]
          }
        },
        "registered_users" : {
          "3vQnaTvhajbPvFM5EkkwBAunKAA3" : {
            "email" : "felipe.hernandez@rinno.la",
            "name" : "Felipe Hernandez",
            "picture" : "https://lh6.googleusercontent.com/-wBVg-6Aukpw/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rd4tIZ5QXrjl0YfxqJwKA7LCEoYuw/photo.jpg"
          },
          "BvO72O3qymOaF8p8NqxEO2J87U12" : {
            "email" : "kity.c.p.9@gmail.com",
            "name" : "Some BODYONCETOLDME",
            "picture" : "https://lh3.googleusercontent.com/-KJx_AF--DE8/AAAAAAAAAAI/AAAAAAAAAAA/AAKWJJNruc3Y-C9M8Uexlil2ojf7vD91HA/photo.jpg"
          }
        }
      }
    }
  };
  

  constructor(private http: HttpClient,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage) {
  }

  getItemByKey(key) {
    return this.db.database.ref(key);
  }

  setItemByKey(item, key): Promise<any> {
    return this.db.object(key).set(item);
  }

  updateItemByKey(item, key): Promise<any> {
    return this.db.object(key).update(item);
  }

  removeItemByKey(key): Promise<any> {
    return this.db.object(key).remove();
  }

  subscribeItemByKey(key): Observable<any> {
    return this.db.object(key).snapshotChanges();
  }
}
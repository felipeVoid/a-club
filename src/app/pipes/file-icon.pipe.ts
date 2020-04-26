import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon'
})

export class FileIconPipe implements PipeTransform {
  transform(type: any): string {
    try {
      switch(type.trim().toLowerCase()) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'svg':
        case 'ico':
        case 'gif':
        case 'tiff':
          return 'photo_library';
        case 'mp4':
        case 'avi':
        case '3gp':
        case 'mov':
          return 'video_library';
        case 'pdf':
          return 'picture_as_pdf';
        case 'mp3':
        case 'flac':
          return 'library_music';
        default:
          return 'library_books';
      }
    } catch (e) {
      return 'library_books';
    }
  }
}

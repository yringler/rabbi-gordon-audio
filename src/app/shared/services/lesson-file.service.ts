import { Injectable } from '@angular/core';
import { knownFolders, File } from 'tns-core-modules/file-system/file-system';

@Injectable({
  providedIn: 'root'
})
export class LessonFileService {
  get(): File {
    let file = knownFolders.currentApp().getFile("lessonJson");
    console.log("DEV: Path:" + file.path);
    return file;
  }
}

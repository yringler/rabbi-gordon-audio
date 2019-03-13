import { Injectable } from '@angular/core';
import { knownFolders, File } from 'tns-core-modules/file-system/file-system';

@Injectable({
  providedIn: 'root'
})
export class LessonFileService {
  get(): File {
    return knownFolders.documents().getFile("lessonJson");
  }
}

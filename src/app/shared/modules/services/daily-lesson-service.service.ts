import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { DailyStudyLibrary } from '../../models/dailyLessons';
import { Observable } from 'rxjs';
import Parser from 'rss-parser'

@Injectable({
  providedIn: 'root'
})
export class DailyLessonServiceService {
  private library:Observable<DailyStudyLibrary>;

  constructor(private httpClient:HttpClient) {
    this.library = new Observable<DailyStudyLibrary>();
  }

  getCurrentLessons():Observable<DailyStudyLibrary> {
    parser.
  }

  _fetchLessons():DailyStudyLibrary {
    
  }
}

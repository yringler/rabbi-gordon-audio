import { Component, OnInit, Input } from '@angular/core';
import { DailyLessonTrack } from '~/app/shared/models/dailyLessons';

@Component({
  selector: 'daily-lesson',
  templateUrl: './daily-lesson.component.html',
  styleUrls: ['./daily-lesson.component.css'],
  moduleId: module.id,
})
export class DailyLessonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() track:DailyLessonTrack;

  playFile() {
    console.log(`playing: ${this.track.days[0].source}`);
  }
}

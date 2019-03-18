import { Component, OnInit } from "@angular/core";
import { DailyLessonTrack } from "../shared/models/dailyLessons";
import { Observable } from "rxjs";
import { LessonMediaService } from "../shared/services/lesson-media.service";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    todaysLessons$: Observable<DailyLessonTrack[]>;

    constructor(private lessonMediaService: LessonMediaService) { }

	ngOnInit(): void {
		this.todaysLessons$ = this.lessonMediaService.getFilesForLessons({date: 0, duration: 3});
    }
}

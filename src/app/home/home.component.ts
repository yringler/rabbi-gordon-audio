import { Component, OnInit } from "@angular/core";
import { DailyLessonTrack } from "../shared/models/dailyLessons";
import { Observable } from "rxjs";
import { DailyLessonService } from "../shared/services/daily-lesson.service";
import { map, tap } from "rxjs/operators";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    todaysLessons$: Observable<DailyLessonTrack[]>;

    constructor(private lessonService: DailyLessonService) { }

	ngOnInit(): void {
		this.todaysLessons$ = this.lessonService.getLibrary().pipe(
			map(library => {
                return library.query({ date: 0 })
            })
        );
    }
}

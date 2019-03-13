import { Component, OnInit } from "@angular/core";
import { DailyLessonService } from "../shared/services/daily-lesson.service";
import { DailyLessonTrack } from "../shared/models/dailyLessons";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    todaysLessons$: Observable<DailyLessonTrack[]>;

    constructor(private dailyLessonService: DailyLessonService) { }

    ngOnInit(): void {
        this.todaysLessons$ = this.dailyLessonService.getLibrary().pipe(
            map(library => library.query({date: 0}))
        );
    }
}

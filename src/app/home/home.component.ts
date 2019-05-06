import { Component, OnInit, NgZone } from "@angular/core";
import { DailyLessonTrack } from "../shared/models/dailyLessons";
import { Observable } from "rxjs";
import { DailyLessonService } from "../shared/services/daily-lesson.service";
import { map } from "rxjs/operators";
import { RequestNetworkPermissionService } from "../shared/services/request-network-permission.service";

@Component({
	selector: "Home",
	moduleId: module.id,
	templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

	todaysLessons$: Observable<DailyLessonTrack[]>;

	constructor(
		private lessonService: DailyLessonService,
		private requestPermission: RequestNetworkPermissionService
	) { }

	ngOnInit(): void {
		this.todaysLessons$ = this.lessonService.getLibrary().pipe(
			map(library => {
				return library.query({ date: 0 })
			})
		);
	}

	updatePermissionSetting() {
		this.requestPermission.requestPermission();
	}
}

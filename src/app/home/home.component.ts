import { Component, OnInit, NgZone } from "@angular/core";
import { DailyLessonTrack } from "../shared/models/dailyLessons";
import { Observable } from "rxjs";
import { DailyLessonService } from "../shared/services/daily-lesson.service";
import { map } from "rxjs/operators";
import { RequestNetworkPermissionService } from "../shared/services/request-network-permission.service";
import { NetworkPermissionService } from "../shared/services/network-permission.service";
import { DownloadProgressService, DownloadProgress } from "../shared/services/download-progress.service";

@Component({
	selector: "Home",
	moduleId: module.id,
	templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

	todaysLessons$: Observable<DailyLessonTrack[]>;

	/** @description How far along an ongoing download is. */
	currentProgress: number;

	constructor(
		private lessonService: DailyLessonService,
		private networkPermission: NetworkPermissionService,
		private requestPermission: RequestNetworkPermissionService,
		private downloadProgress: DownloadProgressService,
		private zone: NgZone
	) { }

	ngOnInit(): void {
		this.todaysLessons$ = this.lessonService.getLibrary().pipe(
			map(library => {
				return library.query({ date: 0 })
			})
		);

		// If our app ever wants to download something but can't because we don't know if user
		// allows mobile data downloads, ask.
		this.networkPermission.getPermissionRequestCheck().subscribe(
			() => this.requestPermission.requestPermission()
		)

		this.downloadProgress.getProgress().subscribe(progress => {
			this.zone.run(() => this.currentProgress = progress.progress);
		})
	}

	updatePermissionSetting() {
		this.requestPermission.requestPermission();
	}
}

import { BackgroundFetch } from "nativescript-background-fetch";

import * as applicationModule from "tns-core-modules/application";
import { DailyLessonService } from "~/app/shared/services/daily-lesson.service";

function fetchData() {
	const dailyLessonService = new DailyLessonService;
	dailyLessonService.getLibrary().subscribe(
		library => {
			
		}
	)
}

export class FetchMedia {
	constructor() {
		if (applicationModule.android) {
			BackgroundFetch.configure({
				minimumFetchInterval: 60 * 6,
				stopOnTerminate: false,
				enableHeadless: true,

			}, fetchData, () => console.log('Error: background fetch not supported.'));
		}
	}
}
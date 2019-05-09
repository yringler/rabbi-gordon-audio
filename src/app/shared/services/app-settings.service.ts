import { Injectable } from '@angular/core';
import {hasKey, getNumber, setNumber} from "tns-core-modules/application-settings";
import { BehaviorSubject, Observable } from 'rxjs';

export enum StudyAppSettingTypes { playbackSpeed };

let settingIds = {
	playbackSpeed: "playbackSpeed"
};

@Injectable({
	providedIn: 'root'
})
export class AppSettingsService {
	playbackSpeed$: BehaviorSubject<number>;

	constructor() {
		const startingSpeed = hasKey(settingIds.playbackSpeed) ? getNumber(settingIds.playbackSpeed) : 1;
		this.playbackSpeed$ = new BehaviorSubject(startingSpeed);

		this.playbackSpeed$.subscribe(speed => {
			setNumber(settingIds.playbackSpeed, speed);
		});
	}

	getPlaybackSpeed$(): Observable<number> {
		return this.playbackSpeed$.asObservable();
	}

	getPlaybackSpeed(): number {
		return this.playbackSpeed$.value;
	}

	setSetting(setting: StudyAppSettingTypes, value: any) {
		switch (setting) {
			case StudyAppSettingTypes.playbackSpeed:
				this.playbackSpeed$.next(value);
				break;
			default:
				throw "Error: setting not found " + setting;
		}
	}
}

import { Component, OnInit } from '@angular/core';
import { MediaPlayerService } from '~/app/shared/services/media-player.service';
import { FormControl } from '@angular/forms';
import { debounceTime, map, distinct } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppSettingsService, StudyAppSettingTypes } from '~/app/shared/services/app-settings.service';

const maxSpeed = 2;

@Component({
	selector: 'playpack-speed',
	templateUrl: './playpack-speed.component.html',
	styleUrls: ['./playpack-speed.component.css'],
	moduleId: module.id
})
export class PlaypackSpeedComponent implements OnInit {
	/** @description The maximum value on the slider. The value is converted to a speed. */
	maxValue = 100;

	speed: FormControl;

	isPlaying: Observable<boolean>;

	constructor(
		private player: MediaPlayerService,
		private settings: AppSettingsService
	) {
		const startingSliderValue = this.getSliderValueFromSpeed(this.settings.getPlaybackSpeed());
		this.speed = new FormControl(startingSliderValue);
	}

	ngOnInit() {
		// When the slider value is changed.
		this.speed.valueChanges.pipe(
			// Map to speed.
			debounceTime(250),
			distinct(),
			map(speed => this.getSpeedFromSliderValue(speed))
		).subscribe(speed => {
			// Save the speed setting.
			this.settings.setSetting(StudyAppSettingTypes.playbackSpeed, speed);
		});

		this.isPlaying = this.player.isPlaying();
	}


	get currentSpeed(): string {
		return this.getSpeedFromSliderValue(this.speed.value).toPrecision(2);
	}

	get minValue(): number {
		return this.getSliderValueFromSpeed(0.5);
	}

	resetSpeed() {
		this.speed.setValue(this.getSliderValueFromSpeed(1));
	}

	private getSpeedFromSliderValue(sliderValue: number): number {
		// Return the fraction of the slider speed of the max speed.
		return sliderValue / this.maxValue * maxSpeed;
	}

	private getSliderValueFromSpeed(speed: number): number {
		// The ratio of slider units to speed is 100 slider units to 3 speed units.
		// Multiply the given speed by that ratio to get slider units.
		return speed * this.maxValue / maxSpeed;
	}
}

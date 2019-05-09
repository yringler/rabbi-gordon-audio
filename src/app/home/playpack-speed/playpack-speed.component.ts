import { Component, OnInit } from '@angular/core';
import { MediaPlayerService } from '~/app/shared/services/media-player.service';
import { FormControl } from '@angular/forms';
import { debounceTime, map, distinct } from 'rxjs/operators';
import { Observable } from 'rxjs';

const maxSpeed = 3;

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

	constructor(private player: MediaPlayerService) {
		this.speed = new FormControl(this.getSliderValueFromSpeed(1));
	}

	ngOnInit() {
		this.speed.valueChanges.pipe(
			debounceTime(250),
			distinct(),
			map(speed => this.getSpeedFromSliderValue(speed))
		).subscribe(speed => {
			console.log(speed);
			(<any>this.player).setSpeed(speed);
		});

		this.isPlaying = this.player.isPlaying();
	}

	get currentSpeed(): number {
		return this.getSpeedFromSliderValue(this.speed.value);
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

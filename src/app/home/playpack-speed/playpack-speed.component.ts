import { Component, OnInit } from '@angular/core';
import { MediaPlayerService } from '~/app/shared/services/media-player.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

const maxSpeed = 3;

@Component({
	selector: 'playpack-speed',
	templateUrl: './playpack-speed.component.html',
	styleUrls: ['./playpack-speed.component.css'],
	moduleId: module.id,
})
export class PlaypackSpeedComponent implements OnInit {
	/** @description The maximum value on the slider. The value is converted to a speed. */
	maxValue = 100;

	speed = new FormControl(this.maxValue / 2);

	currentSpeed: number;

	constructor(private player: MediaPlayerService) {
	}

	ngOnInit() {
		this.speed.valueChanges.pipe(
			debounceTime(250)
		).subscribe(speed => {
			this.currentSpeed = this.getSpeedFromSliderValue(speed);
			this.player.setSpeed(this.currentSpeed);
		})
	}

	private getSpeedFromSliderValue(sliderValue: number) {
		return sliderValue / this.maxValue * maxSpeed;
	}
}

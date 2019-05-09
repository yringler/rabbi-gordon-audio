import { Component, OnInit } from '@angular/core';
import { MediaPlayerService } from '~/app/shared/services/media-player.service';
import { FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { debounceTime, map, tap } from 'rxjs/operators';

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

	speedForm: FormGroup;
	speedSlider: AbstractControl;

	constructor(
		private player: MediaPlayerService,
		private formBuilder: FormBuilder
	) {
		this.speedForm = this.formBuilder.group({
			speed: [this.getSliderValueFromSpeed(1)]
		});

		this.speedSlider = this.speedForm.controls['speed'];
	}

	ngOnInit() {
		this.speedSlider.valueChanges.pipe(
			debounceTime(250),
			map(speed => this.getSpeedFromSliderValue(speed)),
			tap(speed => console.log(`speed: ${speed}`))
		).subscribe(speed => {
			(<any>this.player).setSpeed(speed);
		})
	}

	get currentSpeed(): number {
		return this.getSpeedFromSliderValue(this.speedSlider.value);
	}

	resetSpeed() {
		this.speedSlider.setValue(this.getSliderValueFromSpeed(1));
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

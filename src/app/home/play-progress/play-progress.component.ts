import { Component, OnInit, NgZone } from '@angular/core';
import { PlayerProgressService } from '~/app/shared/services/player-progress.service';
import { Slider} from "tns-core-modules/ui/slider"

@Component({
  selector: 'play-progress',
  templateUrl: './play-progress.component.html',
  styleUrls: ['./play-progress.component.css'],
  moduleId: module.id,
})
export class PlayProgressComponent implements OnInit {
  duration: number;
  current: number;

  constructor(
    private playerProgress: PlayerProgressService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    let self = this;
    this.playerProgress.getProgress().subscribe(
      progress => {
        self.zone.run(() => {
          self.duration = progress.duration;
          self.current = progress.current;
        });
      });
  }

  updateProgress(slider:Slider) {
    this.playerProgress.seek(slider.value);
  }
}

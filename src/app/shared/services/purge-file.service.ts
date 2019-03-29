import { Injectable } from '@angular/core';
import { AllowedFilesService } from './allowed-files.service';
import { Observable, from, of } from 'rxjs';
import { File, knownFolders } from 'tns-core-modules/file-system/file-system';
import { zip, tap, mergeMap, map, catchError } from 'rxjs/operators';
import { zip as staticZip } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class PurgeFileService {

	constructor(private allowedFiles: AllowedFilesService) { }

	purge(): Observable<string[]> {
		let deletedFilePaths = new Array<string>();

		return from(knownFolders.documents().getEntities()).pipe(
			zip(this.allowedFiles.getAllowedFiles()),
			// Delete files which aren't allowed.
			mergeMap((([allFiles, allowedFiles]) => {
				let deletingFiles = new Array<Observable<any>>();
				
				allFiles.forEach(file => {
					if (allowedFiles.indexOf(file.path) == -1) {
						deletingFiles.push(from(file.remove()));
						deletedFilePaths.push(file.path);
					}
				});

				return staticZip(...deletingFiles);
			})),
			map(() => deletedFilePaths),
			catchError(error => {
				console.log(`Purge error: ${error}`);
				return of([]);
			})
		)
	}
}

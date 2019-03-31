import { Injectable } from '@angular/core';
import { AllowedFilesService } from './allowed-files.service';
import { Observable, from, of } from 'rxjs';
import { knownFolders } from 'tns-core-modules/file-system/file-system';
import { mergeMap, map, catchError, tap } from 'rxjs/operators';
import { zip } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class PurgeFileService {

	constructor(private allowedFiles: AllowedFilesService) { }

	purge(): Observable<string[]> {
		let deletedFilePaths = new Array<string>();

		return zip(
			from(knownFolders.documents().getEntities()),
			this.allowedFiles.getAllowedFiles()
		).pipe(
			// Delete files which aren't allowed.
			mergeMap((([allFiles, allowedFiles]) => {
				let deletingFiles$ = new Array<Observable<any>>();
				
				allFiles.forEach(file => {
					if (allowedFiles.indexOf(file.path) == -1) {
						deletingFiles$.push(from(file.remove()));
						deletedFilePaths.push(file.path);
					}
				});

				return zip(...deletingFiles$);
			})),
			map(() => deletedFilePaths),
			catchError(error => {
				console.log(`Purge error: ${error}`);
				return of([]);
			})
		)
	}
}

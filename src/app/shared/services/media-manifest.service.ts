import { Injectable } from '@angular/core';
import { Observable, from, ReplaySubject, of, interval } from 'rxjs';
import { knownFolders } from 'tns-core-modules/file-system/file-system';
import { concatMap, map, catchError, first, debounce, } from 'rxjs/operators';

/**
 * @description An item which was fully downloaded.
 */
export class DownloadedItem {
	id: string;

	/**
	 * @description The url where this item was downloaded from.
	 */
	url: string;

	/**
	 * @description The full path, including file name and extension, where the file was downloaded to.
	 */
	path: string;
}

@Injectable({
	providedIn: 'root'
})
export class MediaManifestService {
	private downloadManifest: DownloadedItem[] = [];
	private downloadManifest$: ReplaySubject<DownloadedItem[]>;
	private manifestFile = knownFolders.documents().getFile("downloadManifest");

	constructor() {
		let self = this;
		this.downloadManifest$ = new ReplaySubject;

		// Whenever the manifest is updated, save changes to file.
		this.downloadManifest$.pipe(
			debounce(() => interval(250)),
			concatMap(manifest => {
				return self.manifestFile.writeText(JSON.stringify(manifest));
			})
		).subscribe()

		// Seed the manifest from saved contents of file.
		from(self.manifestFile.readText()).pipe(
			map(text => {
				return JSON.parse(text);
			}),
			// If the json parsing fails (e.g. if the file is empty)
			// return an empty array.
			catchError(() => of([]))
		).subscribe(manifest => {
			self.downloadManifest.push(...manifest);
			self.downloadManifest$.next(self.downloadManifest);
		});
	}

	/**
	 * @description Get the manifest of all files which were fully downloaded.
	 */
	getManifest(): Observable<DownloadedItem[]> {
		return this.downloadManifest$.pipe(first());
	}

	/**
	 * @description Returns requested item, or null if not found.
	 * @param id Id of the item to be returned.
	 */
	getItem(id: string): Observable<DownloadedItem> {
		return this.downloadManifest$.pipe(
			first(),
			map(items => items && items.find(item => item.id == id))
		)
	}

	/**
	 * Register an item as having been fully downloaded
	 * @param item The item which has been downloaded.
	 */
	registerItem(item: DownloadedItem) {
		this.downloadManifest.push(item);
		this.downloadManifest$.next(this.downloadManifest);
	}

	removeId(id: string) {
		let indexToRemove = this.downloadManifest.findIndex(item => item.id == id);

		if (indexToRemove > -1) {
			this.downloadManifest.splice(indexToRemove, 1);
			this.downloadManifest$.next(this.downloadManifest);
		}
	}

	removeWhere(shouldRemove: (item: DownloadedItem) => boolean) {
		this.downloadManifest = this.downloadManifest.filter(item => !shouldRemove(item));
		this.downloadManifest$.next(this.downloadManifest);
	}
}

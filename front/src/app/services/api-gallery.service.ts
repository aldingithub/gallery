import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiGalleryService {

  constructor(private readonly http: HttpClient) { }

  addToGallery(formData: FormData, album: string): Observable<void> {
    return this.http.post<void>(`/api/gallery/album/${album}/upload`, formData);
  }

  deleteImageFromGallry(imageName: string, album: string): Observable<void> {
    return this.http.delete<void>(`/api/gallery/album/${album}/${imageName}`);
  }

  getImagesFromGallery(album: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/gallery/album/${album}`);
  }

  createNewAlbum(name: string): Observable<void> {
    return this.http.post<void>(`/api/gallery/${name}`, null);
  }

  getAllAlbums(): Observable<string[]> {
    return this.http.get<string[]>('/api/gallery/albums');
  }
}

import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiGalleryService } from '../../services/api-gallery.service';
import { CreateAlbumComponent } from '../create-album/create-album.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  onDestroy = new Subject<void>();
  albums: string[];

  constructor(
    private readonly apiService: ApiGalleryService,
    private readonly toastr: ToastrService,
    private readonly modalService: NgbModal) { }

  ngOnInit(): void {
    this.apiService
      .getAllAlbums()
      .pipe(takeUntil(this.onDestroy))
      .subscribe(albums => {
        this.albums = albums.filter(album => album !== 'gallery');
      });
  }

  createNewAlbum(): void {
    const modalRef = this.modalService.open(CreateAlbumComponent);
    modalRef.result.then(
      (name: string) => { this.createAlbum(name) },
      () => { /*ignore on dismiss*/ }
    );
  }

  private createAlbum(name: string): void {
    this.apiService
      .createNewAlbum(name)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: () => {
          this.toastr.success(`Album ${name} uspešno kreiran!`);
          this.albums.push(name);
        },
        error: _err => this.toastr.error(`Album ${name} ni bil uspešno kreiran!`)
      })
  }
}

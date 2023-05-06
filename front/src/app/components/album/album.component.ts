import { Component, OnDestroy, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiGalleryService } from '../../services/api-gallery.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnDestroy {

  images: GalleryItem[] = [];
  imagePaths: string[] = [];
  onDestroyComp$ = new Subject<void>();
  filesList: FileList;
  albumName: string;

  constructor(
    private readonly apiService: ApiGalleryService,
    public readonly gallery: Gallery,
    private readonly modalService: NgbModal,
    private readonly activeRoute: ActivatedRoute,
    private readonly toastr: ToastrService,
    private readonly sanitizer: DomSanitizer) {
  }

  ngOnDestroy(): void {
    this.onDestroyComp$.next();
  }

  ngOnInit(): void {
    this.activeRoute.params
      .subscribe(params => {
        this.albumName = params["name"];
        this.fetchImages();
      })
  }

  onImageUpload(image: any): void {
    const element = image.currentTarget as HTMLInputElement;
    this.filesList = element.files;
    this.uploadImages();
  }

  uploadImages(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.modalText = 'Dodajanje slik';
    modalRef.componentInstance.infoMessage = 'Preden potrdite nalaganje slik, prosimo še enkrat izbrane slike preverite!';
    modalRef.result.then(
      () => {
        if (this.filesList) {
          Array.from(this.filesList).forEach(this.uploadImageToGallery, this);
        }
      },
      () => { /*ignore on dismiss*/ }
    );
  }

  onDeleteImage(item: GalleryItem): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.modalText = 'Brisanje slike';
    modalRef.componentInstance.infoMessage = 'Ali ste prepričani da želite izbrisati sliko?';
    modalRef.result.then(
      () => { this.deleteImage(item) },
      () => { /*ignore on dismiss*/ }
    );
  }

  private deleteImage(item: GalleryItem): void {
    const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, item.data.src);
    const name = url.split('/')
    this.apiService
      .deleteImageFromGallry(name[name.length - 1], this.albumName)
      .pipe(takeUntil(this.onDestroyComp$))
      .subscribe({
        next: () => {
          this.toastr.success('Slika uspešno odstranjena!');
          this.images = this.images.filter(item => this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, item.data.src) !== url);
        },
        error: _err => this.toastr.error('Slika ni bila uspešno odstranjena!')
      })
  }

  private uploadImageToGallery(image: File): void {
    const formData = new FormData();
    formData.append('image', image)
    this.apiService
      .addToGallery(formData, this.albumName)
      .pipe(takeUntil(this.onDestroyComp$))
      .subscribe({
        next: () => {
          this.toastr.success(`Nalaganje slike ${image.name} v galerijo uspešno`);
          Array.from(this.filesList).forEach(file => this.addToGallery(file.name));
        },
        error: _err => this.toastr.error(`Nalaganje slike ${image.name} v galerijo neuspešno`)
      })
  }

  private addToGallery(fileName: string): void {
    this.images.push(new ImageItem({
      src: <string>this.sanitizer.bypassSecurityTrustResourceUrl(`/api/gallery/album/${this.albumName}/${fileName}`),
      thumb: <string>this.sanitizer.bypassSecurityTrustResourceUrl(`/api/gallery/album/${this.albumName}/${fileName}`)
    }));
  }

  private fetchImages(): void {
    this.apiService
      .getImagesFromGallery(this.albumName)
      .pipe(takeUntil(this.onDestroyComp$))
      .subscribe(imageUrls => {
        imageUrls.forEach(this.addToGallery, this);
      })
  }
}

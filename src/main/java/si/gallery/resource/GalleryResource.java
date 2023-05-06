package si..gallery.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.springframework.http.MediaType.IMAGE_PNG;
import static si..gallery.util.Util.PATH_API_GALLERY;
import static si..gallery.util.Util.PATH_GALLERY_FOLDER;

@RestController
@RequestMapping(PATH_API_GALLERY)
public class GalleryResource {

    @PostMapping("/{albumName}")
    public void createAlbum(@PathVariable String albumName) {
        new File(PATH_GALLERY_FOLDER + albumName).mkdirs();
    }

    @PostMapping("/album/{albumName}/upload")
    public void uploadImage(@RequestParam("image") MultipartFile file, @PathVariable String albumName) throws IOException {
        Path fileNameAndPath = Paths.get(PATH_GALLERY_FOLDER + albumName, file.getOriginalFilename());
        Files.write(fileNameAndPath, file.getBytes());
    }

    @GetMapping("/albums")
    public List<String> getAllAlbums() throws IOException {
        try (Stream<Path> paths = Files.walk(Paths.get(PATH_GALLERY_FOLDER))) {
            return paths
                    .filter(Files::isDirectory)
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .collect(Collectors.toList());
        }
    }

    @GetMapping("/album/{albumName}")
    public List<String> getAllImages(@PathVariable String albumName) throws IOException {
        try (Stream<Path> paths = Files.walk(Paths.get(PATH_GALLERY_FOLDER + albumName))) {
            return paths
                    .filter(Files::isRegularFile)
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .collect(Collectors.toList());
        }
    }

    @GetMapping("/album/{albumName}/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName, @PathVariable String albumName) throws IOException {
        return ResponseEntity.ok()
                .header("filename", fileName)
                .header("content-disposition", "attachment; filename = " + fileName)
                .contentType(IMAGE_PNG)
                .body(Files.readAllBytes(Path.of(PATH_GALLERY_FOLDER + albumName + "/" + fileName)));
    }

    @DeleteMapping("/album/{albumName}/{fileName}")
    public void deleteImage(@PathVariable String fileName, @PathVariable String albumName) throws IOException {
        Files.deleteIfExists(Path.of(PATH_GALLERY_FOLDER + "/" + albumName + "/" + fileName));
    }
}
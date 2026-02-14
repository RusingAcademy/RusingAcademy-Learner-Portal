import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  Trash2,
  GripVertical,
  Plus,
  Image as ImageIcon,
  X,
  Loader2,
  ZoomIn,
} from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";

interface GalleryPhoto {
  id: number;
  photoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  altText: string | null;
  photoType: string | null;
  sortOrder: number | null;
}

interface CoachPhotoGalleryProps {
  coachId: number;
  isEditable?: boolean;
}

const photoTypeLabels = {
  en: {
    profile: "Profile Photo",
    workspace: "Workspace",
    certificate: "Certificate",
    session: "Teaching Session",
    event: "Event",
    other: "Other",
  },
  fr: {
    profile: "Photo de profil",
    workspace: "Espace de travail",
    certificate: "Certificat",
    session: "Séance d'enseignement",
    event: "Événement",
    other: "Autre",
  },
};

export default function CoachPhotoGallery({ coachId, isEditable = false }: CoachPhotoGalleryProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  // Using sonner toast
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [photoType, setPhotoType] = useState<string>("other");
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Fetch gallery photos
  const { data: photos = [], refetch } = trpc.coach.getGalleryPhotos.useQuery(
    { coachId },
    { enabled: !!coachId }
  );
  
  // Upload mutation
  const uploadMutation = trpc.coach.uploadGalleryPhoto.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Photo uploaded" : "Photo téléchargée", {
        description: isEn ? "Your photo has been added to the gallery." : "Votre photo a été ajoutée à la galerie.",
      });
      refetch();
      closeUploadDialog();
    },
    onError: (error) => {
      toast.error(isEn ? "Upload failed" : "Échec du téléchargement", {
        description: error.message,
      });
      setIsUploading(false);
    },
  });
  
  // Delete mutation
  const deleteMutation = trpc.coach.deleteGalleryPhoto.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Photo deleted" : "Photo supprimée", {
        description: isEn ? "The photo has been removed from your gallery." : "La photo a été retirée de votre galerie.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(isEn ? "Delete failed" : "Échec de la suppression", {
        description: error.message,
      });
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(isEn ? "Invalid file type" : "Type de fichier invalide", {
          description: isEn ? "Please select an image file." : "Veuillez sélectionner un fichier image.",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isEn ? "File too large" : "Fichier trop volumineux", {
          description: isEn ? "Maximum file size is 5MB." : "La taille maximale est de 5 Mo.",
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({
        coachId,
        fileData: base64,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        caption: caption || undefined,
        photoType: photoType as any,
      });
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleDelete = (photoId: number) => {
    if (confirm(isEn ? "Are you sure you want to delete this photo?" : "Êtes-vous sûr de vouloir supprimer cette photo?")) {
      deleteMutation.mutate({ photoId });
    }
  };
  
  const closeUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setPhotoType("other");
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  const content = {
    en: {
      title: "Photo Gallery",
      addPhoto: "Add Photo",
      uploadTitle: "Upload Photo",
      selectFile: "Select Image",
      caption: "Caption (optional)",
      captionPlaceholder: "Describe this photo...",
      photoType: "Photo Type",
      upload: "Upload",
      cancel: "Cancel",
      noPhotos: "No photos in gallery yet",
      addFirstPhoto: "Add your first photo to showcase your workspace and credentials.",
      maxPhotos: "Maximum 10 photos allowed",
      photosCount: "photos",
    },
    fr: {
      title: "Galerie de photos",
      addPhoto: "Ajouter une photo",
      uploadTitle: "Télécharger une photo",
      selectFile: "Sélectionner une image",
      caption: "Légende (optionnel)",
      captionPlaceholder: "Décrivez cette photo...",
      photoType: "Type de photo",
      upload: "Télécharger",
      cancel: "Annuler",
      noPhotos: "Aucune photo dans la galerie",
      addFirstPhoto: "Ajoutez votre première photo pour montrer votre espace de travail et vos certifications.",
      maxPhotos: "Maximum 10 photos autorisées",
      photosCount: "photos",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  const typeLabels = isEn ? photoTypeLabels.en : photoTypeLabels.fr;
  
  // Convert photos to lightbox format
  const lightboxImages = photos.map((photo: any) => ({
    src: photo.photoUrl,
    alt: photo.altText || photo.caption || "Gallery photo",
    title: photo.caption || undefined,
  }));
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {t.title}
          <span className="text-sm font-normal text-muted-foreground">
            ({photos.length}/10 {t.photosCount})
          </span>
        </CardTitle>
        {isEditable && photos.length < 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.addPhoto}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{t.noPhotos}</p>
            {isEditable && (
              <p className="text-sm mt-2">{t.addFirstPhoto}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* @ts-ignore - TS2345: auto-suppressed during TS cleanup */}
            {photos.map((photo: GalleryPhoto, index: number) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  loading="lazy" src={photo.thumbnailUrl || photo.photoUrl}
                  alt={photo.altText || photo.caption || "Gallery photo"}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => openLightbox(index)}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openLightbox(index)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {isEditable && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Photo type badge */}
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">
                    {typeLabels[photo.photoType as keyof typeof typeLabels] || photo.photoType}
                  </span>
                </div>
                
                {/* Caption */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isEditable && photos.length >= 10 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t.maxPhotos}
          </p>
        )}
      </CardContent>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.uploadTitle}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    loading="lazy" src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 flex flex-col items-center justify-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span>{t.selectFile}</span>
                </Button>
              )}
            </div>
            
            {/* Photo Type */}
            <div className="space-y-2">
              <Label>{t.photoType}</Label>
              <Select value={photoType} onValueChange={setPhotoType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Caption */}
            <div className="space-y-2">
              <Label>{t.caption}</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t.captionPlaceholder}
                maxLength={200}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeUploadDialog}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEn ? "Uploading..." : "Téléchargement..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t.upload}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Lightbox */}
      <PhotoLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </Card>
  );
}

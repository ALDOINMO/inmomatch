type ImageUploadProps = {
  propertyId: string;

  images: {
    id: string;
    publicUrl: string;
  }[];
};

export function ImageUpload({
  propertyId,
  images,
}: ImageUploadProps) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="font-semibold">
        Imágenes
      </h3>

      <p className="mt-2 text-sm text-muted">
        Property ID: {propertyId}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image) => (
          <img
            key={image.id}
            src={image.publicUrl}
            alt=""
            className="aspect-square rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}
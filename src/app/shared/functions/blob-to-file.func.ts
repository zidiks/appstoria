export function blobToFile(blob: Blob, name: string): File {
  return new File(
    [blob],
    name,
    {
      lastModified: new Date().getTime(),
      type: 'image/webp'
    }
  );
}

export function openPdf(blob: Blob) {
  const url = URL.createObjectURL(blob)
  window.open(url)
}

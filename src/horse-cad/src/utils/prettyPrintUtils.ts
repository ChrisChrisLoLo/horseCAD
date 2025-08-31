export function prettyPrintBytes(number_of_bytes: number): string {
  if (number_of_bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(number_of_bytes) / Math.log(k));
  return parseFloat((number_of_bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
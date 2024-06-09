import FileUploader from './uploaderClass.js';

export function initInstances() {
  const fileUploader = new FileUploader('drop_zone_1', 'fileUploader');
  window.fileUploader = fileUploader;
  const fileUploader2 = new FileUploader('drop_zone_2', 'fileUploader2');
  window.fileUploader2 = fileUploader2;
}

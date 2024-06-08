import FileUploader from './uploaderClass.js';

export function initInstances() {
  const fileUploader = new FileUploader(
    'drop_zone',
    'output',
    'fileUploader',
    'threed_output_string',
    '3D',
    'order-submit-button',
    'button-off',
    'error1'
  );

  const fileUploader2 = new FileUploader(
    'drop_zone_2',
    'output_2',
    'fileUploader2',
    'photos_output_string',
    'photo',
    'order-submit-button',
    'button-off',
    'error2'
  );
}

export default function getCurrentPage() {
  const currentPage = document
    .querySelector('meta[name="render-studio-app"]')
    ?.getAttribute('content');
  if (!currentPage) {
    console.error('Current page not found.');
    return;
  }
  console.log('Current page:', currentPage);
  return currentPage;
}

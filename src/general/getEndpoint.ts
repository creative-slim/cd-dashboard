export default function getEndpoint() {
  //?change this to switch between local and server
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8787'; // Use local endpoint for development
  }
  return 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

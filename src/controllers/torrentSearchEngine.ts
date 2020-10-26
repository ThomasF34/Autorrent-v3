import TorrentSearchApi from 'torrent-search-api';

TorrentSearchApi.enableProvider('1337x');

export async function searchMovies(torrent: string){
  return await TorrentSearchApi.search(torrent, 'Movies', 10);
}

export default TorrentSearchApi;



import { Transmission } from '@ctrl/transmission';

const client = new Transmission({
  baseUrl: 'http://openvpn-transmission:9091/',
});

export function downloadMagnet(magnet: string){
  return client.addTorrent(magnet);
}

export function getTorrentData(){
  return client.getAllData();
}

export default client;
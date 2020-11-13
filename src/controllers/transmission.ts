import { Transmission } from '@ctrl/transmission';

if(!process.env.TRANSMISSION_ADDR){
  throw new Error("Please provide a TRANSMISSION_ADDR env var");
}

const client = new Transmission({
  baseUrl: `http://${process.env.TRANSMISSION_ADDR}:9091/`,
});

export function downloadMagnet(magnet: string){
  return client.addMagnet(magnet, { 'download-dir': '/data/Films' });
}

export function getTorrentData(){
  return client.getAllData();
}

export default client;

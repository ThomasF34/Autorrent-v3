import express from 'express';
import { getMagnet } from 'torrent-search-api';
import { searchMovies } from './controllers/torrentSearchEngine';
import { downloadMagnet } from './controllers/transmission';

const server = express()
server.set('view engine', 'ejs');

const { PORT } = process.env
if(!PORT) {
  throw new Error('Please provide PORT env var');
}

server.get('/', (req, res) => res.render('index'));

server.get('/torrents', async (req, res) => {
  const torrent = req.query.torrent as string | undefined;
  if(!torrent) { return res.status(400).send("Please provide a movie name") }

  const torrents = await searchMovies(torrent);
  const torrentWithMagnets = await Promise.all(
    torrents.map(
      async torrent => {
        const mag = await getMagnet(torrent)
        torrent.magnet = mag;
        return torrent
      }
    )
  )
  res.render('torrent/all', { torrents: torrentWithMagnets });
});

server.get('/magnet', async (req, res) => {
  const magnet = req.query.magnet as string | undefined;
  if(!magnet) { return res.status(400).send("Please provide a magnet name") }

  try {
    const result = await downloadMagnet(magnet);
    if(result.result === "success"){ return res.render('torrent/success'); }
  } catch(err) {
    console.error(err);
    return res.send("Sorry there has been an error ! Please retry");
  }
})

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})
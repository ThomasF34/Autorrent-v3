import { Markup, Telegraf, BaseScene, Stage, Context } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import { getMagnet, getTorrentDetails } from 'torrent-search-api';
import TorrentSearch from './torrentSearchEngine';
import { downloadMagnet, getTorrentData } from './transmission';
const { enter, leave } = Stage;

if(!process.env.BOT_TOKEN) { throw new Error("Please provide a Bot Token") }

type BaseBotContext = Context & SceneContextMessageUpdate

const bot = new Telegraf<BaseBotContext>(process.env.BOT_TOKEN);
const session = new LocalSession<BaseBotContext>()

bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

const torrentResearch = new BaseScene<BaseBotContext>('torrent-search')
torrentResearch.enter((ctx) => ctx.reply('Searching for a movie ?'))
torrentResearch.on('message', async (ctx) => {
      const message = ctx.message?.text;
      if(!message) { return ctx.replyWithMarkdown('Sorry, you need to give me a movie name. For example `/movie Toy Story`') }

      const torrentRes = await TorrentSearch.search(message, 'Movies', 10);

      const torrents = (torrentRes as any[]).sort((torrent1, torrent2) => torrent2.seeds - torrent1.seeds)
      const stringified = torrents.map(({title, size, seeds}, index) => `${index} - \`${title}\` - ${seeds} - ${size}`)

      ctx.scene.state = { torrents };
      const result = stringified.join("\n");
      ctx.replyWithMarkdown(
        result,
        Markup.inlineKeyboard(
          torrents.map(
            (_tor, index) => Markup.callbackButton(
              `${index}`,
              index.toString()
            )
          )
        ).extra()
      );
    });

torrentResearch.action(/\d+/, async (ctx) => {
  await ctx.answerCbQuery();
  const torrents = (ctx.scene.state as any).torrents;
  const index = ctx.match?.[0];

  if(!index || !torrents) {
    await ctx.replyWithMarkdown("Sorry I don't know which torrent you're talking about. Ending your research ...")
    return leave();
  }

  const torrent = torrents[parseInt(index)];
  const magnet = await getMagnet(torrent);
  const res = await downloadMagnet(magnet);

  if(res.result === "success"){
    ctx.reply('✅ Download in progress ✅');
  } else {
    ctx.reply('❌ Download failed ❌');
  }
  return leave();
});


const stage = new Stage<BaseBotContext>([torrentResearch], { ttl: 10 })
bot.use(session.middleware())
bot.use(stage.middleware());

bot.command('movie', enter('torrent-search'));

bot.launch()
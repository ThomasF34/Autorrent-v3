"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transmission = void 0;
const fs_1 = require("fs");
const got_1 = __importDefault(require("got"));
const url_join_1 = require("@ctrl/url-join");
const shared_torrent_1 = require("@ctrl/shared-torrent");
const defaults = {
    baseUrl: 'http://localhost:9091/',
    path: '/transmission/rpc',
    username: '',
    password: '',
    timeout: 5000,
};
class Transmission {
    constructor(options = {}) {
        this.config = { ...defaults, ...options };
    }
    async getSession() {
        const res = await this.request('session-get');
        return res.body;
    }
    async setSession(args) {
        const res = await this.request('session-set', args);
        return res.body;
    }
    async queueTop(ids) {
        const res = await this.request('queue-move-top', { ids });
        return res.body;
    }
    async queueBottom(ids) {
        const res = await this.request('queue-move-bottom', { ids });
        return res.body;
    }
    async queueUp(ids) {
        const res = await this.request('queue-move-up', { ids });
        return res.body;
    }
    async queueDown(ids) {
        const res = await this.request('queue-move-down', { ids });
        return res.body;
    }
    async freeSpace(path = '/downloads/complete') {
        const res = await this.request('free-space', { path });
        return res.body;
    }
    async pauseTorrent(ids) {
        const res = await this.request('torrent-stop', { ids });
        return res.body;
    }
    async resumeTorrent(ids) {
        const res = await this.request('torrent-start', { ids });
        return res.body;
    }
    async verifyTorrent(ids) {
        const res = await this.request('torrent-verify', { ids });
        return res.body;
    }
    /**
     * ask tracker for more peers
     */
    async reannounceTorrent(ids) {
        const res = await this.request('torrent-reannounce', { ids });
        return res.body;
    }
    async moveTorrent(ids, location) {
        const res = await this.request('torrent-set-location', {
            ids,
            move: true,
            location,
        });
        return res.body;
    }
    /**
     * Torrent Mutators
     */
    async setTorrent(ids, options = {}) {
        options.ids = ids;
        const res = await this.request('torrent-set', options);
        return res.body;
    }
    /**
     * Renaming a Torrent's Path
     */
    async renamePath(ids, options = {}) {
        options.ids = ids;
        const res = await this.request('torrent-rename-path', options);
        return res.body;
    }
    /**
     * Removing a Torrent
     */
    async removeTorrent(ids, removeData = true) {
        const res = await this.request('torrent-remove', {
            ids,
            'delete-local-data': removeData,
        });
        return res.body;
    }
    /**
     * Adding a torrent
     * @param torrent a string of file path or contents of the file as base64 string
     * @param magnetId the magnet id hash
     */
    async addTorrent(torrent, options = {}) {
        const args = {
            'download-dir': '/downloads',
            paused: false,
            ...options,
        };
        if (options.filename) {
            args.filename = options.filename;
        }
        if (torrent) {
            if (typeof torrent === 'string') {
                args.metainfo = fs_1.existsSync(torrent)
                    ? Buffer.from(fs_1.readFileSync(torrent)).toString('base64')
                    : Buffer.from(torrent, 'base64').toString('base64');
            }
            else {
                args.metainfo = torrent.toString('base64');
            }
        }
        const res = await this.request('torrent-add', args);
        return res.body;
    }
    async normalizedAddTorrent(torrent, options = {}) {
        const torrentOptions = {};
        if (options.startPaused) {
            torrentOptions.paused = true;
        }
        if (torrent && !Buffer.isBuffer(torrent)) {
            torrent = Buffer.from(torrent);
        }
        const res = await this.addTorrent(torrent, torrentOptions);
        const torrentId = res.arguments['torrent-added'].id;
        if (options.label) {
            const res = await this.setTorrent(torrentId, { labels: [options.label] });
            console.log(res);
        }
        return this.getTorrent(torrentId);
    }
    async getTorrent(id) {
        const result = await this.listTorrents(id);
        if (!result.arguments.torrents || result.arguments.torrents.length === 0) {
            throw new Error('Torrent not found');
        }
        return this._normalizeTorrentData(result.arguments.torrents[0]);
    }
    async getAllData() {
        const listTorrents = await this.listTorrents();
        const torrents = listTorrents.arguments.torrents.map(n => this._normalizeTorrentData(n));
        const labels = [];
        for (const torrent of torrents) {
            if (!torrent.label) {
                continue;
            }
            const existing = labels.find(n => n.id === torrent.label);
            if (existing) {
                existing.count += 1;
                continue;
            }
            labels.push({ id: torrent.label, name: torrent.label, count: 1 });
        }
        const results = {
            torrents,
            labels,
        };
        return results;
    }
    async listTorrents(ids, additionalFields = []) {
        const fields = [
            'id',
            'addedDate',
            'creator',
            'doneDate',
            'comment',
            'name',
            'totalSize',
            'error',
            'errorString',
            'eta',
            'etaIdle',
            'isFinished',
            'isStalled',
            'isPrivate',
            'files',
            'fileStats',
            'hashString',
            'leftUntilDone',
            'metadataPercentComplete',
            'peers',
            'peersFrom',
            'peersConnected',
            'peersGettingFromUs',
            'peersSendingToUs',
            'percentDone',
            'queuePosition',
            'rateDownload',
            'rateUpload',
            'secondsDownloading',
            'secondsSeeding',
            'recheckProgress',
            'seedRatioMode',
            'seedRatioLimit',
            'seedIdleLimit',
            'sizeWhenDone',
            'status',
            'trackers',
            'downloadDir',
            'downloadLimit',
            'downloadLimited',
            'uploadedEver',
            'downloadedEver',
            'corruptEver',
            'uploadRatio',
            'webseedsSendingToUs',
            'haveUnchecked',
            'haveValid',
            'honorsSessionLimits',
            'manualAnnounceTime',
            'activityDate',
            'desiredAvailable',
            'labels',
            'magnetLink',
            'maxConnectedPeers',
            'peer-limit',
            'priorities',
            'wanted',
            'webseeds',
            ...additionalFields,
        ];
        const args = { fields };
        if (ids) {
            args.ids = ids;
        }
        const res = await this.request('torrent-get', args);
        return res.body;
    }
    // async getTorrent(id: TorrentIds): Promise<NormalizedTorrent> {
    //   const torrent: any = {};
    //   return torrent;
    // }
    async request(method, args = {}) {
        var _a, _b;
        if (!this.sessionId && method !== 'session-get') {
            await this.getSession();
        }
        const headers = {
            'X-Transmission-Session-Id': this.sessionId,
        };
        if (this.config.username || this.config.password) {
            const str = `${(_a = this.config.username) !== null && _a !== void 0 ? _a : ''}:${(_b = this.config.password) !== null && _b !== void 0 ? _b : ''}`;
            headers.Authorization = 'Basic ' + str;
        }
        const url = url_join_1.urlJoin(this.config.baseUrl, this.config.path);
        try {
            const res = await got_1.default.post(url, {
                json: {
                    method,
                    arguments: args,
                },
                headers,
                retry: 0,
                // allow proxy agent
                agent: this.config.agent,
                timeout: this.config.timeout,
                responseType: 'json',
            });
            return res;
        }
        catch (error) {
            if (error.response && error.response.statusCode === 409) {
                this.sessionId = error.response.headers['x-transmission-session-id'];
                // eslint-disable-next-line no-return-await
                return await this.request(method, args);
            }
            throw error;
        }
    }
    _normalizeTorrentData(torrent) {
        var _a;
        const dateAdded = new Date(torrent.addedDate * 1000).toISOString();
        const dateCompleted = new Date(torrent.doneDate * 1000).toISOString();
        // normalize state to enum
        // https://github.com/transmission/transmission/blob/c11f2870fd18ff781ca06ce84b6d43541f3293dd/web/javascript/torrent.js#L18
        let state = shared_torrent_1.TorrentState.unknown;
        if (torrent.status === 6) {
            state = shared_torrent_1.TorrentState.seeding;
        }
        else if (torrent.status === 4) {
            state = shared_torrent_1.TorrentState.downloading;
        }
        else if (torrent.status === 0) {
            state = shared_torrent_1.TorrentState.paused;
        }
        else if (torrent.status === 2) {
            state = shared_torrent_1.TorrentState.checking;
        }
        else if (torrent.status === 3 || torrent.status === 5) {
            state = shared_torrent_1.TorrentState.queued;
        }
        const result = {
            id: torrent.id,
            name: torrent.name,
            state,
            isCompleted: torrent.leftUntilDone < 1,
            stateMessage: '',
            progress: torrent.percentDone,
            ratio: torrent.uploadRatio,
            dateAdded,
            dateCompleted,
            label: ((_a = torrent.labels) === null || _a === void 0 ? void 0 : _a.length) ? torrent.labels[0] : undefined,
            savePath: torrent.downloadDir,
            uploadSpeed: torrent.rateUpload,
            downloadSpeed: torrent.rateDownload,
            eta: torrent.eta,
            queuePosition: torrent.queuePosition,
            connectedPeers: torrent.peersSendingToUs,
            connectedSeeds: torrent.peersGettingFromUs,
            totalPeers: torrent.peersConnected,
            totalSeeds: torrent.peersConnected,
            totalSelected: torrent.sizeWhenDone,
            totalSize: torrent.totalSize,
            totalUploaded: torrent.uploadedEver,
            totalDownloaded: torrent.downloadedEver,
        };
        return result;
    }
}
exports.Transmission = Transmission;
//# sourceMappingURL=index.js.map
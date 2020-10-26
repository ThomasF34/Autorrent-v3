/// <reference types="node" />
import { Response } from 'got';
import { AddTorrentOptions as NormalizedAddTorrentOptions, AllClientData, NormalizedTorrent, TorrentClient, TorrentSettings } from '@ctrl/shared-torrent';
import { AddTorrentOptions, AddTorrentResponse, DefaultResponse, FreeSpaceResponse, GetTorrentRepsonse, RenamePathOptions, SessionArguments, SessionResponse, SetTorrentOptions, TorrentIds } from './types';
export declare class Transmission implements TorrentClient {
    config: TorrentSettings;
    sessionId?: string;
    constructor(options?: Partial<TorrentSettings>);
    getSession(): Promise<SessionResponse>;
    setSession(args: Partial<SessionArguments>): Promise<SessionResponse>;
    queueTop(ids: TorrentIds): Promise<DefaultResponse>;
    queueBottom(ids: TorrentIds): Promise<DefaultResponse>;
    queueUp(ids: TorrentIds): Promise<DefaultResponse>;
    queueDown(ids: TorrentIds): Promise<DefaultResponse>;
    freeSpace(path?: string): Promise<FreeSpaceResponse>;
    pauseTorrent(ids: TorrentIds): Promise<DefaultResponse>;
    resumeTorrent(ids: TorrentIds): Promise<DefaultResponse>;
    verifyTorrent(ids: TorrentIds): Promise<DefaultResponse>;
    /**
     * ask tracker for more peers
     */
    reannounceTorrent(ids: TorrentIds): Promise<DefaultResponse>;
    moveTorrent(ids: TorrentIds, location: string): Promise<DefaultResponse>;
    /**
     * Torrent Mutators
     */
    setTorrent(ids: TorrentIds, options?: Partial<SetTorrentOptions>): Promise<DefaultResponse>;
    /**
     * Renaming a Torrent's Path
     */
    renamePath(ids: TorrentIds, options?: Partial<RenamePathOptions>): Promise<DefaultResponse>;
    /**
     * Removing a Torrent
     */
    removeTorrent(ids: TorrentIds, removeData?: boolean): Promise<AddTorrentResponse>;
    /**
     * Adding a torrent
     * @param torrent a string of file path or contents of the file as base64 string
     * @param magnetId the magnet id hash
     */
    addTorrent(torrent?: string | Buffer, options?: Partial<AddTorrentOptions>): Promise<AddTorrentResponse>;
    normalizedAddTorrent(torrent?: string | Buffer, options?: Partial<NormalizedAddTorrentOptions>): Promise<NormalizedTorrent>;
    getTorrent(id: TorrentIds): Promise<NormalizedTorrent>;
    getAllData(): Promise<AllClientData>;
    listTorrents(ids?: TorrentIds, additionalFields?: string[]): Promise<GetTorrentRepsonse>;
    request<T extends any>(method: string, args?: any): Promise<Response<T>>;
    private _normalizeTorrentData;
}

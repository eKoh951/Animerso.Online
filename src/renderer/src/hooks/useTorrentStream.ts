import { useEffect, useState } from 'react';

interface TorrentProgressData {
  numPeers: number;
  downloaded: number;
  total: number;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  remaining: string;
}

interface TorrentFileStartData {
  mimeType: string;
  url: string;
}

const useTorrentStream = (torrentId: string) => {
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [numPeers, setNumPeers] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    window.api.addTorrent(torrentId);

    const handleTorrentProgress = (event: Electron.IpcRendererEvent, data: TorrentProgressData) => {
      setProgress(data.progress * 100);
      setDownloadSpeed(data.downloadSpeed);
      setUploadSpeed(data.uploadSpeed);
      setNumPeers(data.numPeers);
      setDownloaded(data.downloaded);
      setTotal(data.total);
      setRemaining(data.remaining);
    };

    const handleTorrentFileStart = (event: Electron.IpcRendererEvent, data: TorrentFileStartData) => {
      setVideoUrl(data.url);
    };

    window.api.on('torrent-progress', handleTorrentProgress);
    window.api.on('torrent-file-start', handleTorrentFileStart);

    return () => {
      window.api.removeListener('torrent-progress', handleTorrentProgress);
      window.api.removeListener('torrent-file-start', handleTorrentFileStart);
    };
  }, [torrentId]);

  return { progress, downloadSpeed, uploadSpeed, numPeers, downloaded, total, remaining, videoUrl };
};

export default useTorrentStream;

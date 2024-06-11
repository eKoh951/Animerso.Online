import { useState, useEffect } from 'react';
import WebTorrent from 'webtorrent';
import moment from 'moment';

function prettyBytes(num: number) {
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const neg = num < 0;
  if (neg) num = -num;
  if (num < 1) return (neg ? '-' : '') + num + ' B';
  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  const unit = units[exponent];
  num = Number((num / Math.pow(1000, exponent)).toFixed(2));
  return (neg ? '-' : '') + num + ' ' + unit;
}

export function useTorrentStream(torrentId: string) {
  const [torrent, setTorrent] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 B');
  const [uploadSpeed, setUploadSpeed] = useState('0 B');
  const [numPeers, setNumPeers] = useState(0);
  const [downloaded, setDownloaded] = useState('0 B');
  const [total, setTotal] = useState('0 B');
  const [remaining, setRemaining] = useState('');
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let client: WebTorrent.Instance | null = null;

    async function startDownload() {
      client = new WebTorrent();

      try {
        download();
      } catch (error) {
        console.error('Error starting download:', error);
      }
    }

    function download() {
      if (!isMounted || !client) return;

      client.add(torrentId, async (torrent: any) => {
        setTorrent(torrent);

        const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'));

        if (file) {
          file.streamTo(document.querySelector('#output'));
        }

        torrent.on('done', onDone);
        setInterval(onProgress, 500);
        onProgress();

        function onProgress() {
          setNumPeers(torrent.numPeers);
          setProgress(Math.round(torrent.progress * 100 * 100) / 100);
          setDownloaded(prettyBytes(torrent.downloaded));
          setTotal(prettyBytes(torrent.length));
          setDownloadSpeed(prettyBytes(torrent.downloadSpeed));
          setUploadSpeed(prettyBytes(torrent.uploadSpeed));

          let remaining;
          if (torrent.done) {
            remaining = 'Done.';
          } else {
            remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize();
            remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.';
          }
          setRemaining(remaining);
        }

        async function onDone() {
          const videoBlob = await file.blob();
          const videoUrl = URL.createObjectURL(videoBlob);
          const videoElement = document.querySelector('#output') as HTMLVideoElement;

          if (videoElement) {
            videoElement.src = videoUrl;
            videoElement.play();
          }

          onProgress();
        }
      });
    }

    startDownload();

    return () => {
      setIsMounted(false);
      client?.destroy();
    };
  }, [torrentId]);

  return {
    torrent,
    progress,
    downloadSpeed,
    uploadSpeed,
    numPeers,
    downloaded,
    total,
    remaining
  };
}

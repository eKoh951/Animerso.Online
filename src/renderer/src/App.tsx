import React, { useEffect, useRef } from 'react';
import useTorrentStream from './hooks/useTorrentStream';

function App(): JSX.Element {
  const torrentId = 'https://webtorrent.io/torrents/sintel.torrent';

  const {
    progress,
    downloadSpeed,
    uploadSpeed,
    numPeers,
    downloaded,
    total,
    remaining,
    videoUrl
  } = useTorrentStream(torrentId);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
    }
  }, [videoUrl]);

  return (
    <div className="app">
      <div>
        <div id="progressBar" style={{ width: `${progress}%` }}></div>
        <video
          ref={videoRef}
          controls
          autoPlay
          style={{ width: '100%', maxWidth: '800px' }}
        />
      </div>
      <div id="status">
        <div>
          {/* <span>{torrent?.done ? 'Seeding' : 'Downloading'}</span>
          <span>{torrent?.done ? ' to ' : ' from '}</span> */}
          <code>{numPeers} peers</code>
        </div>
        <div>
          <code>
            <a style={{ color: '#fff' }} id="torrentLink" href={torrentId}>
              {torrentId}
            </a>
          </code>
        </div>
        <div>
          <code>{downloaded || '0 B'}</code> of <code>{total || '0 B'}</code> —
          <span>{remaining || 'Calculating...'}</span>
          <br />↓<code>{downloadSpeed || '0 B/s'}</code> / ↑
          <code>{uploadSpeed || '0 B/s'}</code>
        </div>
      </div>
    </div>
  );
}

export default React.memo(App);

function humanizeDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

async function handleAddTorrent(torrentId) {
  console.log('handleAddTorrent called with torrentId:', torrentId);
  const { default: WebTorrent } = await import('webtorrent');
  const client = new WebTorrent();

  client.add(torrentId, (torrent) => {
    console.log('Torrent added:', torrent.infoHash);
    console.log('Torrent name:', torrent.name);

    const file = torrent.files.find((file) => 
      file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.hevc')
    );

    if (file) {
      console.log('Video file found:', file.name);

      file.getBlobURL((err, url) => {
        if (err) {
          console.error('Failed to create Blob URL', err);
          process.parentPort?.postMessage({ type: 'torrent-error', data: { message: 'Failed to create Blob URL' } });
          return;
        }

        const mimeType = getMimeType(file.name);
        console.log('Starting to stream file. MIME type:', mimeType);

        process.parentPort?.postMessage({
          type: 'torrent-file-start',
          data: { mimeType, url }
        });

        torrent.on('done', () => {
          console.log('Torrent download completed');
          process.parentPort?.postMessage({ type: 'torrent-done' });
        });

        setInterval(() => {
          process.parentPort?.postMessage({
            type: 'torrent-progress',
            data: {
              numPeers: torrent.numPeers,
              downloaded: torrent.downloaded,
              total: torrent.length,
              progress: torrent.progress,
              downloadSpeed: torrent.downloadSpeed,
              uploadSpeed: torrent.uploadSpeed,
              remaining: torrent.done
                ? 'Done.'
                : humanizeDuration(torrent.timeRemaining)
            }
          });
        }, 1000);
      });
    } else {
      console.error('No suitable video file found in the torrent');
    }
  });
}


function getMimeType(fileName) {
  if (fileName.endsWith('.mp4')) return 'video/mp4';
  if (fileName.endsWith('.mkv')) return 'video/webm'; // Update this line
  if (fileName.endsWith('.hevc')) return 'video/hevc';
  return 'application/octet-stream';
}

process.parentPort?.on('message', (message) => {
  console.log('Received message in webtorrent process:', message);
  if (message.data.action === 'add-torrent') {
    handleAddTorrent(message.data.torrentId);
  }
});

console.log('webtorrent.js loaded and ready');

// src/webtorrent-process/index.ts
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
  const { default: WebTorrent } = await import('webtorrent');
  const client = new WebTorrent();

  client.add(torrentId, async (torrent) => {
    const file = torrent.files.find((file) => file.name.endsWith('.mp4'));

    if (file) {
      const stream = file.createReadStream();
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      process.parentPort?.postMessage({
        type: 'torrent-file',
        data: {
          buffer: buffer.toString('base64'),
        },
      });
    }

    torrent.on('done', () => {
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
            : humanizeDuration(torrent.timeRemaining),
        },
      });
    }, 500);
  });
}

process.parentPort?.on('message', (message) => {
  if (message.data.action === 'add-torrent') {
    handleAddTorrent(message.data.torrentId);
  }
});

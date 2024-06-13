import { useState, useEffect } from 'react'

function useTorrentStream(torrentId: string) {
  const [torrent, setTorrent] = useState<any>(null)
  const [progress, setProgress] = useState<number>(0)
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 b/s')
  const [uploadSpeed, setUploadSpeed] = useState<string>('0 b/s')
  const [numPeers, setNumPeers] = useState<number>(0)
  const [downloaded, setDownloaded] = useState<string>('0 B')
  const [total, setTotal] = useState<string>('0 B')
  const [remaining, setRemaining] = useState<string>('Remaining')

  useEffect(() => {
    window.api.addTorrent(torrentId)

    const handleTorrentProgress = (event: any, data: any) => {
      const {
        numPeers,
        downloaded,
        total,
        progress,
        downloadSpeed,
        uploadSpeed,
        remaining
      } = data

      setNumPeers(numPeers)
      setDownloaded(prettyBytes(downloaded))
      setTotal(prettyBytes(total))
      setProgress(Math.round(progress * 100 * 100) / 100)
      setDownloadSpeed(prettyBytes(downloadSpeed) + '/s')
      setUploadSpeed(prettyBytes(uploadSpeed) + '/s')
      setRemaining(remaining)
    }

    const handleTorrentDone = () => {
      document.body.className += ' is-seed'
    }

    const handleTorrentFile = (event: any, data: any) => {
      const { buffer } = data
      const byteCharacters = atob(buffer)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)

      const player = document.querySelector<HTMLVideoElement>('#output')
      if (player) {
        player.src = url
        player.play()
      }
    }

    const handleTorrentError = (event: any, data: any) => {
      console.error('Torrent error:', data.message)
      alert('Error: ' + data.message)
    }

    window.api.onTorrentProgress(handleTorrentProgress)
    window.api.onTorrentDone(handleTorrentDone)
    window.api.onTorrentFile(handleTorrentFile)
    window.api.onTorrentError(handleTorrentError)

    return () => {
      window.api.removeTorrentProgress(handleTorrentProgress)
      window.api.removeTorrentDone(handleTorrentDone)
      window.api.removeTorrentFile(handleTorrentFile)
      window.api.removeTorrentError(handleTorrentError)
    }
  }, [torrentId])

  return {
    torrent,
    progress,
    downloadSpeed,
    uploadSpeed,
    numPeers,
    downloaded,
    total,
    remaining
  }
}

function prettyBytes(num: number) {
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const neg = num < 0
  if (neg) num = -num
  if (num < 1) return (neg ? '-' : '') + num + ' B'
  const exponent = Math.min(
    Math.floor(Math.log(num) / Math.log(1000)),
    units.length - 1
  )
  const unit = units[exponent]
  num = Number((num / Math.pow(1000, exponent)).toFixed(2))
  return (neg ? '-' : '') + num + ' ' + unit
}

export { useTorrentStream }

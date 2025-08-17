import React, { useState } from 'react';
import { FaFileExcel } from 'react-icons/fa';

const DownloadIcon = ({ searchText, exportToExcel }) => {
  const [loading, setLoading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setDownloadDone(false);

    await exportToExcel(
      searchText,
      (progress) => setDownloadProgress(progress), // updates progress
      () => setDownloadDone(true)                  // marks done
    );

    setLoading(false);
    setDownloadProgress(null);
  };

  const getButtonLabel = () => {
    if (loading) return downloadProgress !== null ? `Downloading... ${downloadProgress}%` : "Downloading...";
    if (downloadDone) return "✅ Done";
    return <><FaFileExcel /> Export</>;
  };

  return (
    <button
  className="btn btn-success"
  onClick={() => exportToExcel(searchText, setDownloadProgress, setDownloadDone)}
  disabled={loading}
>
  {getButtonLabel()}
</button>

  );
};

export default DownloadIcon;

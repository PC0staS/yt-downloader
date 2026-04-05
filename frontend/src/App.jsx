import { useState, useEffect } from "react";
import { YoutubeDownload } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { BrowserOpenURL } from "../wailsjs/runtime/runtime";

export default function App() {
  const [url, setUrl] = useState("");
  const [audioOnly, setAudioOnly] = useState(false);
  const [quality, setQuality] = useState("best");
  const [downloadPath, setDownloadPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);

  // Escuchar eventos de progreso en tiempo real
  useEffect(() => {
    const unlistener = EventsOn("job:update", (jobData) => {
      setJob(jobData);
    });

    return () => {
      if (unlistener) unlistener();
    };
  }, []);

  // Escuchar cambios en el job para actualizar el estado
  useEffect(() => {
    if (!job) return;

    if (job.status === "completed") {
      setLoading(false);
      setStatus("success");
      setUrl("");
      setAudioOnly(false);
      setQuality("best");
    } else if (job.status === "error") {
      setLoading(false);
      setStatus("error");
      setError(job.error);
    } else if (job.status === "downloading") {
      setLoading(true);
    }
  }, [job]);

  const handleDownload = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    // Validate YouTube URL
    if (!isValidYoutubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    try {
      const response = await YoutubeDownload({
        url: url.trim(),
        audioOnly: audioOnly,
        quality: audioOnly ? "best" : quality,
        downloadPath: downloadPath,
      });

      if (response.success) {
        setStatus("success");
        setUrl("");
        setAudioOnly(false);
        setQuality("best");
      } else {
        setError(response.error || "Download failed");
        setStatus("error");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const isValidYoutubeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      );
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen text-[#e8edf5]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(147,164,187,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(147,164,187,0.06)_1px,transparent_1px)] bg-size-[36px_36px]" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div
          className="w-full max-w-2xl"
          style={{ animation: "riseIn 420ms ease-out both" }}
        >
          {/* Header */}
          <div className="mb-7 flex items-center justify-between rounded-2xl border border-[#243446] bg-[#101720]/80 px-4 py-3 backdrop-blur-sm">
            <span className="inline-flex items-center rounded-full border border-[#243446] bg-[#131b26] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93a4bb]">
              Download Console
            </span>
            <span className="text-xs font-medium text-[#f4b45f]">
              MP4 / WAV
            </span>
          </div>

          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              YouTube Video Downloader
            </h1>
            <p className="text-sm text-[#93a4bb]">
              Fast local downloads with visible processing states and practical
              defaults.
            </p>
          </div>

          {/* Card */}
          <form
            onSubmit={handleDownload}
            className="rounded-2xl border border-[#243446] bg-[#131b26] p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.6)] sm:p-8"
          >
            {/* URL Input */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[#e8edf5]">
                YouTube URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-[#243446] bg-[#182433] px-4 py-3 text-sm text-[#e8edf5] placeholder:text-[#93a4bb] outline-none transition-all focus:border-[#27c2b7] focus:ring-4 focus:ring-[#27c2b7]/15"
                disabled={loading}
              />
            </div>

            {/* Download Folder Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[#e8edf5]">
                Save Location
              </label>
              <input
                type="text"
                value={downloadPath}
                onChange={(e) => setDownloadPath(e.target.value)}
                placeholder="Leave empty to use app folder"
                className="w-full rounded-xl border border-[#243446] bg-[#182433] px-4 py-3 text-sm text-[#e8edf5] placeholder:text-[#93a4bb] outline-none transition-all focus:border-[#27c2b7] focus:ring-4 focus:ring-[#27c2b7]/15"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-[#93a4bb]">
                Example: /home/user/Downloads
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-[#243446]" />

            {/* Options */}
            <div className="mb-6 space-y-3">
              {/* Audio Only Toggle */}
              <div
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  audioOnly
                    ? "border-[#27c2b7] bg-[#17303a]"
                    : "border-[#243446] bg-[#182433] hover:border-[#34506d]"
                }`}
                onClick={() => setAudioOnly(!audioOnly)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#e8edf5]">
                      Audio Only (WAV)
                    </p>
                    <p className="mt-0.5 text-xs text-[#93a4bb]">
                      Extract audio only
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                      audioOnly
                        ? "border-[#27c2b7] bg-[#27c2b7]"
                        : "border-[#4a637f]"
                    }`}
                  >
                    {audioOnly && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Quality Selector */}
              {!audioOnly && (
                <div className="rounded-xl border border-[#243446] bg-[#182433] p-4">
                  <label className="mb-2.5 block text-sm font-medium text-[#e8edf5]">
                    Video Quality
                  </label>
                  <div className="relative">
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#243446] bg-[#101720] px-3 py-2 pr-10 text-sm text-[#e8edf5] outline-none transition-all focus:border-[#27c2b7] focus:ring-4 focus:ring-[#27c2b7]/15"
                      disabled={loading}
                    >
                      <option value="best">Best Available</option>
                      <option value="1080p">1080p</option>
                      <option value="4K">4K (2160p)</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a4bb]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Job Progress */}
            {job && job.status !== "pending" && (
              <div className="mb-6 rounded-xl border border-[#243446] bg-[#101720] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#e8edf5]">
                      {job.status === "downloading"
                        ? job.message || "Downloading..."
                        : job.status === "completed"
                          ? "Download Complete"
                          : "Download Failed"}
                    </p>
                    {job.title && (
                      <p className="mt-1 truncate text-xs text-[#93a4bb]">
                        {job.title}
                      </p>
                    )}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-[#27c2b7]">
                    {job.progress || 0}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#223247]">
                  <div
                    className="h-full bg-[#27c2b7] transition-all duration-200"
                    style={{ width: `${job.progress || 0}%` }}
                  />
                </div>

                {/* Spinner for processing phase */}
                {job.progress >= 90 && job.progress < 100 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#93a4bb]">
                    <div className="flex gap-1">
                      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#27c2b7]" />
                      <span
                        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#27c2b7]"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#27c2b7]"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="mb-6 rounded-xl border border-[#5d2a31] bg-[#311a1d] p-4">
                <p className="text-sm text-[#ffb4bf]">
                  <span className="font-medium">Error:</span> {error}
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="mb-6 rounded-xl border border-[#2e5d4d] bg-[#162a24] p-4">
                <p className="flex items-center gap-2 text-sm text-[#89e2be]">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Downloaded successfully</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#27c2b7] py-3 text-sm font-semibold text-[#062825] transition-all hover:bg-[#1ea59b] disabled:cursor-not-allowed disabled:bg-[#567b78] disabled:text-[#d9efed]"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </>
              )}
            </button>

            {/* Info Footer */}
            <p className="mt-4 text-center text-xs text-[#93a4bb]">
              {audioOnly
                ? "Audio will be saved as WAV"
                : "Video will be saved as MP4"}
              {downloadPath && ` to ${downloadPath}`}
            </p>
          </form>

          {/* Footer Notes */}
          <div className="mt-6 text-center text-xs text-[#93a4bb]">
            <p>
              {downloadPath
                ? `Files will be saved to ${downloadPath}`
                : "Files will be saved to app folder by default"}
            </p>
          </div>

          {/* Credits Footer */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-[#93a4bb]">
            <button
              onClick={() => BrowserOpenURL("https://github.com/Pc0stas")}
              className="inline-flex items-center gap-2 cursor-pointer transition-colors hover:text-[#27c2b7]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Pc0stas</span>
            </button>
            <span>•</span>
            <button
              onClick={() => BrowserOpenURL("https://pablocostas.dev")}
              className="cursor-pointer transition-colors hover:text-[#27c2b7]"
            >
              pablocostas.dev
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

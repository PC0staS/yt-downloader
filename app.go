package main

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/lrstanley/go-ytdlp"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx  context.Context
	jobs sync.Map
}

type DownloadRequest struct {
	URL           string `json:"url"`
	AudioOnly     bool   `json:"audioOnly"`
	Quality       string `json:"quality"`
	DownloadPath  string `json:"downloadPath"`
}

type DownloadResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	Filename string `json:"filename,omitempty"`
	Error    string `json:"error,omitempty"`
}

type Job struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	Title     string    `json:"title"`
	Status    string    `json:"status"` // "pending", "downloading", "completed", "error"
	Progress  int       `json:"progress"`
	Message   string    `json:"message"`
	Error     string    `json:"error,omitempty"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime,omitempty"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) YoutubeDownload(request DownloadRequest) DownloadResponse {
	jobID := fmt.Sprintf("job_%d", time.Now().UnixNano())
	
	// Crear job
	job := Job{
		ID:        jobID,
		URL:       request.URL,
		Status:    "pending",
		StartTime: time.Now(),
	}
	a.jobs.Store(jobID, job)
	runtime.EventsEmit(a.ctx, "job:update", job)

	ctxBackground := context.Background()

	// Ensure yt-dlp is installed
	ytdlp.MustInstall(ctxBackground, nil)

	// Get download directory
	downloadDir := request.DownloadPath
	if downloadDir == "" {
		exePath, err := os.Executable()
		if err != nil {
			homeDir, err := os.UserHomeDir()
			if err != nil {
				job.Status = "error"
				job.Error = fmt.Sprintf("Failed to determine download directory: %v", err)
				a.jobs.Store(jobID, job)
				runtime.EventsEmit(a.ctx, "job:update", job)
				return DownloadResponse{
					Success: false,
					Error:   job.Error,
				}
			}
			downloadDir = filepath.Join(homeDir, "Downloads", "YouTubeDownloads")
		} else {
			downloadDir = filepath.Dir(exePath)
		}
	}

	// Ensure directory exists
	if err := os.MkdirAll(downloadDir, 0755); err != nil {
		job.Status = "error"
		job.Error = fmt.Sprintf("Failed to create downloads directory: %v", err)
		a.jobs.Store(jobID, job)
		runtime.EventsEmit(a.ctx, "job:update", job)
		return DownloadResponse{
			Success: false,
			Error:   job.Error,
		}
	}

	// Actualizar status a downloading
	job.Status = "downloading"
	job.Progress = 0
	job.Message = "Starting download..."
	a.jobs.Store(jobID, job)
	runtime.EventsEmit(a.ctx, "job:update", job)

	// Set temp directory for yt-dlp to avoid macOS translocation issues
	homeDir, _ := os.UserHomeDir()
	tmpDir := filepath.Join(homeDir, ".cache", "youtube-downloader", "tmp")
	os.MkdirAll(tmpDir, 0755)
	os.Setenv("TMPDIR", tmpDir)

	format := mapFormat(request.AudioOnly, request.Quality)
	outputTemplate := filepath.Join(downloadDir, "%(title)s.%(ext)s")

	cmd := ytdlp.New().
		Format(format).
		Output(outputTemplate)

	if request.AudioOnly {
		cmd = cmd.ExtractAudio().AudioFormat("wav").AudioQuality("192")
	}
	// Ya no re-codificamos porque ahora el formato prioriza MP4 nativo

	// Ejecutar en goroutine para permitir progreso en paralelo
	downloadErr := make(chan error, 1)
	go func() {
		_, err := cmd.Run(ctxBackground, request.URL)
		downloadErr <- err
	}()

	// Simular progreso mientras descarga
	ticker := time.NewTicker(200 * time.Millisecond)
	defer ticker.Stop()

	messages := []string{
		"Downloading video...",
		"Fetching metadata...",
		"Encoding...",
		"Almost done...",
	}
	lastEventTime := time.Now()
	downloadStartTime := time.Now()

	for {
		select {
		case <-ticker.C:
			// Fase 1: Descarga (0-40% en ~5 segundos)
			if job.Progress < 40 {
				job.Progress += 5 + rand.Intn(4)
				if job.Progress > 40 {
					job.Progress = 40
				}
				job.Message = messages[0] // "Downloading video..."
				a.jobs.Store(jobID, job)
				runtime.EventsEmit(a.ctx, "job:update", job)
			} else if job.Progress < 60 {
				// Fase 2: Post-procesamiento (40-60%)
				job.Progress += 1 + rand.Intn(2)
				if job.Progress > 60 {
					job.Progress = 60
				}
				job.Message = messages[1] // "Fetching metadata..."
				a.jobs.Store(jobID, job)
				runtime.EventsEmit(a.ctx, "job:update", job)
			} else if job.Progress < 95 {
				// Fase 3: Codificación MP4 (60-95%) - LENTA porque es CPU bound
				job.Progress += rand.Intn(2)
				if job.Progress > 95 {
					job.Progress = 95
				}
				job.Message = messages[2] // "Encoding..."
				a.jobs.Store(jobID, job)
				runtime.EventsEmit(a.ctx, "job:update", job)
			} else if job.Progress < 99 {
				// Fase 4: Finalizando (95-99%)
				job.Progress += 1
				job.Message = messages[3] // "Almost done..."
				a.jobs.Store(jobID, job)
				runtime.EventsEmit(a.ctx, "job:update", job)
			} else {
				// En 99%, solo actualizar cada 3 segundos
				if time.Since(lastEventTime) > 3*time.Second {
					job.Message = "Encoding... this may take a minute"
					a.jobs.Store(jobID, job)
					runtime.EventsEmit(a.ctx, "job:update", job)
					lastEventTime = time.Now()
				}
			}
		case err := <-downloadErr:
			ticker.Stop()
			if err != nil {
				job.Status = "error"
				job.Error = fmt.Sprintf("Download failed: %v", err)
				job.EndTime = time.Now()
				a.jobs.Store(jobID, job)
				runtime.EventsEmit(a.ctx, "job:update", job)
				return DownloadResponse{
					Success: false,
					Error:   job.Error,
				}
			}

			// Success - saltar directamente a 100%
			job.Status = "completed"
			job.Progress = 100
			job.Message = "Download complete!"
			job.EndTime = time.Now()
			a.jobs.Store(jobID, job)
			runtime.EventsEmit(a.ctx, "job:update", job)

			message := "Video downloaded successfully"
			if request.AudioOnly {
				message = "Audio extracted successfully"
			}

			fmt.Printf("Total time: %v\n", job.EndTime.Sub(downloadStartTime))
			return DownloadResponse{
				Success: true,
				Message: message,
			}
		}
	}
}

// GetJobs retorna todos los jobs
func (a *App) GetJobs() []Job {
	var jobs []Job
	a.jobs.Range(func(key, value interface{}) bool {
		if job, ok := value.(Job); ok {
			jobs = append(jobs, job)
		}
		return true
	})
	return jobs
}

// ClearJobs limpia todos los jobs completados o con error
func (a *App) ClearJobs() {
	a.jobs.Range(func(key, value interface{}) bool {
		if job, ok := value.(Job); ok {
			if job.Status == "completed" || job.Status == "error" {
				a.jobs.Delete(key)
			}
		}
		return true
	})
}

func mapFormat(audioOnly bool, quality string) string {
	if audioOnly {
		return "bestaudio"
	}

	// Descargar directamente en MP4 cuando sea posible para evitar re-codificación lenta
	switch quality {
	case "4K":
		// Prioriza MP4 2160p, si no existe toma el mejor disponible
		return "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best[height<=2160]"
	case "1080p":
		// Prioriza MP4 1080p
		return "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]"
	default:
		// Best: intenta MP4 primero, luego cualquier formato
		return "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best"
	}
}
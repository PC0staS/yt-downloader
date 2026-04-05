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

	format := mapFormat(request.AudioOnly, request.Quality)
	outputTemplate := filepath.Join(downloadDir, "%(title)s.%(ext)s")

	cmd := ytdlp.New().
		Format(format).
		Output(outputTemplate)

	if request.AudioOnly {
		cmd = cmd.ExtractAudio().AudioFormat("mp3").AudioQuality("192")
	} else {
		cmd = cmd.RecodeVideo("mp4")
	}

	// Ejecutar en goroutine para permitir progreso en paralelo
	downloadErr := make(chan error, 1)
	go func() {
		_, err := cmd.Run(ctxBackground, request.URL)
		downloadErr <- err
	}()

	// Simular progreso mientras descarga
	ticker := time.NewTicker(300 * time.Millisecond)
	defer ticker.Stop()

	progressStage := 0
	messages := []string{
		"Downloading video...",
		"Fetching metadata...",
		"Processing video...",
		"Almost done...",
	}

	for {
		select {
		case <-ticker.C:
			// Aumentar progreso gradualmente hasta 90%
			if job.Progress < 90 {
				job.Progress += 3 + rand.Intn(8)
				if job.Progress > 90 {
					job.Progress = 90
				}
				progressStage = (job.Progress / 23)
				job.Message = messages[progressStage]
				a.jobs.Store(jobID, job)
				fmt.Printf("Progress: %d%% - %s\n", job.Progress, job.Message)
				runtime.EventsEmit(a.ctx, "job:update", job)
			} else if job.Progress < 99 {
				// Cuando llega a 90%, mostrar estado de procesamiento
				job.Progress += 1
				job.Message = "Finalizing..."
				a.jobs.Store(jobID, job)
				fmt.Printf("Progress: %d%% - %s\n", job.Progress, job.Message)
				runtime.EventsEmit(a.ctx, "job:update", job)
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

			// Success
			job.Status = "completed"
			job.Progress = 100
			job.EndTime = time.Now()
			a.jobs.Store(jobID, job)
			runtime.EventsEmit(a.ctx, "job:update", job)

			message := "Video downloaded successfully"
			if request.AudioOnly {
				message = "Audio extracted successfully"
			}

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

	switch quality {
	case "4K":
		return "bestvideo[height<=2160]+bestaudio/best[height<=2160]"
	case "1080p":
		return "bestvideo[height<=1080]+bestaudio/best[height<=1080]"
	default:
		return "best"
	}
}
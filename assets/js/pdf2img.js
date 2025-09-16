// PDF to Image functionality
class PDFToImageConverter {
    constructor() {
        this.pdfDoc = null;
        this.pages = [];
        this.setupDropzone();
        this.initializePDFJS();
    }

    initializePDFJS() {
        // Set PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    setupDropzone() {
        const dropzone = document.getElementById('pdf2imgDropzone');
        const input = document.getElementById('pdf2imgInput');

        // Click to upload
        dropzone.addEventListener('click', () => {
            input.click();
        });

        // File input change
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handlePDFFile(e.target.files[0]);
            }
        });

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.handlePDFFile(files[0]);
            } else {
                showToast('Please drop a valid PDF file', 'error');
            }
        });
    }

    async handlePDFFile(file) {
        if (file.type !== 'application/pdf') {
            showToast('Please select a PDF file', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showToast('PDF file too large (max 50MB)', 'error');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            showToast(`PDF loaded: ${this.pdfDoc.numPages} pages`, 'success');
            this.updateUI();
        } catch (error) {
            console.error('Error loading PDF:', error);
            showToast('Error loading PDF file', 'error');
        }
    }

    updateUI() {
        const processBtn = document.getElementById('processPdfBtn');
        processBtn.disabled = !this.pdfDoc;

        if (this.pdfDoc) {
            processBtn.textContent = `Process PDF (${this.pdfDoc.numPages} pages)`;
        }
    }

    async processPDF() {
        if (!this.pdfDoc) {
            showToast('Please upload a PDF file first', 'warning');
            return;
        }

        const processBtn = document.getElementById('processPdfBtn');
        const hideLoading = showLoading(processBtn, 'Processing PDF...');

        try {
            const quality = parseInt(document.getElementById('pdf2imgQuality').value);
            const format = document.getElementById('pdf2imgFormat').value;

            this.pages = [];
            const preview = document.getElementById('pdf2imgPreview');
            preview.innerHTML = '';
            preview.classList.remove('hidden');

            // Add progress indicator
            const progressDiv = document.createElement('div');
            progressDiv.id = 'pdfProgress';
            progressDiv.className = 'mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200';
            progressDiv.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-blue-800">Processing pages...</span>
                    <span id="progressText" class="text-sm text-blue-600">0 / ${this.pdfDoc.numPages}</span>
                </div>
                <div class="w-full bg-blue-200 rounded-full h-2">
                    <div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            `;
            preview.appendChild(progressDiv);

            // Process each page
            for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
                try {
                    const page = await this.pdfDoc.getPage(pageNum);
                    const imageData = await this.renderPageToImage(page, quality, format);

                    this.pages.push({
                        pageNumber: pageNum,
                        imageData: imageData,
                        format: format
                    });

                    this.addPagePreview(pageNum, imageData, format);

                    // Update progress
                    const progressText = document.getElementById('progressText');
                    const progressBar = document.getElementById('progressBar');
                    if (progressText && progressBar) {
                        progressText.textContent = `${pageNum} / ${this.pdfDoc.numPages}`;
                        progressBar.style.width = `${(pageNum / this.pdfDoc.numPages) * 100}%`;
                    }

                } catch (error) {
                    console.error(`Error processing page ${pageNum}:`, error);
                    showToast(`Error processing page ${pageNum}`, 'error');
                }
            }

            // Remove progress indicator
            const progressElement = document.getElementById('pdfProgress');
            if (progressElement) {
                progressElement.remove();
            }

            // Show download actions
            document.getElementById('pdf2imgActions').classList.remove('hidden');

            hideLoading();
            showToast(`Successfully converted ${this.pages.length} pages`, 'success');

        } catch (error) {
            hideLoading();
            console.error('Error processing PDF:', error);
            showToast('Error processing PDF: ' + error.message, 'error');
        }
    }

    async renderPageToImage(page, quality, format) {
        // Get page dimensions
        const viewport = page.getViewport({ scale: quality });

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        // Convert to desired format
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const jpegQuality = format === 'jpeg' ? 0.9 : undefined;

        return canvas.toDataURL(mimeType, jpegQuality);
    }

    addPagePreview(pageNumber, imageData, format) {
        const preview = document.getElementById('pdf2imgPreview');

        const pageDiv = document.createElement('div');
        pageDiv.className = 'border border-gray-200 rounded-lg p-4 bg-white';

        // Create thumbnail
        const img = new Image();
        img.onload = () => {
            const thumbnailCanvas = document.createElement('canvas');
            const thumbnailCtx = thumbnailCanvas.getContext('2d');

            const maxThumbnailSize = 200;
            const scale = Math.min(maxThumbnailSize / img.width, maxThumbnailSize / img.height);

            thumbnailCanvas.width = img.width * scale;
            thumbnailCanvas.height = img.height * scale;

            thumbnailCtx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

            pageDiv.innerHTML = `
                <div class="text-center">
                    <div class="mb-3">
                        ${thumbnailCanvas.outerHTML}
                    </div>
                    <h4 class="font-medium text-gray-800 mb-2">Page ${pageNumber}</h4>
                    <p class="text-sm text-gray-600 mb-3">
                        ${img.width} × ${img.height}px • ${format.toUpperCase()}
                    </p>
                    <div class="space-y-2">
                        <button
                            onclick="pdfToImageConverter.downloadSinglePage(${pageNumber - 1})"
                            class="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors">
                            <i class="fas fa-download mr-1"></i>Download
                        </button>
                        <button
                            onclick="pdfToImageConverter.previewFullSize(${pageNumber - 1})"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
                            <i class="fas fa-eye mr-1"></i>Preview
                        </button>
                    </div>
                </div>
            `;
        };

        img.src = imageData;
        preview.appendChild(pageDiv);
    }

    downloadSinglePage(index) {
        const pageData = this.pages[index];
        if (!pageData) return;

        const filename = `page-${pageData.pageNumber}.${pageData.format}`;
        this.downloadImage(pageData.imageData, filename);
    }

    previewFullSize(index) {
        const pageData = this.pages[index];
        if (!pageData) return;

        // Create modal for full-size preview
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="max-w-4xl max-h-full overflow-auto bg-white rounded-lg">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-medium">Page ${pageData.pageNumber} Preview</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-4 text-center">
                    <img src="${pageData.imageData}" class="max-w-full h-auto" alt="Page ${pageData.pageNumber}">
                </div>
                <div class="p-4 border-t border-gray-200 text-center">
                    <button
                        onclick="pdfToImageConverter.downloadSinglePage(${index}); this.closest('.fixed').remove();"
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                        <i class="fas fa-download mr-2"></i>Download This Page
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on Escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    async downloadAllImages() {
        if (this.pages.length === 0) {
            showToast('No pages to download', 'warning');
            return;
        }

        const downloadBtn = document.querySelector('button[onclick="downloadAllImages()"]');
        const hideLoading = showLoading(downloadBtn, 'Creating ZIP...');

        try {
            const zip = new JSZip();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');

            // Add each page to ZIP
            for (const pageData of this.pages) {
                const filename = `page-${String(pageData.pageNumber).padStart(3, '0')}.${pageData.format}`;

                // Convert data URL to blob
                const response = await fetch(pageData.imageData);
                const blob = await response.blob();

                zip.file(filename, blob);
            }

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipFilename = `pdf-images-${timestamp}.zip`;

            this.downloadBlob(zipBlob, zipFilename);

            hideLoading();
            showToast(`Downloaded ${this.pages.length} images as ${zipFilename}`, 'success');

        } catch (error) {
            hideLoading();
            console.error('Error creating ZIP:', error);
            showToast('Error creating ZIP file', 'error');
        }
    }

    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize converter
const pdfToImageConverter = new PDFToImageConverter();

// UI Functions
function processPDF() {
    pdfToImageConverter.processPDF();
}

function downloadAllImages() {
    pdfToImageConverter.downloadAllImages();
}

// Export functions
window.processPDF = processPDF;
window.downloadAllImages = downloadAllImages;
window.pdfToImageConverter = pdfToImageConverter;
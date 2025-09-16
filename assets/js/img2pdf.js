// Image to PDF functionality with Enchanted Scan Mode
class ImageToPDFConverter {
    constructor() {
        this.images = [];
        this.setupDropzone();
    }

    setupDropzone() {
        const dropzone = document.getElementById('img2pdfDropzone');
        const input = document.getElementById('img2pdfInput');

        // Click to upload
        dropzone.addEventListener('click', () => {
            input.click();
        });

        // File input change
        input.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
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
            this.handleFiles(e.dataTransfer.files);
        });
    }

    async handleFiles(files) {
        const validFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // Max 10MB
        );

        if (validFiles.length === 0) {
            showToast('Please select valid image files (max 10MB each)', 'error');
            return;
        }

        for (const file of validFiles) {
            try {
                const imageData = await this.processImage(file);
                this.images.push(imageData);
            } catch (error) {
                console.error('Error processing image:', error);
                showToast(`Error processing ${file.name}`, 'error');
            }
        }

        this.updatePreview();
        this.updateUI();
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const imageData = {
                        id: generateId(),
                        name: file.name,
                        size: file.size,
                        originalImage: img,
                        processedCanvas: null,
                        width: img.width,
                        height: img.height
                    };

                    // Apply enchanted scan mode if enabled
                    if (document.getElementById('enchantedScanMode').checked) {
                        imageData.processedCanvas = this.applyEnchantedScanMode(img);
                    }

                    resolve(imageData);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    applyEnchantedScanMode(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply enhancements
        this.enhanceContrast(data);
        this.convertToGrayscale(data);
        this.sharpenImage(data, canvas.width, canvas.height);
        this.removeBackground(data);

        // Put processed data back
        ctx.putImageData(imageData, 0, 0);

        // Apply additional canvas-level enhancements
        this.adjustLevels(ctx, canvas);

        return canvas;
    }

    enhanceContrast(data, factor = 1.5) {
        for (let i = 0; i < data.length; i += 4) {
            // Enhance contrast for RGB channels
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // Red
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // Green
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // Blue
        }
    }

    convertToGrayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            // Use luminance formula for better grayscale conversion
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = gray;     // Red
            data[i + 1] = gray; // Green
            data[i + 2] = gray; // Blue
        }
    }

    sharpenImage(data, width, height) {
        // Sharpening kernel
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];

        const tempData = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let r = 0, g = 0, b = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const weight = kernel[ky + 1][kx + 1];

                        r += tempData[idx] * weight;
                        g += tempData[idx + 1] * weight;
                        b += tempData[idx + 2] * weight;
                    }
                }

                const idx = (y * width + x) * 4;
                data[idx] = Math.min(255, Math.max(0, r));
                data[idx + 1] = Math.min(255, Math.max(0, g));
                data[idx + 2] = Math.min(255, Math.max(0, b));
            }
        }
    }

    removeBackground(data) {
        // Simple background removal - convert near-white pixels to pure white
        const threshold = 240;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

            if (avg > threshold) {
                data[i] = 255;     // Red
                data[i + 1] = 255; // Green
                data[i + 2] = 255; // Blue
            }
        }
    }

    adjustLevels(ctx, canvas) {
        // Apply levels adjustment similar to Photoshop
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Auto-adjust levels based on histogram
        let minVal = 255, maxVal = 0;
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            minVal = Math.min(minVal, gray);
            maxVal = Math.max(maxVal, gray);
        }

        // Stretch contrast
        const range = maxVal - minVal;
        if (range > 0) {
            for (let i = 0; i < data.length; i += 4) {
                data[i] = ((data[i] - minVal) / range) * 255;
                data[i + 1] = ((data[i + 1] - minVal) / range) * 255;
                data[i + 2] = ((data[i + 2] - minVal) / range) * 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    updatePreview() {
        const preview = document.getElementById('img2pdfPreview');
        preview.innerHTML = '';

        if (this.images.length === 0) {
            preview.classList.add('hidden');
            return;
        }

        preview.classList.remove('hidden');

        this.images.forEach((imageData, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'relative bg-white rounded-lg border border-gray-200 p-2';

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Create thumbnail
            const maxSize = 150;
            const scale = Math.min(maxSize / imageData.width, maxSize / imageData.height);
            canvas.width = imageData.width * scale;
            canvas.height = imageData.height * scale;

            // Draw processed or original image
            const sourceImage = imageData.processedCanvas || imageData.originalImage;
            ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

            previewItem.innerHTML = `
                <div class="text-center">
                    <div class="mb-2">${canvas.outerHTML}</div>
                    <p class="text-xs text-gray-600 truncate">${imageData.name}</p>
                    <p class="text-xs text-gray-500">${formatFileSize(imageData.size)}</p>
                    <button
                        onclick="imageToPDFConverter.removeImage(${index})"
                        class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ×
                    </button>
                    <div class="mt-2">
                        <button
                            onclick="imageToPDFConverter.moveUp(${index})"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1"
                            ${index === 0 ? 'disabled' : ''}>
                            ↑
                        </button>
                        <button
                            onclick="imageToPDFConverter.moveDown(${index})"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            ${index === this.images.length - 1 ? 'disabled' : ''}>
                            ↓
                        </button>
                    </div>
                </div>
            `;

            preview.appendChild(previewItem);
        });
    }

    removeImage(index) {
        this.images.splice(index, 1);
        this.updatePreview();
        this.updateUI();
    }

    moveUp(index) {
        if (index > 0) {
            [this.images[index], this.images[index - 1]] = [this.images[index - 1], this.images[index]];
            this.updatePreview();
        }
    }

    moveDown(index) {
        if (index < this.images.length - 1) {
            [this.images[index], this.images[index + 1]] = [this.images[index + 1], this.images[index]];
            this.updatePreview();
        }
    }

    updateUI() {
        const generateBtn = document.getElementById('generatePdfBtn');
        generateBtn.disabled = this.images.length === 0;
    }

    async generatePDF() {
        if (this.images.length === 0) {
            showToast('Please add some images first', 'warning');
            return;
        }

        const generateBtn = document.getElementById('generatePdfBtn');
        const hideLoading = showLoading(generateBtn, 'Generating PDF...');

        try {
            // Using jsPDF for PDF generation
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            let isFirstPage = true;

            for (const imageData of this.images) {
                if (!isFirstPage) {
                    pdf.addPage();
                }

                // Get the source (processed or original)
                const source = imageData.processedCanvas || imageData.originalImage;

                // Create a temporary canvas to get the data URL
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = source.width;
                tempCanvas.height = source.height;
                tempCtx.drawImage(source, 0, 0);

                const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.85);

                // Calculate dimensions to fit the page
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgAspectRatio = source.width / source.height;
                const pageAspectRatio = pdfWidth / pdfHeight;

                let imgWidth, imgHeight;

                if (imgAspectRatio > pageAspectRatio) {
                    // Image is wider, fit to width
                    imgWidth = pdfWidth - 20; // 10mm margin on each side
                    imgHeight = imgWidth / imgAspectRatio;
                } else {
                    // Image is taller, fit to height
                    imgHeight = pdfHeight - 20; // 10mm margin on top and bottom
                    imgWidth = imgHeight * imgAspectRatio;
                }

                // Center the image
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;

                pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
                isFirstPage = false;
            }

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `images-to-pdf-${timestamp}.pdf`;

            // Save the PDF
            pdf.save(filename);

            hideLoading();
            showToast(`PDF generated successfully: ${filename}`, 'success');

        } catch (error) {
            hideLoading();
            console.error('PDF generation error:', error);
            showToast('Error generating PDF: ' + error.message, 'error');
        }
    }

    clearImages() {
        this.images = [];
        this.updatePreview();
        this.updateUI();
        showToast('All images cleared', 'info');
    }
}

// Initialize converter
const imageToPDFConverter = new ImageToPDFConverter();

// UI Functions
function generatePDF() {
    imageToPDFConverter.generatePDF();
}

function clearImages() {
    if (imageToPDFConverter.images.length === 0) {
        showToast('No images to clear', 'warning');
        return;
    }

    if (confirm('Are you sure you want to clear all images?')) {
        imageToPDFConverter.clearImages();
    }
}

// Export functions
window.generatePDF = generatePDF;
window.clearImages = clearImages;
window.imageToPDFConverter = imageToPDFConverter;
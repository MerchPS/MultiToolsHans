# 🚀 MultiTools - All-in-One Digital Toolkit

> **Enhance your productivity with 4 powerful tools in one sleek, modern web application!**

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## ✨ Features Overview

### 🎭 **Humanize Text Enchanted+**
- **AI Detection System**: Advanced heuristic analysis to identify AI-generated content
- **Smart Humanization**: Transform robotic text into natural, conversational language
- **Real-time Analysis**: Get instant AI likelihood scores with detailed breakdowns
- **Enhanced Processing**: Uses local algorithms + optional external API integration

### 📄 **Image To PDF Enchanted+**
- **Drag & Drop Interface**: Intuitive multi-image upload system
- **Enchanted Scan Mode**: Auto-enhance images with contrast, sharpening, and background removal
- **Smart Processing**: Grayscale conversion, noise reduction, and document optimization
- **Batch Processing**: Convert multiple images into a single, professional PDF

### 🖼️ **PDF To Image Converter**
- **High-Quality Rendering**: Extract images from PDF at multiple quality levels (1x-3x)
- **Format Options**: Export as PNG or JPEG with quality control
- **Batch Export**: Download individual pages or all pages as a ZIP file
- **Preview System**: Full-size preview before download

### ☁️ **Cloud Storage Enhanced++**
- **Personal File Manager**: Create folders, upload files, organize documents
- **Secure Authentication**: Password-hashed storage with device fingerprinting
- **Anti-Spam Protection**: One storage per device per 24 hours
- **File Operations**: Rename, delete, download, and share files securely

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript (ES6+)
- **PDF Processing**: PDF.js, jsPDF, pdf-lib
- **File Handling**: JSZip for archives
- **Security**: bcrypt.js for password hashing
- **Backend**: Vercel Serverless Functions (Node.js)
- **Storage**: JSONBin API for cloud data storage

---

## 🚀 Quick Deploy to Vercel

### Prerequisites

1. **Vercel Account**: [Sign up for free](https://vercel.com/signup)
2. **JSONBin Account**: [Get free API key](https://jsonbin.io/)
3. **Optional**: OpenAI/HuggingFace API keys for enhanced text humanization

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/multitools&env=JSONBIN_API_KEY,OPENAI_API_KEY,HUGGINGFACE_API_KEY)

### Manual Deploy Steps

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/multitools.git
cd multitools
```

#### 2. Install Vercel CLI
```bash
npm i -g vercel
```

#### 3. Deploy to Vercel
```bash
vercel
```

#### 4. Configure Environment Variables

In your Vercel dashboard, go to **Settings** → **Environment Variables** and add:

| Variable | Description | Required |
|----------|-------------|----------|
| `JSONBIN_API_KEY` | Your JSONBin API key | ✅ **Required** |
| `OPENAI_API_KEY` | OpenAI API key (optional) | ⚪ Optional |
| `HUGGINGFACE_API_KEY` | HuggingFace API key (optional) | ⚪ Optional |

#### 5. Redeploy
```bash
vercel --prod
```

---

## 🔑 Getting API Keys

### 📋 JSONBin API Key (Required)

1. Visit [jsonbin.io](https://jsonbin.io/)
2. Sign up for a free account
3. Go to **API Keys** section
4. Copy your API key
5. Add to Vercel environment variables as `JSONBIN_API_KEY`

### 🤖 OpenAI API Key (Optional - Enhanced Humanization)

1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create account and add billing information
3. Generate new API key
4. Add to Vercel as `OPENAI_API_KEY`

### 🤗 HuggingFace API Key (Optional - Alternative Humanization)

1. Visit [HuggingFace](https://huggingface.co/settings/tokens)
2. Create account and generate token
3. Add to Vercel as `HUGGINGFACE_API_KEY`

---

## 📁 Project Structure

```
MultiTools/
├── index.html              # Main application UI
├── assets/
│   └── js/
│       ├── main.js          # Core app logic & utilities
│       ├── humanize.js      # Text humanization features
│       ├── img2pdf.js       # Image to PDF converter
│       ├── pdf2img.js       # PDF to image converter
│       └── cloud.js         # Cloud storage functionality
├── api/
│   ├── jsonbin.js          # JSONBin API proxy (secure)
│   └── humanize.js         # Text humanization API
├── vercel.json             # Vercel configuration
└── README.md               # This file
```

---

## ⚙️ Configuration & Security

### Environment Variables

Create a `.env` file for local development:

```env
# Required
JSONBIN_API_KEY=your_jsonbin_api_key_here

# Optional (for enhanced features)
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here
```

### Security Features

- **API Key Protection**: All sensitive keys are stored in Vercel environment variables
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: All user inputs are sanitized and validated
- **Password Hashing**: Uses bcrypt for secure password storage
- **Device Fingerprinting**: Prevents spam account creation
- **File Size Limits**: Prevents abuse with reasonable file size restrictions

---

## 🎯 Usage Guide

### 1. Humanize Text
1. Open the **Humanize Text** tool
2. Paste your AI-generated text in the input area
3. Click **Analyze** to get AI likelihood score
4. Click **Humanize** to transform the text
5. Copy the natural, human-like result

### 2. Image To PDF
1. Open **Image To PDF** tool
2. Drag & drop images or click to upload
3. Toggle **Enchanted Scan Mode** for document enhancement
4. Reorder images as needed
5. Click **Generate PDF** to download

### 3. PDF To Image
1. Open **PDF To Image** tool
2. Upload your PDF file
3. Select quality (1x, 2x, or 3x) and format (PNG/JPEG)
4. Click **Process PDF**
5. Download individual pages or all as ZIP

### 4. Cloud Storage
1. Open **Cloud Storage** tool
2. Create new storage with unique ID and password
3. Create folders and upload files
4. Manage files with rename/delete operations
5. Share access with others using your storage credentials

---

## 🔧 Local Development

### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/multitools.git
cd multitools

# Install Vercel CLI
npm i -g vercel

# Start development server
vercel dev
```

### Testing
```bash
# Test individual components
open index.html

# Test API endpoints
curl -X POST http://localhost:3000/api/jsonbin \
  -H "Content-Type: application/json" \
  -d '{"action":"check","storageId":"test"}'
```

---

## 🎨 Customization

### Theming
The app uses TailwindCSS for styling. Key customization points:

```javascript
// In index.html <script> section
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',    // Change primary color
        secondary: '#8b5cf6',  // Change secondary color
        accent: '#06b6d4',     // Change accent color
        dark: '#1e1b4b'        // Change dark theme
      }
    }
  }
}
```

### Feature Toggles
```javascript
// In assets/js/main.js
const CONFIG = {
  enableCloudStorage: true,
  enableHumanizer: true,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxStoragesPerDevice: 1
};
```

---

## 🚨 Troubleshooting

### Common Issues

#### **"JSONBin API key not configured"**
- Solution: Add `JSONBIN_API_KEY` to Vercel environment variables and redeploy

#### **PDF processing fails**
- Solution: Ensure file size is under 50MB and file is a valid PDF

#### **Cloud storage creation fails**
- Solution: Check if storage ID already exists, try a different one

#### **Humanization not working**
- Solution: The app works without API keys using local algorithms. API keys only enhance the feature.

### Debug Mode

Enable debug logging:
```javascript
// Add to browser console
localStorage.setItem('debug', 'true');
location.reload();
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📊 Performance Optimization

### Recommendations

- **Image Optimization**: Images are processed client-side to reduce server load
- **Chunked Processing**: Large files are processed in chunks for better UX
- **Caching**: Implement service worker for offline functionality
- **CDN**: Static assets are served via Vercel's global CDN

### Monitoring

Track performance with:
```javascript
// Add to main.js
performance.mark('tool-start');
// ... tool operation
performance.mark('tool-end');
performance.measure('tool-duration', 'tool-start', 'tool-end');
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- [TailwindCSS](https://tailwindcss.com/) for the beautiful UI framework
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing capabilities
- [JSONBin](https://jsonbin.io/) for simple cloud storage solutions
- [Vercel](https://vercel.com/) for seamless deployment and hosting

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/multitools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/multitools/discussions)
- **Email**: support@multitools.dev

---

<div align="center">

### 🌟 Star this repository if you found it helpful! 🌟

**Made with ❤️ for productivity enthusiasts worldwide**

[⬆ Back to Top](#-multitools---all-in-one-digital-toolkit)

</div>
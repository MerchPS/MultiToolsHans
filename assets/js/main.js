// Main application controller
class MultiTools {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });
    }

    setupDragAndDrop() {
        // Prevent default drag behaviors
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('[id$="Modal"]');
        modals.forEach(modal => modal.classList.add('hidden'));
    }
}

// Global functions for tool management
function openTool(toolName) {
    const modalId = toolName + 'Modal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');

        // Initialize tool-specific functionality
        switch(toolName) {
            case 'cloud':
                initCloudStorage();
                break;
        }
    }
}

function closeTool(toolName) {
    const modalId = toolName + 'Modal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 translate-x-full`;

    switch(type) {
        case 'success':
            toast.classList.add('bg-green-600');
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-600');
            break;
        default:
            toast.classList.add('bg-blue-600');
    }

    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showLoading(element, text = 'Processing...') {
    const originalContent = element.innerHTML;
    element.innerHTML = `
        <div class="flex items-center justify-center">
            <div class="loading-spinner mr-2"></div>
            <span>${text}</span>
        </div>
    `;
    element.disabled = true;

    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Device fingerprinting for anti-spam
function getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);

    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: canvas.toDataURL(),
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB,
        cpuCores: navigator.hardwareConcurrency || 'unknown',
        memory: navigator.deviceMemory || 'unknown'
    };

    // Create hash from fingerprint
    const fingerprintStr = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintStr.length; i++) {
        const char = fingerprintStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
}

// Encryption utilities
function simpleEncrypt(text, key) {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(
            text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }
    return btoa(encrypted);
}

function simpleDecrypt(encryptedText, key) {
    const encrypted = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
            encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }
    return decrypted;
}

// Initialize application
const app = new MultiTools();

// Expose global functions
window.openTool = openTool;
window.closeTool = closeTool;
window.showToast = showToast;
window.showLoading = showLoading;
window.formatFileSize = formatFileSize;
window.generateId = generateId;
window.sanitizeInput = sanitizeInput;
window.getDeviceFingerprint = getDeviceFingerprint;
window.simpleEncrypt = simpleEncrypt;
window.simpleDecrypt = simpleDecrypt;
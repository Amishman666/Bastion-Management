// js/utils.js - Utility Functions and Helpers

/**
 * Time and Date Utilities
 */
export class TimeUtils {
    static formatTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static formatDateTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    }

    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    static getTimeRemaining(startTime, durationHours) {
        const now = Date.now();
        const elapsed = now - startTime;
        const totalDuration = durationHours * 60 * 60 * 1000;
        const remaining = totalDuration - elapsed;

        return remaining > 0 ? remaining : 0;
    }

    static isExpired(startTime, durationHours) {
        return this.getTimeRemaining(startTime, durationHours) === 0;
    }

    static addHours(date, hours) {
        return new Date(date.getTime() + hours * 60 * 60 * 1000);
    }

    static addDays(date, days) {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    }
}

/**
 * DOM Manipulation Utilities
 */
export class DOMUtils {
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key.startsWith('aria-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    }

    static show(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = '';
            element.classList.remove('hidden');
        }
    }

    static hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = 'none';
            element.classList.add('hidden');
        }
    }

    static toggle(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            if (element.style.display === 'none' || element.classList.contains('hidden')) {
                this.show(element);
            } else {
                this.hide(element);
            }
        }
    }

    static fadeIn(element, duration = 300) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) return;

        element.style.opacity = '0';
        element.style.display = '';
        
        const start = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) return;

        const start = performance.now();
        const initialOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = (initialOpacity * (1 - progress)).toString();
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static addClass(element, className) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    }

    static hasClass(element, className) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        return element ? element.classList.contains(className) : false;
    }

    static scrollToElement(element, behavior = 'smooth') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.scrollIntoView({ behavior, block: 'center' });
        }
    }
}

/**
 * Data Validation Utilities
 */
export class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUsername(username) {
        // 3-20 characters, alphanumeric and underscores only
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    static isPositiveInteger(value) {
        return Number.isInteger(value) && value > 0;
    }

    static isNonNegativeInteger(value) {
        return Number.isInteger(value) && value >= 0;
    }

    static isInRange(value, min, max) {
        return typeof value === 'number' && value >= min && value <= max;
    }

    static sanitizeString(str, maxLength = 1000) {
        if (typeof str !== 'string') return '';
        
        return str
            .trim()
            .slice(0, maxLength)
            .replace(/[<>]/g, ''); // Basic XSS prevention
    }

    static validateResourceAmount(amount) {
        const num = parseInt(amount);
        return this.isNonNegativeInteger(num) && num <= 999999;
    }

    static validateMissionTitle(title) {
        const sanitized = this.sanitizeString(title, 100);
        return sanitized.length >= 3 && sanitized.length <= 100;
    }

    static validateMissionDescription(description) {
        const sanitized = this.sanitizeString(description, 1000);
        return sanitized.length >= 10 && sanitized.length <= 1000;
    }
}

/**
 * Local Storage Utilities
 */
export class StorageUtils {
    static set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }

    static exists(key) {
        return localStorage.getItem(key) !== null;
    }

    static getSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return size;
    }

    static getFormattedSize() {
        const bytes = this.getSize();
        const sizes = ['Bytes', 'KB', 'MB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

/**
 * Array Utilities
 */
export class ArrayUtils {
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static unique(array) {
        return [...new Set(array)];
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, ascending = true) {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }

    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static random(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static randomSample(array, count) {
        const shuffled = this.shuffle(array);
        return shuffled.slice(0, Math.min(count, array.length));
    }
}

/**
 * Math Utilities
 */
export class MathUtils {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static percentage(value, total) {
        return total === 0 ? 0 : Math.round((value / total) * 100);
    }

    static round(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    static sum(array) {
        return array.reduce((sum, num) => sum + num, 0);
    }

    static average(array) {
        return array.length === 0 ? 0 : this.sum(array) / array.length;
    }

    static median(array) {
        const sorted = [...array].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
}

/**
 * String Utilities
 */
export class StringUtils {
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static titleCase(str) {
        return str.split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }

    static camelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    static kebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    static truncate(str, length, suffix = '...') {
        if (str.length <= length) return str;
        return str.slice(0, length - suffix.length) + suffix;
    }

    static pluralize(count, singular, plural = null) {
        if (count === 1) return singular;
        return plural || singular + 's';
    }

    static formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

/**
 * Color Utilities
 */
export class ColorUtils {
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    static lighten(color, amount) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        return this.rgbToHex(
            Math.min(255, rgb.r + amount),
            Math.min(255, rgb.g + amount),
            Math.min(255, rgb.b + amount)
        );
    }

    static darken(color, amount) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        return this.rgbToHex(
            Math.max(0, rgb.r - amount),
            Math.max(0, rgb.g - amount),
            Math.max(0, rgb.b - amount)
        );
    }
}

/**
 * Performance Utilities
 */
export class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static measureTime(name, func) {
        const startTime = performance.now();
        const result = func();
        const endTime = performance.now();
        console.log(`${name} took ${endTime - startTime} milliseconds`);
        return result;
    }

    static async measureTimeAsync(name, func) {
        const startTime = performance.now();
        const result = await func();
        const endTime = performance.now();
        console.log(`${name} took ${endTime - startTime} milliseconds`);
        return result;
    }
}

/**
 * Error Handling Utilities
 */
export class ErrorUtils {
    static safeExecute(func, defaultValue = null) {
        try {
            return func();
        } catch (error) {
            console.error('Safe execution failed:', error);
            return defaultValue;
        }
    }

    static async safeExecuteAsync(func, defaultValue = null) {
        try {
            return await func();
        } catch (error) {
            console.error('Safe async execution failed:', error);
            return defaultValue;
        }
    }

    static retry(func, maxAttempts = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const attempt = () => {
                attempts++;
                try {
                    const result = func();
                    resolve(result);
                } catch (error) {
                    if (attempts >= maxAttempts) {
                        reject(error);
                    } else {
                        setTimeout(attempt, delay);
                    }
                }
            };
            
            attempt();
        });
    }
}

// Export all utilities as a single object for convenience
export const Utils = {
    Time: TimeUtils,
    DOM: DOMUtils,
    Validation: ValidationUtils,
    Storage: StorageUtils,
    Array: ArrayUtils,
    Math: MathUtils,
    String: StringUtils,
    Color: ColorUtils,
    Performance: PerformanceUtils,
    Error: ErrorUtils
};

export default Utils;

// CrownLedger Bank - Shared JavaScript
// Account: Kimberly Westbrook
// Login: Kimberlywestbrooklmi / WestKim19$

(function() {
    'use strict';

    // Session Management
    window.getSession = function() {
        try {
            var session = localStorage.getItem('crownledger_session');
            return session ? JSON.parse(session) : null;
        } catch(e) {
            return null;
        }
    };

    window.isLoggedIn = function() {
        var session = window.getSession();
        if (!session) return false;
        var hoursSinceLogin = (new Date() - new Date(session.loginTime)) / (1000 * 60 * 60);
        return hoursSinceLogin < 24;
    };

    window.logout = function() {
        localStorage.removeItem('crownledger_session');
        window.location.href = 'index.html';
    };

    window.handleLogout = function() {
        window.logout();
    };

    // Auth Guard - redirect to login if not authenticated
    window.requireAuth = function() {
        if (!window.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    };

    // Initialize user display
    window.initUserDisplay = function() {
        var session = window.getSession();
        if (session) {
            var userNameEl = document.getElementById('userName');
            var userNameFullEl = document.getElementById('userNameFull');
            if (userNameEl) userNameEl.textContent = session.firstName || 'Kimberly';
            if (userNameFullEl) userNameFullEl.textContent = session.name || 'Kimberly Westbrook';
        }
    };

    // Format currency
    window.formatCurrency = function(amount) {
        return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };

    // Format date
    window.formatDate = function(dateStr) {
        var date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Copy to clipboard
    window.copyToClipboard = function(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            window.showToast && window.showToast('Copied to clipboard!', 'success');
        } catch(e) {
            window.showToast && window.showToast('Failed to copy', 'error');
        }
        document.body.removeChild(textarea);
    };

    // Toast notification
    window.showToast = function(message, type) {
        var existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast-notification toast-' + (type || 'info');
        toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle') + '"></i> ' + message;
        
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:' + (type === 'success' ? '#107c10' : type === 'error' ? '#d13438' : '#0066b2') + ';color:white;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;gap:10px;animation:toastSlide 0.3s ease;';
        
        var style = document.createElement('style');
        style.textContent = '@keyframes toastSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    };

    // File upload handler
    window.handleFileUpload = function(input) {
        var file = input.files[0];
        if (!file) return;
        
        var preview = document.getElementById('filePreview');
        var fileName = document.getElementById('fileName');
        var confirmBtn = document.getElementById('confirmBtn');
        
        if (file.size > 10 * 1024 * 1024) {
            window.showToast('File too large. Max 10MB.', 'error');
            input.value = '';
            return;
        }
        
        if (preview) {
            preview.style.display = 'flex';
            fileName.textContent = file.name;
        }
        if (confirmBtn) confirmBtn.disabled = false;
        
        // Store file reference
        localStorage.setItem('crownledger_pending_file', file.name);
    };

    window.removeFile = function() {
        var input = document.getElementById('paymentProof');
        var preview = document.getElementById('filePreview');
        var confirmBtn = document.getElementById('confirmBtn');
        
        if (input) input.value = '';
        if (preview) preview.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = true;
        localStorage.removeItem('crownledger_pending_file');
    };

    // Confirm payment
    window.confirmPayment = function() {
        var file = localStorage.getItem('crownledger_pending_file');
        if (!file) {
            window.showToast('Please upload payment proof first', 'error');
            return;
        }
        
        window.showToast('Payment verification submitted. Processing...', 'success');
        setTimeout(function() {
            window.location.href = 'dashboard.html';
        }, 2000);
    };

    // Chime payment init
    window.initChimePayment = function() {
        window.initUserDisplay();
    };

    // Transaction storage
    window.saveTransaction = function(tx) {
        var txs = JSON.parse(localStorage.getItem('crownledger_transactions') || '[]');
        txs.unshift(tx);
        localStorage.setItem('crownledger_transactions', JSON.stringify(txs));
    };

    window.getTransactions = function() {
        return JSON.parse(localStorage.getItem('crownledger_transactions') || '[]');
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Only run auth check on protected pages
        var protectedPages = ['dashboard', 'checking', 'savings', 'transfer', 'bill-pay', 'transactions', 'profile', 'zelle', 'help', 'settings', 'payment-options', 'chime-payment', 'activation'];
        var currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        
        if (protectedPages.indexOf(currentPage) !== -1 && !window.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }
        
        window.initUserDisplay();
    });

})();

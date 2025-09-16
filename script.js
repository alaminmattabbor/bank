// User Dashboard JavaScript with Admin Integration
// This script handles form submissions and communicates with the admin dashboard

// Application Management System
class ApplicationManager {
    constructor() {
        this.applications = this.loadApplications();
        this.initializeEventListeners();
        this.checkApplicationStatus();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Modal buttons
        document.getElementById('karaya-btn').addEventListener('click', () => this.openModal('karaya-modal'));
        document.getElementById('loan-btn').addEventListener('click', () => this.openModal('loan-modal'));
        document.getElementById('insurance-btn').addEventListener('click', () => this.openModal('insurance-modal'));

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Form submissions
        this.setupFormSubmission('karaya-modal', 'islamic-loan');
        this.setupFormSubmission('loan-modal', 'loan');
        this.setupFormSubmission('insurance-modal', 'insurance');

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Open modal
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    // Setup form submission
    setupFormSubmission(modalId, applicationType) {
        const modal = document.getElementById(modalId);
        const form = modal.querySelector('form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = this.collectFormData(form, applicationType);
            const application = this.createApplication(formData, applicationType);
            
            // Submit to admin dashboard
            this.submitApplication(application);
            
            // Show confirmation
            this.showConfirmation(application.id);
            
            // Reset form and close modal
            form.reset();
            modal.style.display = 'none';
        });
    }

    // Collect form data
    collectFormData(form, type) {
        const formData = new FormData(form);
        const data = {};
        
        // Get all input values
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.type === 'radio') {
                if (field.checked) {
                    data[field.name] = field.value;
                }
            } else {
                data[field.id || field.name] = field.value;
            }
        });
        
        return data;
    }

    // Create application object
    createApplication(formData, type) {
        const applicationId = this.generateApplicationId();
        
        let application = {
            id: applicationId,
            type: type,
            status: 'pending',
            date: new Date().toISOString(),
            userId: this.getUserId()
        };

        // Map form data based on type
        switch(type) {
            case 'islamic-loan':
                application = {
                    ...application,
                    name: formData['kh-name'],
                    fatherName: formData['kh-father'],
                    motherName: formData['kh-mother'],
                    phone: formData['kh-phone'],
                    nid: formData['kh-nid'],
                    guarantorName: formData['kh-hostage-name'],
                    guarantorNid: formData['kh-hostage-nid'],
                    amount: formData['kh-amount'],
                    duration: formData['kh-duration'] + ' months'
                };
                break;
                
            case 'loan':
                application = {
                    ...application,
                    name: formData['loan-name'],
                    fatherName: formData['loan-father'],
                    motherName: formData['loan-mother'],
                    phone: formData['loan-phone'],
                    nid: formData['loan-nid'],
                    guarantorName: formData['loan-hostage-name'],
                    guarantorNid: formData['loan-hostage-nid'],
                    amount: formData['loan-amount'],
                    duration: formData['loan-duration']
                };
                break;
                
            case 'insurance':
                application = {
                    ...application,
                    name: formData['ins-name'],
                    fatherName: formData['ins-father'],
                    motherName: formData['ins-mother'],
                    phone: formData['ins-phone'],
                    nid: formData['ins-nid'],
                    nomineeName: formData['ins-numni-name'],
                    nomineeNid: formData['ins-numni-nid'],
                    duration: formData['ins-duration'],
                    amount: formData['ins-taka'],
                    paymentFrequency: formData['frequency'] || 'months'
                };
                break;
        }
        
        return application;
    }

    // Generate unique application ID
    generateApplicationId() {
        const prefix = 'APP';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Get or create user ID
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'USER' + Date.now().toString(36).toUpperCase();
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    // Submit application to admin dashboard
    submitApplication(application) {
        // Store in localStorage for admin dashboard to retrieve
        let pendingApps = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
        pendingApps.push(application);
        localStorage.setItem('pendingApplications', JSON.stringify(pendingApps));
        
        // Store user's own applications
        this.applications.push(application);
        this.saveApplications();
        
        // Send to server (when backend is available)
        this.sendToServer(application);
    }

    // Send to server via API
    async sendToServer(application) {
        try {
            // This would be your actual API endpoint
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(application)
            });
            
            if (response.ok) {
                console.log('Application submitted successfully');
            }
        } catch (error) {
            console.log('Server unavailable, stored locally');
        }
    }

    // Show confirmation message
    showConfirmation(applicationId) {
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'confirmation-message';
        confirmDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        confirmDiv.innerHTML = `
            <h3>Application Submitted Successfully!</h3>
            <p>Your application ID: <strong>${applicationId}</strong></p>
            <p>Please save this ID for future reference.</p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 10px;
                padding: 8px 16px;
                background: white;
                color: #4CAF50;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">OK</button>
        `;
        document.body.appendChild(confirmDiv);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (confirmDiv.parentElement) {
                confirmDiv.remove();
            }
        }, 10000);
    }

    // Check application status
    checkApplicationStatus() {
        // Check for status updates every 10 seconds
        setInterval(() => {
            this.updateApplicationStatuses();
        }, 10000);
    }

    // Update application statuses
    updateApplicationStatuses() {
        const allApps = JSON.parse(localStorage.getItem('allApplications') || '[]');
        const userId = this.getUserId();
        
        // Update user's applications with latest status from admin
        this.applications.forEach(userApp => {
            const adminApp = allApps.find(app => app.id === userApp.id);
            if (adminApp && adminApp.status !== userApp.status) {
                userApp.status = adminApp.status;
                this.notifyStatusChange(userApp);
            }
        });
        
        this.saveApplications();
    }

    // Notify user of status change
    notifyStatusChange(application) {
        const notification = document.createElement('div');
        notification.className = 'status-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getStatusColor(application.status)};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <strong>Status Update!</strong><br>
            Application ${application.id} is now: ${application.status.toUpperCase()}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }

    // Get status color
    getStatusColor(status) {
        const colors = {
            pending: '#ffc107',
            reviewing: '#17a2b8',
            approved: '#28a745',
            rejected: '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    // Load applications from storage
    loadApplications() {
        const userId = this.getUserId();
        const stored = localStorage.getItem(`userApplications_${userId}`);
        return stored ? JSON.parse(stored) : [];
    }

    // Save applications to storage
    saveApplications() {
        const userId = this.getUserId();
        localStorage.setItem(`userApplications_${userId}`, JSON.stringify(this.applications));
    }

    // Track application
    trackApplication(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            alert(`
                Application ID: ${application.id}
                Type: ${application.type}
                Status: ${application.status}
                Date: ${new Date(application.date).toLocaleDateString()}
            `);
        } else {
            alert('Application not found. Please check the ID.');
        }
    }
}

// Notification System
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.badge = document.getElementById('badge');
        this.initializeNotifications();
    }

    initializeNotifications() {
        // Check for new notifications every 5 seconds
        setInterval(() => {
            this.checkForNotifications();
        }, 5000);
    }

    checkForNotifications() {
        // Get notifications from admin dashboard
        const adminNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        const userId = localStorage.getItem('userId');
        
        const userNotifications = adminNotifications.filter(notif => 
            notif.userId === userId && !notif.read
        );
        
        if (userNotifications.length > 0) {
            this.updateBadge(userNotifications.length);
            userNotifications.forEach(notif => {
                this.showNotification(notif);
                notif.read = true;
            });
            
            // Mark as read
            localStorage.setItem('userNotifications', JSON.stringify(adminNotifications));
        }
    }

    updateBadge(count) {
        if (this.badge) {
            this.badge.textContent = count;
            this.badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    showNotification(notification) {
        const notifElement = document.createElement('div');
        notifElement.className = 'notification-popup';
        notifElement.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notifElement.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">Notification</h4>
            <p style="margin: 0;">${notification.message}</p>
        `;
        document.body.appendChild(notifElement);
        
        setTimeout(() => notifElement.remove(), 5000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    
    .modal-content {
        background-color: #fff;
        margin: 5% auto;
        padding: 20px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }
    
    .close-btn {
        position: absolute;
        right: 20px;
        top: 10px;
        font-size: 28px;
        font-weight: bold;
        color: #aaa;
        cursor: pointer;
    }
    
    .close-btn:hover {
        color: #000;
    }
    
    .form-container h2 {
        color: #333;
        margin-bottom: 20px;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 500;
    }
    
    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .submit-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
        margin-top: 10px;
    }
    
    .submit-btn:hover {
        opacity: 0.9;
    }
    
    .radio-group {
        display: flex;
        gap: 15px;
    }
    
    .radio-group label {
        display: inline;
        margin-left: 5px;
    }
`;
document.head.appendChild(style);

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const appManager = new ApplicationManager();
    const notificationSystem = new NotificationSystem();
    
    // Add track application functionality
    window.trackApplication = function() {
        const id = prompt('Enter your application ID:');
        if (id) {
            appManager.trackApplication(id);
        }
    };
    
    // Add notification toggle
    window.toggleDropdown = function() {
        // Implementation for notification dropdown
        console.log('Notification dropdown toggled');
    };
});
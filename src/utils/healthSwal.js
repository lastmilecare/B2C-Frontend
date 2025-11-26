import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const healthTheme = {
    // Clean health color palette
    confirmButtonColor: "#10b981",  // Medical green
    cancelButtonColor: "#ef4444",   // Alert red
    denyButtonColor: "#f59e0b",     // Warning amber

    // Minimal background
    background: "#ffffff",
    color: "#1f2937",

    // Quick animations
    showClass: {
        popup: "animate__animated animate__zoomIn animate__faster"
    },
    hideClass: {
        popup: "animate__animated animate__zoomOut animate__faster"
    },

    // Compact sizing
    width: "24rem",
    padding: "1.25rem",
    // borderRadius: "0.75rem",
    backdrop: "rgba(17, 24, 39, 0.4)",

    reverseButtons: true,
    buttonsStyling: false,

    customClass: {
        popup: "health-popup",
        title: "health-title",
        htmlContainer: "health-text",
        actions: "health-actions",
        confirmButton: "health-btn health-btn-confirm",
        cancelButton: "health-btn health-btn-cancel",
        denyButton: "health-btn health-btn-deny",
    }
};

// Inject Tailwind-based styles
const injectHealthStyles = () => {
    if (document.getElementById("health-alert-styles")) return;

    const style = document.createElement("style");
    style.id = "health-alert-styles";
    style.innerHTML = `
        /* Popup container */
        .health-popup {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
                        0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid #e5e7eb !important;
        }
        
        /* Title */
        .health-title {
            font-size: 1.125rem !important;
            font-weight: 700 !important;
            color: #111827 !important;
            margin-bottom: 0.5rem !important;
            padding: 0 !important;
        }
        
        /* Text content */
        .health-text {
            font-size: 0.875rem !important;
            color: #4b5563 !important;
            line-height: 1.5 !important;
            margin: 0.75rem 0 !important;
        }
        
        /* Icon size - more compact */
        .swal2-icon {
            width: 3rem !important;
            height: 3rem !important;
            margin: 0.5rem auto 1rem !important;
            border-width: 2px !important;
        }
        
        .swal2-icon .swal2-icon-content {
            font-size: 2rem !important;
        }
        
        /* Success checkmark */
        .swal2-icon.swal2-success .swal2-success-ring {
            width: 3rem !important;
            height: 3rem !important;
        }
        
        .swal2-icon.swal2-success [class^='swal2-success-line'] {
            height: 2px !important;
        }
        
        .swal2-icon.swal2-success [class^='swal2-success-line'][class$='tip'] {
            width: 0.875rem !important;
            left: 0.5rem !important;
            top: 1.5rem !important;
        }
        
        .swal2-icon.swal2-success [class^='swal2-success-line'][class$='long'] {
            width: 1.5rem !important;
            right: 0.375rem !important;
            top: 1.25rem !important;
        }
        
        /* Actions - compact spacing */
        .health-actions {
            margin-top: 1rem !important;
            gap: 0.5rem !important;
        }
        
        /* Base button styles using Tailwind classes */
        .health-btn {
            font-size: 0.875rem !important;
            font-weight: 600 !important;
            padding: 0.5rem 1.25rem !important;
            border-radius: 0.5rem !important;
            transition: all 150ms ease !important;
            border: none !important;
            outline: none !important;
            margin: 0 !important;
        }
        
        /* Confirm button */
        .health-btn-confirm {
            background: #10b981 !important;
            color: white !important;
            box-shadow: 0 1px 3px 0 rgba(16, 185, 129, 0.3) !important;
        }
        
        .health-btn-confirm:hover {
            background: #059669 !important;
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4) !important;
            transform: translateY(-1px) !important;
        }
        
        .health-btn-confirm:focus {
            outline: 2px solid #10b981 !important;
            outline-offset: 2px !important;
        }
        
        /* Cancel button */
        .health-btn-cancel {
            background: #f3f4f6 !important;
            color: #374151 !important;
        }
        
        .health-btn-cancel:hover {
            background: #e5e7eb !important;
            transform: translateY(-1px) !important;
        }
        
        /* Deny button */
        .health-btn-deny {
            background: #fef3c7 !important;
            color: #92400e !important;
        }
        
        .health-btn-deny:hover {
            background: #fde68a !important;
            transform: translateY(-1px) !important;
        }
        
        /* Timer progress bar */
        .swal2-timer-progress-bar {
            background: #10b981 !important;
        }
        
        /* Error icon */
        .swal2-icon.swal2-error {
            border-color: #ef4444 !important;
        }
        
        .swal2-icon.swal2-error [class^='swal2-x-mark-line'] {
            background-color: #ef4444 !important;
        }
        
        /* Warning icon */
        .swal2-icon.swal2-warning {
            border-color: #f59e0b !important;
            color: #f59e0b !important;
        }
        
        /* Info icon */
        .swal2-icon.swal2-info {
            border-color: #3b82f6 !important;
            color: #3b82f6 !important;
        }
        
        /* Question icon */
        .swal2-icon.swal2-question {
            border-color: #8b5cf6 !important;
            color: #8b5cf6 !important;
        }
        
        /* Success icon colors */
        .swal2-icon.swal2-success {
            border-color: #10b981 !important;
        }
        
        .swal2-icon.swal2-success [class^='swal2-success-line'] {
            background-color: #10b981 !important;
        }
        
        .swal2-icon.swal2-success .swal2-success-ring {
            border-color: rgba(16, 185, 129, 0.3) !important;
        }
    `;
    document.head.appendChild(style);
};

/**
 * healthAlert: Compact healthcare-themed SweetAlert
 */
export const healthAlert = ({
    title = "Notice",
    text = "",
    html,
    icon = "info",
    showCancelButton = false,
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    timer,
    timerProgressBar = false,
    ...rest
}) => {
    injectHealthStyles();

    return MySwal.fire({
        title,
        text,
        html,
        icon,
        showCancelButton,
        confirmButtonText,
        cancelButtonText,
        timer,
        timerProgressBar,
        ...healthTheme,
        ...rest,
    });
};

/**
 * Quick presets for common scenarios
 */
export const healthAlerts = {
    success: (message, title = "Success") => healthAlert({
        title,
        text: message,
        icon: "success",
        confirmButtonText: "OK"
    }),

    error: (message, title = "Error") => healthAlert({
        title,
        text: message,
        icon: "error",
        confirmButtonText: "OK"
    }),

    warning: (message, title = "Warning") => healthAlert({
        title,
        text: message,
        icon: "warning",
        confirmButtonText: "OK"
    }),

    confirm: (message, title = "Confirm?") => healthAlert({
        title,
        text: message,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }),

    toast: (message, icon = "success") => healthAlert({
        text: message,
        icon,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    })
};
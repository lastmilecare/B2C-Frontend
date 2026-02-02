// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// const MySwal = withReactContent(Swal);

// const healthTheme = {
//     // Clean health color palette
//     confirmButtonColor: "#10b981",  // Medical green
//     cancelButtonColor: "#ef4444",   // Alert red
//     denyButtonColor: "#f59e0b",     // Warning amber

//     // Minimal background
//     background: "#ffffff",
//     color: "#1f2937",

//     // Quick animations
//     showClass: {
//         popup: "animate__animated animate__zoomIn animate__faster"
//     },
//     hideClass: {
//         popup: "animate__animated animate__zoomOut animate__faster"
//     },

//     // Compact sizing
//     width: "24rem",
//     padding: "1.25rem",
//     // borderRadius: "0.75rem",
//     backdrop: "rgba(17, 24, 39, 0.4)",

//     reverseButtons: true,
//     buttonsStyling: false,

//     customClass: {
//         popup: "health-popup",
//         title: "health-title",
//         htmlContainer: "health-text",
//         actions: "health-actions",
//         confirmButton: "health-btn health-btn-confirm",
//         cancelButton: "health-btn health-btn-cancel",
//         denyButton: "health-btn health-btn-deny",
//     }
// };

// // Inject Tailwind-based styles
// const injectHealthStyles = () => {
//     if (document.getElementById("health-alert-styles")) return;

//     const style = document.createElement("style");
//     style.id = "health-alert-styles";
//     style.innerHTML = `
//         /* Popup container */
//         .health-popup {
//             box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
//                         0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
//             border: 1px solid #e5e7eb !important;
//         }

//         /* Title */
//         .health-title {
//             font-size: 1.125rem !important;
//             font-weight: 700 !important;
//             color: #111827 !important;
//             margin-bottom: 0.5rem !important;
//             padding: 0 !important;
//         }

//         /* Text content */
//         .health-text {
//             font-size: 0.875rem !important;
//             color: #4b5563 !important;
//             line-height: 1.5 !important;
//             margin: 0.75rem 0 !important;
//         }

//         /* Icon size - more compact */
//         .swal2-icon {
//             width: 3rem !important;
//             height: 3rem !important;
//             margin: 0.5rem auto 1rem !important;
//             border-width: 2px !important;
//         }

//         .swal2-icon .swal2-icon-content {
//             font-size: 2rem !important;
//         }

//         /* Success checkmark */
//         .swal2-icon.swal2-success .swal2-success-ring {
//             width: 3rem !important;
//             height: 3rem !important;
//         }

//         .swal2-icon.swal2-success [class^='swal2-success-line'] {
//             height: 2px !important;
//         }

//         .swal2-icon.swal2-success [class^='swal2-success-line'][class$='tip'] {
//             width: 0.875rem !important;
//             left: 0.5rem !important;
//             top: 1.5rem !important;
//         }

//         .swal2-icon.swal2-success [class^='swal2-success-line'][class$='long'] {
//             width: 1.5rem !important;
//             right: 0.375rem !important;
//             top: 1.25rem !important;
//         }

//         /* Actions - compact spacing */
//         .health-actions {
//             margin-top: 1rem !important;
//             gap: 0.5rem !important;
//         }

//         /* Base button styles using Tailwind classes */
//         .health-btn {
//             font-size: 0.875rem !important;
//             font-weight: 600 !important;
//             padding: 0.5rem 1.25rem !important;
//             border-radius: 0.5rem !important;
//             transition: all 150ms ease !important;
//             border: none !important;
//             outline: none !important;
//             margin: 0 !important;
//         }

//         /* Confirm button */
//         .health-btn-confirm {
//             background: #10b981 !important;
//             color: white !important;
//             box-shadow: 0 1px 3px 0 rgba(16, 185, 129, 0.3) !important;
//         }

//         .health-btn-confirm:hover {
//             background: #059669 !important;
//             box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4) !important;
//             transform: translateY(-1px) !important;
//         }

//         .health-btn-confirm:focus {
//             outline: 2px solid #10b981 !important;
//             outline-offset: 2px !important;
//         }

//         /* Cancel button */
//         .health-btn-cancel {
//             background: #f3f4f6 !important;
//             color: #374151 !important;
//         }

//         .health-btn-cancel:hover {
//             background: #e5e7eb !important;
//             transform: translateY(-1px) !important;
//         }

//         /* Deny button */
//         .health-btn-deny {
//             background: #fef3c7 !important;
//             color: #92400e !important;
//         }

//         .health-btn-deny:hover {
//             background: #fde68a !important;
//             transform: translateY(-1px) !important;
//         }

//         /* Timer progress bar */
//         .swal2-timer-progress-bar {
//             background: #10b981 !important;
//         }

//         /* Error icon */
//         .swal2-icon.swal2-error {
//             border-color: #ef4444 !important;
//         }

//         .swal2-icon.swal2-error [class^='swal2-x-mark-line'] {
//             background-color: #ef4444 !important;
//         }

//         /* Warning icon */
//         .swal2-icon.swal2-warning {
//             border-color: #f59e0b !important;
//             color: #f59e0b !important;
//         }

//         /* Info icon */
//         .swal2-icon.swal2-info {
//             border-color: #3b82f6 !important;
//             color: #3b82f6 !important;
//         }

//         /* Question icon */
//         .swal2-icon.swal2-question {
//             border-color: #8b5cf6 !important;
//             color: #8b5cf6 !important;
//         }

//         /* Success icon colors */
//         .swal2-icon.swal2-success {
//             border-color: #10b981 !important;
//         }

//         .swal2-icon.swal2-success [class^='swal2-success-line'] {
//             background-color: #10b981 !important;
//         }

//         .swal2-icon.swal2-success .swal2-success-ring {
//             border-color: rgba(16, 185, 129, 0.3) !important;
//         }
//     `;
//     document.head.appendChild(style);
// };

// /**
//  * healthAlert: Compact healthcare-themed SweetAlert
//  */
// export const healthAlert = ({
//     title = "Notice",
//     text = "",
//     html,
//     icon = "info",
//     showCancelButton = false,
//     confirmButtonText = "Confirm",
//     cancelButtonText = "Cancel",
//     timer,
//     timerProgressBar = false,
//     ...rest
// }) => {
//     injectHealthStyles();

//     return MySwal.fire({
//         title,
//         text,
//         html,
//         icon,
//         showCancelButton,
//         confirmButtonText,
//         cancelButtonText,
//         timer,
//         timerProgressBar,
//         ...healthTheme,
//         ...rest,
//     });
// };

// /**
//  * Quick presets for common scenarios
//  */
// export const healthAlerts = {
//     success: (message, title = "Success") => healthAlert({
//         title,
//         text: message,
//         icon: "success",
//         confirmButtonText: "OK"
//     }),

//     error: (message, title = "Error") => healthAlert({
//         title,
//         text: message,
//         icon: "error",
//         confirmButtonText: "OK"
//     }),

//     warning: (message, title = "Warning") => healthAlert({
//         title,
//         text: message,
//         icon: "warning",
//         confirmButtonText: "OK"
//     }),

//     confirm: (message, title = "Confirm?") => healthAlert({
//         title,
//         text: message,
//         icon: "question",
//         showCancelButton: true,
//         confirmButtonText: "Yes",
//         cancelButtonText: "No"
//     }),

//     toast: (message, icon = "success") => healthAlert({
//         text: message,
//         icon,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true
//     })
// };

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const healthTheme = {
    // Clean health color palette
    confirmButtonColor: "#10b981",  // Medical green
    cancelButtonColor: "#ef4444",   // Alert red
    denyButtonColor: "#f59e0b",     // Warning amber

    // Glass morphism background
    background: "rgba(255, 255, 255, 0.95)",
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
    borderRadius: "0.75rem",
    backdrop: "rgba(17, 24, 39, 0.6)",

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
        input: "health-input",
    }
};

// Inject enhanced Tailwind-based styles with futuristic elements
const injectHealthStyles = () => {
    if (document.getElementById("health-alert-styles")) return;

    const style = document.createElement("style");
    style.id = "health-alert-styles";
    style.innerHTML = `
        /* Futuristic animations */
        @keyframes iconPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        /* Popup container - Glass morphism with subtle glow */
        .health-popup {
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            background: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15), 
                        0 8px 16px -6px rgba(0, 0, 0, 0.1),
                        0 0 0 1px rgba(16, 185, 129, 0.1) !important;
            border: 1px solid rgba(16, 185, 129, 0.2) !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        /* Futuristic accent line at top */
        .health-popup::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 3px !important;
            background: linear-gradient(90deg, #10b981, #059669, #10b981) !important;
            background-size: 200% 100% !important;
            animation: shimmer 3s linear infinite !important;
        }
        
        /* Title */
        .health-title {
            font-size: 1.125rem !important;
            font-weight: 700 !important;
            color: #111827 !important;
            margin-bottom: 0.5rem !important;
            padding: 0 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
        
        /* Text content */
        .health-text {
            font-size: 0.875rem !important;
            color: #4b5563 !important;
            line-height: 1.5 !important;
            margin: 0.75rem 0 !important;
        }
        
        /* Icon - with pulse animation and glow */
        .swal2-icon {
            width: 3rem !important;
            height: 3rem !important;
            margin: 0.5rem auto 1rem !important;
            border-width: 2px !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        .swal2-icon .swal2-icon-content {
            font-size: 2rem !important;
        }
        
        /* Success checkmark with glow */
        .swal2-icon.swal2-success {
            border-color: #10b981 !important;
            animation: iconPulse 2s ease-in-out infinite, glowPulse 2s ease-in-out infinite !important;
        }
        
        .swal2-icon.swal2-success .swal2-success-ring {
            width: 3rem !important;
            height: 3rem !important;
            border-color: rgba(16, 185, 129, 0.3) !important;
        }
        
        .swal2-icon.swal2-success [class^='swal2-success-line'] {
            height: 2px !important;
            background-color: #10b981 !important;
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
        
        /* Base button styles */
        .health-btn {
            font-size: 0.875rem !important;
            font-weight: 600 !important;
            padding: 0.5rem 1.25rem !important;
            border-radius: 0.5rem !important;
            transition: all 150ms ease !important;
            border: none !important;
            outline: none !important;
            margin: 0 !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        /* Confirm button - gradient with shimmer effect */
        .health-btn-confirm {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
            color: white !important;
            box-shadow: 0 2px 8px 0 rgba(16, 185, 129, 0.3) !important;
        }
        
        .health-btn-confirm::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: -100% !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent) !important;
            transition: left 0.5s !important;
        }
        
        .health-btn-confirm:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
            box-shadow: 0 4px 12px -1px rgba(16, 185, 129, 0.4) !important;
            transform: translateY(-1px) !important;
        }
        
        .health-btn-confirm:hover::before {
            left: 100% !important;
        }
        
        .health-btn-confirm:focus {
            outline: 2px solid #10b981 !important;
            outline-offset: 2px !important;
        }
        
        /* Cancel button */
        .health-btn-cancel {
            background: #f3f4f6 !important;
            color: #374151 !important;
            border: 1px solid #e5e7eb !important;
        }
        
        .health-btn-cancel:hover {
            background: #e5e7eb !important;
            transform: translateY(-1px) !important;
        }
        
        /* Deny button */
        .health-btn-deny {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            color: #92400e !important;
            border: 1px solid #fcd34d !important;
        }
        
        .health-btn-deny:hover {
            background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%) !important;
            transform: translateY(-1px) !important;
        }
        
        /* Input field styling */
        .health-input,
        .swal2-input {
            border: 2px solid #e5e7eb !important;
            border-radius: 0.5rem !important;
            padding: 0.625rem 0.875rem !important;
            font-size: 0.875rem !important;
            transition: all 200ms ease !important;
            background: rgba(255, 255, 255, 0.8) !important;
        }
        
        .health-input:focus,
        .swal2-input:focus {
            border-color: #10b981 !important;
            outline: none !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
            background: white !important;
        }
        
        /* Timer progress bar */
        .swal2-timer-progress-bar {
            background: linear-gradient(90deg, #10b981, #059669) !important;
        }
        
        /* Error icon */
        .swal2-icon.swal2-error {
            border-color: #ef4444 !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        .swal2-icon.swal2-error [class^='swal2-x-mark-line'] {
            background-color: #ef4444 !important;
        }
        
        /* Warning icon */
        .swal2-icon.swal2-warning {
            border-color: #f59e0b !important;
            color: #f59e0b !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        /* Info icon */
        .swal2-icon.swal2-info {
            border-color: #3b82f6 !important;
            color: #3b82f6 !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        /* Question icon */
        .swal2-icon.swal2-question {
            border-color: #8b5cf6 !important;
            color: #8b5cf6 !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        /* Toast specific styles */
        .swal2-toast.health-popup {
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.2) !important;
        }
        
        /* Loading spinner */
        .swal2-loader {
            border-color: #10b981 transparent #10b981 transparent !important;
        }
    `;
    document.head.appendChild(style);
};

/**
 * healthAlert: Futuristic healthcare-themed SweetAlert
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
    }),

    loading: (message = "Processing...") => healthAlert({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            MySwal.showLoading();
        }
    }),

    input: async (title = "Enter Information", placeholder = "", inputType = "text") => {
        return healthAlert({
            title,
            input: inputType,
            inputPlaceholder: placeholder,
            showCancelButton: true,
            confirmButtonText: "Submit",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
                if (!value) {
                    return "This field is required!";
                }
            }
        });
    }
};

// Example usage:
// healthAlerts.success("Patient Data Saved Successfully", "Patient Saved");
// healthAlerts.error("Failed to save patient data", "Error");
// healthAlerts.confirm("Are you sure you want to delete this record?");
// healthAlerts.toast("Record updated!");
// healthAlerts.loading("Saving patient data...");
// const result = await healthAlerts.input("Patient Name", "Enter full name");
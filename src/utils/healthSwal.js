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

// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// const MySwal = withReactContent(Swal);

const healthTheme = {
    
    confirmButtonColor: "#10b981",  
    cancelButtonColor: "#ef4444",  
    denyButtonColor: "#f59e0b",     

    
    background: "rgba(255, 255, 255, 0.95)",
    color: "#1f2937",

    
    showClass: {
        popup: "animate__animated animate__zoomIn animate__faster"
    },
    hideClass: {
        popup: "animate__animated animate__zoomOut animate__faster"
    },

    
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
        
       
        .health-title {
            font-size: 1.125rem !important;
            font-weight: 700 !important;
            color: #111827 !important;
            margin-bottom: 0.5rem !important;
            padding: 0 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
        
        
        .health-text {
            font-size: 0.875rem !important;
            color: #4b5563 !important;
            line-height: 1.5 !important;
            margin: 0.75rem 0 !important;
        }
        
       
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
        
        
        .health-btn-cancel {
            background: #f3f4f6 !important;
            color: #374151 !important;
            border: 1px solid #e5e7eb !important;
        }
        
        .health-btn-cancel:hover {
            background: #e5e7eb !important;
            transform: translateY(-1px) !important;
        }
        
        
        .health-btn-deny {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            color: #92400e !important;
            border: 1px solid #fcd34d !important;
        }
        
        .health-btn-deny:hover {
            background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%) !important;
            transform: translateY(-1px) !important;
        }
        
     
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
        
        
        .swal2-timer-progress-bar {
            background: linear-gradient(90deg, #10b981, #059669) !important;
        }
        
      
        .swal2-icon.swal2-error {
            border-color: #ef4444 !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        .swal2-icon.swal2-error [class^='swal2-x-mark-line'] {
            background-color: #ef4444 !important;
        }
        
       
        .swal2-icon.swal2-warning {
            border-color: #f59e0b !important;
            color: #f59e0b !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
     
        .swal2-icon.swal2-info {
            border-color: #3b82f6 !important;
            color: #3b82f6 !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
        
        .swal2-icon.swal2-question {
            border-color: #8b5cf6 !important;
            color: #8b5cf6 !important;
            animation: iconPulse 2s ease-in-out infinite !important;
        }
        
      
        .swal2-toast.health-popup {
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.2) !important;
        }
        
        
        .swal2-loader {
            border-color: #10b981 transparent #10b981 transparent !important;
        }
    `;
    document.head.appendChild(style);
};

/**
 * healthAlert: Futuristic healthcare-themed SweetAlert
 */
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

    // return MySwal.fire({
    //     title,
    //     text,
    //     html,
    //     icon,
    //     showCancelButton,
    //     confirmButtonText,
    //     cancelButtonText,
    //     timer,
    //     timerProgressBar,
    //     ...healthTheme,
    //     ...rest,
    // });
// };
// export const healthAlert = ({
//     title = "Success",
//     text = "",
//     type = "success",
//     timer = 3000
// }) => {

//     const colorMap = {
//         success: "#10b981",
//         error: "#ef4444",
//         warning: "#f59e0b",
//         info: "#3b82f6"
//     };

//     const alert = document.createElement("div");

//     alert.innerHTML = `
//         <div style="
//             position: fixed;
//             inset: 0;
//             background: rgba(0,0,0,0.4);
//             backdrop-filter: blur(6px);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             z-index: 9999;
//         ">

//             <div style="
//                 width: 320px;
//                 background: #ffffff;
//                 border-radius: 16px;
//                 padding: 20px;
//                 box-shadow: 0 20px 40px rgba(0,0,0,0.15);
//                 text-align: center;
//                 animation: popIn 0.3s ease;
//                 border-top: 4px solid ${colorMap[type]};
//                 font-family: 'Inter', sans-serif;
//             ">

//                 <!-- Icon -->
//                 <div style="
//                     width:60px;
//                     height:60px;
//                     margin:0 auto 10px;
//                     border-radius:50%;
//                     background:${colorMap[type]}20;
//                     display:flex;
//                     align-items:center;
//                     justify-content:center;
//                     font-size:28px;
//                     color:${colorMap[type]};
//                     animation: pulse 1.5s infinite;
//                 ">
//                     ✔
//                 </div>

//                 <!-- Title -->
//                 <div style="
//                     font-size:18px;
//                     font-weight:600;
//                     color:#111827;
//                     margin-bottom:6px;
//                 ">
//                     ${title}
//                 </div>

//                 <!-- Text -->
//                 <div style="
//                     font-size:14px;
//                     color:#6b7280;
//                     margin-bottom:16px;
//                 ">
//                     ${text}
//                 </div>

//                 <!-- Button -->
//                 <button id="closeAlertBtn" style="
//                     width:100%;
//                     background:${colorMap[type]};
//                     color:white;
//                     border:none;
//                     padding:10px;
//                     border-radius:8px;
//                     cursor:pointer;
//                     font-weight:500;
//                     transition:0.2s;
//                 ">
//                     OK
//                 </button>

//             </div>
//         </div>

//         <style>
//             @keyframes popIn {
//                 from { transform: scale(0.8); opacity:0 }
//                 to { transform: scale(1); opacity:1 }
//             }

//             @keyframes pulse {
//                 0%,100% { transform: scale(1); }
//                 50% { transform: scale(1.1); }
//             }
//         </style>
//     `;

//     document.body.appendChild(alert);

//     // Close button
//     alert.querySelector("#closeAlertBtn").onclick = () => {
//         alert.remove();
//     };

//     // Auto close
//     if (timer) {
//         setTimeout(() => {
//             alert.remove();
//         }, timer);
//     }
// };
export const healthAlert = ({
    title = "Success",
    text = "",
    type = "success",
    timer = 4000
    
}) => {
    return new Promise((resolve) => {
    const alert = document.createElement("div");

    alert.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">

            <div style="
                width: 340px;
                background: rgba(255,255,255,0.9);
                border-radius: 18px;
                padding: 20px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                animation: popIn 0.4s ease;
                font-family: 'Inter', sans-serif;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">

                
                <div style="
                    position:absolute;
                    top:0;
                    left:0;
                    right:0;
                    height:4px;
                    background: linear-gradient(90deg,#10b981,#059669,#10b981);
                    animation: shimmer 3s infinite linear;
                "></div>

            
                <img src="/images/LMC_logo.webp" style="
                    width:70px;
                    margin:0 auto 10px;
                    animation:pulse 1.5s infinite;
                "/>

               
                <div style="
                    font-size:18px;
                    font-weight:600;
                    color:#111827;
                    margin-bottom:6px;
                ">
                    ${title}
                </div>

                
                <div style="
                    font-size:14px;
                    color:#6b7280;
                    margin-bottom:16px;
                ">
                    ${text}
                </div>

              
                <svg viewBox="0 0 200 40" style="width:100%; margin-bottom:12px;">
                    <polyline 
                        fill="none" 
                        stroke="#22c55e" 
                        stroke-width="2"
                        points="0,20 20,20 30,5 40,35 50,20 70,20 80,10 90,30 100,20 200,20"
                        class="ecg-line"
                    />
                </svg>

               
             ${type === "confirm" ? `
<div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">

    <button id="confirmBtn" style="
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 10px 16px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 500;
    ">
        Confirm
    </button>

    <button id="cancelBtn" style="
        background: #f3f4f6;
        color: #374151;
        padding: 10px 16px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 500;
    ">
        Cancel
    </button>

</div>
` : `
<button id="closeBtn" style="
    width:100%;
    background:#10b981;
    color:white;
    border:none;
    padding:10px;
    border-radius:10px;
    cursor:pointer;
    font-weight:500;
">
    OK
</button>
`}
                
              

            </div>
        </div>

        <style>
            @keyframes popIn {
                from { transform: scale(0.8); opacity:0 }
                to { transform: scale(1); opacity:1 }
            }

            @keyframes pulse {
                0%,100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes shimmer {
                0% { background-position: 0% }
                100% { background-position: 200% }
            }

            .ecg-line {
                stroke-dasharray: 300;
                stroke-dashoffset: 300;
                animation: ecgMove 2s linear infinite;
                filter: drop-shadow(0 0 6px #22c55e);
            }

            @keyframes ecgMove {
                0% { stroke-dashoffset: 300; }
                100% { stroke-dashoffset: 0; }
            }
        </style>
    `;

    document.body.appendChild(alert);

    // alert.querySelector("#closeAlertBtn").onclick = () => {
    //     alert.remove();
    // };
    // Confirm
if (type === "confirm") {

    alert.querySelector("#confirmBtn").onclick = () => {
        alert.remove();
        resolve({ isConfirmed: true });
    };

    alert.querySelector("#cancelBtn").onclick = () => {
        alert.remove();
        resolve({ isConfirmed: false });
    };

} else {

    alert.querySelector("#closeBtn").onclick = () => {
        alert.remove();
        resolve({ isConfirmed: true });
    };
}
});
};

export const healthAlerts = {
    success: (message, title = "Success") =>
        healthAlert({ title, text: message }),

    error: (message, title = "Error") =>
        healthAlert({ title, text: message }),

    warning: (message, title = "Warning") =>
        healthAlert({ title, text: message }),

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
    title: "",
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:10px;">
            
            
            <img src="/images/LMC_logo.webp" style="width:120px;animation:pulse 1.5s infinite;" />

            
            <div style="font-size:14px;color:#4b5563;">${message}</div>

            
            <svg viewBox="0 0 200 40" style="width:200px;">
                <polyline 
                    fill="none" 
                    stroke="#22c55e" 
                    stroke-width="2"
                    points="0,20 20,20 30,5 40,35 50,20 70,20 80,10 90,30 100,20 200,20"
                    class="ecg-line"
                />
            </svg>

        </div>

        <style>
            .ecg-line {
                stroke-dasharray: 300;
                stroke-dashoffset: 300;
                animation: ecgMove 2s linear infinite;
                filter: drop-shadow(0 0 6px #22c55e);
            }

            @keyframes ecgMove {
                0% {
                    stroke-dashoffset: 300;
                }
                100% {
                    stroke-dashoffset: 0;
                }
            }

            @keyframes pulse {
                0%,100% { transform: scale(1); }
                50% { transform: scale(1.08); }
            }
        </style>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
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
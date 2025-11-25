import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const defaultTheme = {
    confirmButtonColor: "#0ea5e9", // sky-500 color
    cancelButtonColor: "#f87171",  // red-400
    background: "#f0f9ff",         // light healthcare background
    color: "#0369a1",              // primary text color
    showClass: { popup: "animate__animated animate__fadeInDown" },
    hideClass: { popup: "animate__animated animate__fadeOutUp" },
};

export const healthAlert = ({
    title = "Notice",
    text = "",
    icon = "info", // info, warning, success, error, question
    showCancelButton = false,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
    ...rest
}) => {
    return MySwal.fire({
        title,
        text,
        icon,
        showCancelButton,
        confirmButtonText,
        cancelButtonText,
        ...defaultTheme,
        ...rest,
    });
};

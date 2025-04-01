import mitt from "mitt";

type ToastEvent = {
  showToast: { 
    message: string; 
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  };
};

export const emmiter = mitt<ToastEvent>();

import mitt from "mitt";

type ToastEvent = {
  showToast: { message: string; type: "success" | "error" };
};

export const emmiter = mitt<ToastEvent>();

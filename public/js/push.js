const checkPushSupport = () => {
  return (
    "PushManager" in window &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
};

const isNotifiable = async () => {
  const permission = window.Notification.permission;
  return permission === "granted";
};

const requestPermission = async () => {
  const permission = await window.Notification.requestPermission();
  return permission === "granted";
};

const registerWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage("READY");
    });

    if (registration.installing) {
      console.log("[my-attendance] Worker Installing . . .");
    } else if (registration.waiting) {
      console.log("[my-attendance] Worker Installed . . .");
    } else if (registration.active) {
      console.log("[my-attendance] Worker Active . . .");
    }
  } catch (error) {
    console.error("[my-attendance] Worker Cannot be Installed . . .", error);
  }
};

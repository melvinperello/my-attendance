// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
// saveSubscription saves the subscription to the backend
const saveSubscription = async (subscription) => {};

self.addEventListener("install", function (event) {
  console.log("[my-attendance] install . . .");
});

self.addEventListener("activate", async () => {
  console.log("[my-attendance] active . . .");
  // This will be called only once when the service worker is activated.
  try {
    const applicationServerKey = urlB64ToUint8Array(
      "BCjKPQhWgANibKFFEXU1CINfQRtYFJEXBd7bZ00ey2tOGy3sLdR6jxItiXgqCvg-tJmK_pfLU9wQbgNriOb5Oyk"
    );
    const options = { applicationServerKey, userVisibleOnly: true };
    const subscription = await self.registration.pushManager.subscribe(options);
    const response = await fetch("/api/save-subscription", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
    const data = await response.json();
    console.log("[my-attendance] Push Service Response: ", data);
  } catch (err) {
    console.log("[my-attendance] Push Service Error: ", err);
  }
});

self.addEventListener("push", function (event) {
  const options = {
    body: event?.data?.text() || "No message",
    icon: "https://our-attendance-33tuv2yxsq-as.a.run.app/public/images/logo-128.png",
  };
  self.registration.showNotification("[Reminder] our-attendance", options);
});

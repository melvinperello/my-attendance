const checkPushManager = async () => {
  if (
    "PushManager" in window &&
    "Notification" in window &&
    "serviceWorker" in navigator
  ) {
    // Push Manager Feature available.
    // request for permission
    // if no permission make user dumb.
    if (
      window.Notification.permission === "denied" ||
      window.Notification.permission === "default"
    ) {
      document.getElementById("index_main").innerHTML =
        "ENABLE NOTIFICATIONS PERMISSION!";
    }

    if (window.Notification.permission !== "granted") {
      const permission = await window.Notification.requestPermission();
      // value of permission can be 'granted', 'default', 'denied'
      // granted: user has accepted the request
      // default: user has dismissed the notification permission popup by clicking on x
      // denied: user has denied the request.
      if (permission !== "granted") {
        return;
      }
    }
    // Yey,granted
    // register service worker.
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
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
  }
};

checkPushManager();

$(function () {
  const token = $.cookie("token");
  if (token) {
    window.location.href = "/main?token=" + token;
  }

  $("#msg_not_exists").css("visibility", "hidden");
  $("#frm_login").submit(async function (event) {
    event.preventDefault();
    $("#btn_submit").prop("disabled", true);
    // -------------------------------------------------
    // Service Worker Installation
    // -------------------------------------------------
    // await main();
    // -------------------------------------------------
    const data = $("#frm_login")
      .serializeArray()
      .reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
    // AJAX HERE
    $.ajax({
      url: "/api/check",
      type: "POST",
      data: JSON.stringify({
        username: data.txt_username,
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    })
      .done(function (res) {
        if (res.code === 200) {
          window.location.href = "/pre-register/" + res.data.username;
        }
      })
      .fail(function (xhr) {
        if (xhr.status === 404) {
          $("#msg_not_exists").css("visibility", "visible");
        } else if (xhr.status === 400) {
          window.location.href = "/login/" + xhr.responseJSON.data.username;
        }
        $("#btn_submit").prop("disabled", false);
      });
  });
});

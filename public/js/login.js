$(function () {
  $("#msg_not_exists").css("visibility", "hidden");
  $("#frm_login").submit(async function (event) {
    event.preventDefault();

    if (checkPushSupport()) {
      if (isNotifiable()) {
        console.log("[Push] Not Notifiable");
        const allowed = await requestPermission();
        if (!allowed) {
          console.log("[Push] Rejected");
          return; //
        } else {
          registerWorker();
        }
      }
    } else {
      console.log("[Push] Not Supported");
    }
    //
    $("#btn_submit").prop("disabled", true);
    const data = $("#frm_login")
      .serializeArray()
      .reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
    // AJAX HERE
    $.ajax({
      url: "/api/login",
      type: "POST",
      data: JSON.stringify({
        code: data.txt_code,
        username: data.txt_username,
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    })
      .done(function (res) {
        window.location.href = "/main";
      })
      .fail(function (xhr) {
        $("#msg_not_exists").css("visibility", "visible");
        $("#btn_submit").prop("disabled", false);
      });
  });
});

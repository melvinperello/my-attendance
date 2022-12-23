$(function () {
  $("#btn_submit").prop("disabled", false);

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
          $("#msg_not_exists").prop("hidden", false);
        } else if (xhr.status === 400) {
          window.location.href = "/login/" + xhr.responseJSON.data.username;
        }
        $("#btn_submit").prop("disabled", false);
      });
  });
});

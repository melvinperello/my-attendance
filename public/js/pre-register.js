$(function () {
  $("#msg_not_exists").css("visibility", "hidden");
  $("#frm_login").submit(function (event) {
    event.preventDefault();
    $("#btn_submit").prop("disabled", true);
    const data = $("#frm_login")
      .serializeArray()
      .reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
    // AJAX HERE
    $.ajax({
      url: "/api/register",
      type: "POST",
      data: JSON.stringify({
        code: data.txt_code,
        username: data.txt_username,
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (res) {
        const data = res.message;
      },
    })
      .done(function (res) {
        if (res.code === 200) {
          window.location.href = "/login/" + res.data.username;
        }
      })
      .fail(function (xhr) {
        $("#msg_not_exists").css("visibility", "visible");
        $("#btn_submit").prop("disabled", false);
      });
  });
});

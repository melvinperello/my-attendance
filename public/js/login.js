$(function () {
    const token = $.cookie('token');
    if(token){
      window.location.href = "/main?token=" + token;
    }
    
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
          const date = new Date();
          const minutes = 15;
          date.setTime(date.getTime() + minutes * 60 * 1000);
          $.cookie("token", res.data.token, { expires: date, path: "/" });
          window.location.href = "/main?token=" + res.data.token;
        })
        .fail(function (xhr) {
          $("#msg_not_exists").css("visibility", "visible");
          $("#btn_submit").prop("disabled", false);
        });
    });
  });
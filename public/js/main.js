$(function () {
  $("#btn_present").prop("disabled", false);
  $("#btn_sl").prop("disabled", false);
  $("#btn_el").prop("disabled", false);

  $("#lbl_date").text(moment().format("MMMM DD, YYYY"));
  $("#lbl_time").text(moment().format("h:mm a"));
  const timer = setInterval(function () {
    $("#lbl_date").text(moment().format("MMMM DD, YYYY"));
    $("#lbl_time").text(moment().format("h:mm a"));
  }, 1000);
  //
  $("#btn_present").click(function () {
    $("#lbl_selected").text("PRESENT");
  });
  $("#btn_sl").click(function () {
    $("#lbl_selected").text("SICK_LEAVE");
  });
  $("#btn_el").click(function () {
    $("#lbl_selected").text("EMERGENCY_LEAVE");
  });

  //
  $("#btn_attendance_confirm").click(function () {
    $("#btn_present").prop("disabled", true);
    $("#btn_sl").prop("disabled", true);
    $("#btn_el").prop("disabled", true);
    const selected = $("#lbl_selected").text();
    $.ajax({
      url: "/main/api/attendance",
      type: "POST",
      data: JSON.stringify({
        selected: selected,
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    }).always(function () {
      window.location.reload();
    });
  });
});

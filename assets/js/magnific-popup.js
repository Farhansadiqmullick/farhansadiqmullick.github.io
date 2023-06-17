(function ($) {
  $(document).ready(function () {
    $(".image-popup-no-margins").magnificPopup({
      type: "image",
      closeOnContentClick: true,
      closeBtnInside: false,
      fixedContentPos: true,
      mainClass: "mfp-img-mobile mfp-with-zoom", // class to remove default margin from left and right side
      image: {
        verticalFit: true,
      },
      zoom: {
        enabled: true,
        duration: 300, // don't foget to change the duration also in CSS
      },
    });

    $("form").on("submit", function (e) {
      e.preventDefault();
      let name = document.getElementById("name").value;
      let email = document.getElementById("email").value;
      let message = document.getElementById("message").value;
      let finalmessage = `Name : ${name} <br>  Email : ${email} <br>  Message : ${message} <br>`;
      Email.send({
        SecureToken: "4a2a51f1-0c4d-415e-8ec9-246caaa85121",
        To: "farhansadiq24@gmail.com",
        From: "info@farhanmullick.com",
        Subject: "Email come from the website",
        Body: finalmessage,
      }).then( function(message){
        alert("Message Sent Successfully.");
       document.getElementById("name").value = '';
       document.getElementById("email").value = '';
       document.getElementById("message").value = '';
      }).catch((err) => "Message sent has been failed, error code: "+err);
    });
  });
})(jQuery);

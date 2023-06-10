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

    function sendEmail() {
      let name = document.getElementById("name").value;
      let email = document.getElementById("email").value;
      let message = document.getElementById("message").value;
      let finalmessage = `Name : ${name} <br>  Email : ${email} <br>  Message : ${message} <br>`;
      Email.send({
        SecureToken: "01c2cfc6-210a-4abe-b71d-5dee3c264d55",
        To: "farhansadiq24@gmail.com",
        From: "info@farhanmullick.com",
        Subject: "Email come from the website",
        Body: finalmessage,
      }).then((message) => alert(message));
    }
  });
})(jQuery);

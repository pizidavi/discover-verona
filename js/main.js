// main.js

// Modifica le informazioni di contatto
const CONTACT = {
  email: "discover.cusverona@gmail.com"
};
const WHERE = {
  text: 'Parco San Giacomo, Verona',
  mapsLink: 'https://goo.gl/maps/UsZZHLuT4jB57wjt5',
};
const WHEN = [
  {
    weekday: 'Lunedì',
    time: ['19:30', '21:30']
  },
  {
    weekday: 'Giovedì',
    time: ['19:30', '21:30']
  },
];
const SOCIAL = {
  facebook: 'https://www.facebook.com/DiscoverUltimateVerona',
  instagram: 'https://www.instagram.com/discover_ultimate_verona',
};
// ---

$(document).ready(function() {

  $('[data-contact-email]').text(CONTACT.email);
  $('a[data-contact-email]').attr('href', 'mailto:'+CONTACT.email);

  $('[data-where]').text(WHERE.text);
  $('a[data-where]').attr('href', WHERE.mapsLink);

  $('[data-when]').each(function(index) {
    const _this = $(this);
    _this.find('[data-weekday]').text(WHEN[index].weekday);
    _this.find('[data-time] b').each(function(i) {
      $(this).text(WHEN[index].time[i]);
    });
    // _this.find('[data-time]').html('Dalle <b>'+WHEN[index].time[0]+'</b> alle <b>'+WHEN[index].time[1]+'</b>');
  });

  $('a[data-social-facebook]').attr('href', SOCIAL.facebook);
  $('a[data-social-instagram]').attr('href', SOCIAL.instagram);

  let video_forced_pause = false;
  const video = $('#video-background video');
  $('#video-background .video-control').on('click', () => {
    if (video.get(0).paused) {
      video.trigger('play');
      video_forced_pause = false;
    } else {
      video.trigger('pause');
      video_forced_pause = true;
    }
  });

  $('.popup-with-zoom-anim').magnificPopup({
    type: 'inline',
    fixedContentPos: false,
    fixedBgPos: true,
    overflowY: 'auto',
    closeBtnInside: true,
    preloader: false,
    midClick: true,
    removalDelay: 300,
    mainClass: 'my-mfp-zoom-in',
    callbacks: {
      open: () => video.trigger('pause'),
      close: () => {
        if (!video_forced_pause)
          video.trigger('play')
      },
    }
  });

  $("#slider3").responsiveSlides({
    auto: true,
    pager: false,
    nav: false,
    speed: 500,
    namespace: "callbacks"
  });

  $('#horizontalTab').easyResponsiveTabs({
    type: 'default',      
    width: 'auto',
    fit: true,
    closed: 'accordion',
    activate: function (e) {
      const tab = $(this);
      const tabId = tab.attr('aria-controls')?.split('-')[1];
      umami.trackEvent('tab-'+tabId, 'click');
    }
  });

  $('#year').text(new Date().getFullYear());
});
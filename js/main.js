// main.js
const now = new Date();

$(document).ready(function () {
  let video_forced_pause = false;

  const video = $('.video-background video');
  $('.video-background .video-control').on('click', () => {
    if (video.get(0).paused) {
      video.trigger('play');
      video_forced_pause = false;
      umami.trackEvent('video-control', { type: 'click', action: 'playing' });
    } else {
      video.trigger('pause');
      video_forced_pause = true;
      umami.trackEvent('video-control', { type: 'click', action: 'paused' });
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
      const tabId = (tab.attr('aria-controls') || '').split('-')[1];
      umami.trackEvent('change-about-tab', { type: 'click', tabId: tabId });
    }
  });

  $('.btn-show').each(function () {
    $(this).on('click', function () {
      const target = $(this).attr('data-target');
      $(target).toggleClass('show-more');
    })
  });

  $('#year').text(new Date().getFullYear());

  $('[data-countdown]').each(function () {
    const _this = $(this);
    const date = new Date(_this.attr('data-countdown'));
    if (now > date) {
      _this.closest('[data-event-title]').remove();
      return;
    }

    CountDown(_this, date);
    _this.removeClass('hidden');
  });
});

$(window).on('load', function () {
  $('iframe').each(function () {
    const _this = $(this);
    _this.attr('src', _this.attr('data-src'));
  });
});

/**
 * CountDown constructor
 * @param {HTMLDivElement} countdown 
 * @param {Date} date 
 */
const CountDown = (countdown, date) => {
  const selector = 'data-countdown-text';

  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;
  const time = date.getTime();

  const setTime = () => {
    const now = new Date().getTime();
    const distance = time - now;

    countdown.find(`[${selector}="days"]`).text(Math.floor(distance / (day)));
    countdown.find(`[${selector}="hours"]`).text(Math.floor((distance % (day)) / (hour)));
    countdown.find(`[${selector}="minutes"]`).text(Math.floor((distance % (hour)) / (minute)));
    countdown.find(`[${selector}="seconds"]`).text(Math.floor((distance % (minute)) / second));

    return distance < 0;
  };

  setTime();
  const x = setInterval(() => {
    const stop = setTime();
    if (stop) {
      countdown.addClass('hidden');
      clearInterval(x);
    }
  }, 1000);
};

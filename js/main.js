// main.js

// Modifica
const OPEN_DAYS = [
  '2022-09-26 19:30',
  '2022-10-06 19:30'
];
// ---

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

  const now = new Date();
  const day = OPEN_DAYS
    .map(d => new Date(d))
    .filter(d => d - now >= 0)
    .sort((a,b) => a - b)[0];
  if (day) {
    $('#countdown-open-day').removeClass('hidden');
    CountDown('#countdown-open-day', day);
  }

  CountDown('#countdown-hat', new Date('2022-10-16 9:00'));
});

$(window).on('load', function () {
  $('iframe').each(function () {
    const _this = $(this);
    _this.attr('src', _this.attr('data-src'));
  });
});

const CountDown = (selector, date) => {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

  const countdown = $(selector);
  const time = date.getTime();

  const x = setInterval(() => {
    const now = new Date().getTime();
    const distance = time - now;

    countdown.find('[data-countdown-text="days"]').text(Math.floor(distance / (day)));
    countdown.find('[data-countdown-text="hours"]').text(Math.floor((distance % (day)) / (hour)));
    countdown.find('[data-countdown-text="minutes"]').text(Math.floor((distance % (hour)) / (minute)));
    countdown.find('[data-countdown-text="seconds"]').text(Math.floor((distance % (minute)) / second));

    if (distance < 0) {
      countdown.remove();
      clearInterval(x);
    }
  }, 1000);
};

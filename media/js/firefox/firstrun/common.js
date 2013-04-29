;(function($) {
  'use strict';

  var $video_container = $('#video-container');
  var $video = $('#pinnedtabs-video');
  var $video_content;
  var video_closing = false;

  if ($('html').hasClass('osx')) {
    $video.attr('src', 'https://videos-cdn.mozilla.net/serv/drafts/pinnedtabs-mac.webm');
  } else {
    $video.attr('src', 'https://videos-cdn.mozilla.net/serv/drafts/pinnedtabs-win.webm');
  }

  window.gaq_track = function(category, action, label) {
    if (window._gaq) {
      _gaq.push(['_trackEvent', category, action, label]);
    }
  };

  // delay redirect so GA tracking has time to fire
  var track_and_redirect = function(category, action, label, url) {
    gaq_track(category, action, label);

    setTimeout(function() {
      window.location.href = url;
    }, 500);
  };

  // video should be positioned directly over pinned tabs screenshot
  var position_video = function() {
    var pos = $('#pinnedtabs-screenshot').offset();
    var scroll_top = $(window).scrollTop();

    var top = pos.top - scroll_top;
    var left = pos.left;

    $video.css({
      'top': top,
      'left': left
    });

    $('#modal-close').css({
      'top': (top - 16),
      'left': (left + $video.width() - 4)
    });
  };

  var reattach_video = function() {
    // to avoid tracking video pause event fired when modal closes
    if (!$video[0].paused) {
      video_closing = true;
    }
    $video_container.append($video_content);
  };

  $('a[href="#pinnedtabs-video"]').on('click', function(e) {
    e.preventDefault();

    $video_content = $video.detach();

    Mozilla.Modal.create_modal(this, $video_content, position_video, reattach_video);

    gaq_track('first run interaction', 'open video', 'Pinned Tabs Video');
  });

  // GA tracking
  $('a.featurelink').on('click', function(e) {
    e.preventDefault();
    track_and_redirect('first run interaction', 'click', $(this).attr('href'), $(this).attr('href'));
  });

  $('.social a').on('click', function(e) {
    e.preventDefault();
    track_and_redirect('social interaction', 'click', $(this).attr('class'), $(this).attr('href'));
  });

  $video.on('play', function() {
    gaq_track("first run interaction", "play", "Pinned Tabs Video");
  }).on('pause', function() {
    // video pause event is fired when modal closes
    // do not track this particular pause event
    if (!video_closing) {
      gaq_track("first run interaction", "pause", "Pinned Tabs Video");
      video_closing = false;
    }
  }).on('ended', function() {
    gaq_track("first run interaction", "finish", "Pinned Tabs Video");
  });

  $('#footer_email_submit').on('click', function(e) {
    // if form is valid, delay submission to wait for GA tracking
    if ($('#footer-email-form')[0].checkValidity()) {
      e.preventDefault();

      gaq_track("Newsletter Registration", "submit", "Registered for Firefox Updates");

      setTimeout(function() {
        $('#footer-email-form').submit();
      }, 500);
    }
  });
})(window.jQuery);
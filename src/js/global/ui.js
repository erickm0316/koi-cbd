import { $doc, $win } from './selectors';

export const breakpoints = {
  sm: 580,
  md: 767,
  lg: 992,
  xl: 1199,
};

const $tiltTargets = $('.k-tilt');
const $blogFilterBy = $('.k-blognav--filterby select');

function slugify(string) {
  return string.replace(/ /g, '-').toLowerCase();
}

function initializeTilt() {
  if ($win.width() < breakpoints.md || !$tiltTargets.length) return;

  const tiltProps = {
    maxTilt: 5,
    speed: 1200,
    easing: 'cubic-bezier(0.075,  0.820, 0.165, 1.000)',
  };

  $tiltTargets.tilt(tiltProps);
}

$blogFilterBy.change(function() {
  const $t = $(this);
  const selectedCategory = $t.val();
  const slugified = slugify(selectedCategory);

  window.location.href = `${window.SITE_GLOBALS.root}/blog?category=${slugified}`;
});

$doc.ready(initializeTilt);

$doc.ready(function() {
  const selectedCategory = new URLSearchParams(window.location.search).get('category');
  const $optionEls = $blogFilterBy.find('option');
  const slugifiedOptions = [
    ...$optionEls
  ].map(({ value }) => slugify(value));

  slugifiedOptions.forEach((option, idx) => {
    if (option == selectedCategory) {
      $($optionEls[idx]).attr('selected', true);
    }
  });
});
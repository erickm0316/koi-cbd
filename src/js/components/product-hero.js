import $ from 'jquery';
import { $doc } from '../global/selectors';
import wasEnter from '../helpers/wasEnter';
import preventScrollOnDrag from '../helpers/FlickityEvents';

const $productHero = $('.k-producthero');
const $productHeroCarousel = $('.k-producthero--gallery');
const $variantSelects = $(
  '.k-productform--variants .k-productform--variantselect'
);
const $productLabels = $('.k-productform--varianttoggle');
const $productForm = $('.k-productform');
const $priceTarget = $('.k-productform--pricetarget');
const $pricePrefix = $('#k-bundle-price-prefix');
const $bundledItemSelects = $(
  '.k-producthero--bundle .k-productform--select-bundled-item'
);
const $bundleOptionLabels = $(
  '.k-producthero--bundle .k-productform--bundleselect__item > label'
);
const $bundledVariants = $(
  '.k-producthero--bundle .k-productform--varianttoggle'
);
const $addToCartTrigger = $('.k-productform .k-add-to-cart');
const $quantity = $('#k-num-to-add');
const $prev = $productHeroCarousel.find('.k-producthero__prev');
const $next = $productHeroCarousel.find('.k-producthero__next');
const $selectRelatedItem = $productForm.find('select');
const $fullPrice = $productForm.find('.k-productform--fullprice');
const bundleFullPrice = $fullPrice.html();

function getFirstAvailableVariant() {
  let first = null;

  $variantSelects.each(function() {
    // can't return from a jQuery each().
    if (!$(this).data('outOfStock') && first === null) {
      first = $(this);
    }
  });

  return first;
}

$quantity.change(function() {
  checkQuantityAgainstPrice();
});

$productLabels.click(event => {
  // this propagation path triggered setVariants() an additional time.
  event.stopPropagation();
});

function checkQuantityAgainstPrice() {
  if ($quantity.val() < 0 || $quantity.val() == NaN || !$quantity.val()) {
    $quantity.val(1);
  }

  let quantity = parseInt($quantity.val());
  let price = $quantity.data('variant-price');

  if (quantity && price) {
    $priceTarget.text(`$${(quantity * price).toFixed(2)}`);
  }
}

$variantSelects.click(function(e) {
  setVariant($(this));
});

$variantSelects.keypress(function(e) {
  if (wasEnter(e)) {
    setVariant($(this), true);
  }
});

function setVariant(context, wasKeypress = false) {
  // the div gets the click, but the data we want is on the label.
  let $t = context.find('.k-productform--varianttoggle');

  if (wasKeypress) {
    const $checkbox = context.find('input');
    $checkbox.prop('checked', !$checkbox[0].checked);
  }

  // if variant is out of stock, disable the button.
  if (context.data('outOfStock')) {
    $addToCartTrigger.attr('disabled', 'disabled');
  } else if ($addToCartTrigger.attr('disabled')) {
    $addToCartTrigger.removeAttr('disabled');
  }

  // select the corresponding gallery image.
  window.__flkty.selectCell(
    `${window.__flkty.options.cellSelector}[data-flickityselector*="${$t.data(
      'flickityselector'
    )}"]`
  );

  const variantPrice = $t.data('variant-price');
  const variantId = $t.data('variant-id');
  $priceTarget.text(`$${variantPrice}`);
  $quantity.data('variant-price', variantPrice);
  checkQuantityAgainstPrice();
  $addToCartTrigger.attr('data-product-id', variantId);
}

/**
 * Handle drawer state when selecting an item from a Product Bundle
 */
$bundledItemSelects.click(function() {
  handleBundleOption($(this));
});

$bundleOptionLabels.keypress(function(e) {
  if (wasEnter(e)) {
    const $checkbox = $(this).siblings('input');
    $checkbox.prop('checked', !$checkbox[0].checked);
    handleBundleOption($checkbox);
  }
});

function handleBundleOption(contextElement) {
  const $t = contextElement;

  const $targetDrawer = $t.siblings().last();
  const targetHeight = $targetDrawer
    .children()
    .first()
    .outerHeight();

  if ($t.is(':checked')) {
    const $labels = $targetDrawer.find('label');
    // make open labels tab accessible
    $labels.attr('tabindex', '0');

    $targetDrawer.height(targetHeight);
  } else {
    /**
     * When the user un-selects a bundled item, we need to remove the selected variant
     * of that previously selected bundled item. That way we can correctly calculate the
     * price visually.
     *
     * EG: User initially selects a "Lemon-Lime" tincture as part of this bundle, and
     *     selects a variant for the tincture; "250mg".
     *
     *     The user later removes the "Lemon-Lime" tincture from their selections.
     *
     *     In this case, we need to remove the active class from the variant ("250mg") from
     *     the bundled item ("Lemon-Lime" tincture) so that the final price calc works as
     *     expected.
     *
     *     The final price calc looks at bundled item variants that have the class
     *     ".bundled-variant-selected"
     */

    // Find selected variant for this bundled item
    const _variantSelects = $t
      .siblings()
      .find('.k-productform--varianttoggle.bundled-variant-selected');

    // remove 'checked' attr from sibling <input />
    _variantSelects.prev().prop('checked', false);

    // remove active class from selected variants
    _variantSelects.removeClass('bundled-variant-selected');
    $targetDrawer.height(0);

    // make closed labels non-tabbable
    const $closedLabels = $targetDrawer.find($bundledVariants);
    $closedLabels.attr('tabindex', '-1');
  }
}

/**
 * It's possible for users to select another flavor of tinctures from a
 * tincture's detail page. When the user is sent to the new page, use
 * their existing quantity/flavor selections from the previous product.
 */
function handlePopulatedParams() {
  const url = new URL(window.location.href);
  const selectedVariantIdx = url.searchParams.get('selectedVariant');
  const selectedQuantity = url.searchParams.get('quantity');

  if (selectedVariantIdx && selectedQuantity) {
    window.__populatedParams = true;
    $variantSelects.each(function(i, el) {
      // uncheck all others
      const $t = $(el);

      $t.find('input').prop('checked', false);
    });

    const $inputToSelect = $($variantSelects[selectedVariantIdx]).find('input');

    $quantity.val(selectedQuantity);
    $inputToSelect.prop('checked', true);

    if (window.__flkty) {
      window.__flkty.selectCell(
        `${
          window.__flkty.options.cellSelector
        }[data-flickityselector*="${$inputToSelect
          .siblings('label')
          .data('flickityselector')}"]`
      );
    }
  }
}

$bundledVariants.keypress(function(e) {
  if (wasEnter(e)) {
    const $checkbox = $(this).siblings('input');
    $checkbox.prop('checked', !$checkbox[0].checked);
  }
});

/**
 * This calculates the final price (visually, doesn't affect price for actual payment)
 * to be shown in the Product Hero after a user has selected the minimum number of items
 * in a Product Bundle.
 */
$bundledVariants.click(function(e) {
  const $t = $(this);
  const $inputSibling = $t.siblings('input');

  const transferAttributes = [
    {
      original: 'data-variant-price',
      set: 'data-variant-price',
    },
    {
      original: 'data-variant-strength',
      set: 'data-variant-strength',
    },
    {
      original: 'data-variant-id',
      set: 'data-variant-id',
    },
    {
      original: 'value',
      set: 'data-value',
    },
    {
      original: 'data-parent-id',
      set: 'data-parent-id',
    },
    {
      original: 'data-bundle-key',
      set: 'data-bundle-key',
    },
    {
      original: 'data-full-price',
      set: 'data-full-price',
    },
  ];

  const $container = $t.closest('.k-productform--bundleselect__item--flex');
  const $quantityInput = $container.find('.k-bundle-quantity');

  transferAttributes.forEach(dataAttribute => {
    $quantityInput.attr(
      dataAttribute.set,
      $inputSibling.attr(dataAttribute.original)
    );
  });

  $t.addClass('bundled-variant-selected');

  /**
   * Find other variant selects that may have been previously
   * selected and remove the active class from them.
   */
  $t.parent()
    .siblings()
    .find('.bundled-variant-selected')
    .removeClass('bundled-variant-selected');

  calculateDisplayPrice();
});

export function calculateDisplayPrice() {
  const $quantityInput = $('.k-bundle-quantity');
  /**
   * Keep track of selected variants and their costs
   * for outputting the price of the selected options.
   */
  let priceWithSelectedItems = 0;
  let fullPriceWithSelectedItems = 0;

  $quantityInput.each(function() {
    const $this = $(this);
    if ($this.val() > 0) {
      const variantPrice = $this.val() * parseFloat(this.dataset.variantPrice);
      priceWithSelectedItems += variantPrice;
      fullPriceWithSelectedItems +=
        $this.val() * parseFloat(this.dataset.fullPrice);
    }
  });

  priceWithSelectedItems = priceWithSelectedItems.toFixed(2);

  if (priceWithSelectedItems !== '0.00') {
    $pricePrefix.text('with selected items:');
    $priceTarget.text(`$${priceWithSelectedItems}`);
  } else {
    $pricePrefix.text('from');
    $priceTarget.text($priceTarget[0].dataset.bundlePrice);
  }

  /**
   * Ideally, this should be pulled from a data attribute
   * that's server rendered with the % value of the discount
   * set in WooCommerce.
   */
  const discount = '20% off!';
  const displayFullPrice = fullPriceWithSelectedItems.toFixed(2);

  $fullPrice.html(`
    ${
      displayFullPrice !== '0.00'
        ? `<span class="k-strikethrough">$${displayFullPrice}</span> ${discount}`
        : `${bundleFullPrice}`
    }
  `);
}

$doc.ready(function() {
  if (!$productHeroCarousel.length) return;

  window.__flkty = new Flickity($productHeroCarousel[0], {
    cellSelector: '.k-producthero--slide',
    pageDots: false,
    contain: true,
    dragThreshold: 10,
    imagesLoaded: true,
    prevNextButtons: false,
  });

  preventScrollOnDrag(window.__flkty);

  $prev.click(() => window.__flkty.previous());
  $next.click(() => window.__flkty.next());
  $prev.keypress(function(e) {
    if (wasEnter(e)) {
      window.__flkty.previous();
    }
  });
  $next.keypress(function(e) {
    if (wasEnter(e)) {
      window.__flkty.next();
    }
  });

  $variantSelects.each(function() {
    const $t = $(this);

    if (
      $t
        .siblings()
        .first()
        .is(':checked')
    ) {
      const variantPrice = $t.data('variant-price');
      const variantId = $t.data('variant-id');

      $quantity.data('variant-price', parseFloat(variantPrice));
      $priceTarget.text(`$${variantPrice}`);
      $addToCartTrigger.attr('data-product-id', variantId);
    }
  });

  /*
    for simple products: since no variantSelects exist, instead pull the product price for the priceTarget from the dataset.
  */
  if ($addToCartTrigger.data('price')) {
    $quantity.data(
      'variant-price',
      parseFloat($addToCartTrigger[0].dataset.price)
    );
  }

  if ($variantSelects.length > 0) {
    const $firstAvailableVariant = getFirstAvailableVariant();
    // the first available variant gets its input marked as checked from server-side.
    setVariant($firstAvailableVariant);
  }

  handlePopulatedParams();

  if (window.__populatedParams) {
    const dynamicQuantity = $quantity.val();
    const dynamicallySelectedVariantPrice = $('.k-productform--variants')
      .find('input:checked')
      .next()
      .data('variant-price');

    $priceTarget.text(
      `$${(dynamicQuantity * dynamicallySelectedVariantPrice).toFixed(2)}`
    );
  }
});

$selectRelatedItem.change(function(e) {
  const $t = $(this);

  let targetPermalink = '';
  let selectedVariantIdx = 0;
  let currentQuantity = 0;

  $variantSelects.each(function(i, item) {
    const $item = $(item);
    const isSelected = $item
      .find('input')
      .first()
      .is(':checked');

    if (isSelected) {
      selectedVariantIdx = i;
    }
  });

  $t.children().each(function(i, option) {
    const $opt = $(option);
    const permalink = $opt.data('permalink');

    if ($opt.is(':selected')) {
      targetPermalink = permalink;
    }
  });

  currentQuantity = $quantity.val();

  window.location.href = `${targetPermalink}?selectedVariant=${selectedVariantIdx}&quantity=${currentQuantity}`;
});

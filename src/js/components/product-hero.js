import { toggleCartSidebar } from '../global/cart-actions';
const productHero = document.querySelector('.single-product');

export default $ => {
  if (!productHero) return;
  const module = {
    $nodes: {
      form: $('form.cart'),
      imageContainer: $('.woocommerce-product-gallery__wrapper'),
      featuredImage: $(
        '.woocommerce-product-gallery__wrapper div[data-thumb]:first-of-type'
      ),
      imageLinks: $('.woocommerce-product-gallery__wrapper a'),
      bundleDropdownTriggers: $('.bundled_products .bundled_product_checkbox'),
      variantSelects: $('.k-productform__select-container select'),
      primaryPriceField: $('.summary .woocommerce-Price-amount'),
      variantStores: $('[data-product_variations]'),
      minMaxStore: $('.min_max_items'),
      flavorDropdown: $('.k-productform__flavorselect__main select'),
      variationTables: $('table.variations'),
    },

    data: {
      bundledProduct: false,
      productVariants: [],
      bundleSettings: {},
      lowestPrice: 0,
      regularPrice: 0,
      productID: 0,
    },

    hooks: {
      mounted: () => {
        const { methods, data, $nodes } = module;

        if (window.__openCart === true) {
          /**
           * Fires when the PDP is reloaded after being added to the cart.
           */
          $nodes.bundleDropdownTriggers.each(function() {
            const $this = $(this);
            if ($this.is(':checked')) {
              $this.prop('checked', !$this.prop('checked'));
            }
          });

          toggleCartSidebar(false, true);
        }

        if (document.querySelector('.bundled_products')) {
          data.bundledProduct = true;
          methods.setBundleSettings();
          methods.setProductVariants();
          methods.displayInitialPrice();
          methods.setDropdownText();
        }

        methods.setBlankAttr();
        methods.addListeners();
      },
    },

    methods: {
      addListeners: () => {
        const { methods } = module;
        const {
          bundleDropdownTriggers,
          variantSelects,
          imageLinks,
          flavorDropdown,
        } = module.$nodes;

        // flip dropdown arrow upside-down
        bundleDropdownTriggers.click(function() {
          const $label = $(this).closest('.bundled_product_optional_checkbox');
          $label.toggleClass('bundled_product_optional_checkbox--active');
        });

        // prevent opening image URLs entirely
        imageLinks.click(function() {
          event.preventDefault();
        });

        // change ::after color/padding when a value is selected
        variantSelects.change(function(index, el) {
          methods.checkValue($(this));
        });

        flavorDropdown.change(function() {
          methods.jumpToFlavor($(this));
        });
      },

      checkValue: $el => {
        if ($el.val()) {
          $el.parent().addClass('selected');
        } else {
          $el.parent().removeClass('selected');
        }
      },

      displayInitialPrice: () => {
        const { $nodes, data } = module;
        const { primaryPriceField } = $nodes;

        const cheapestAvailableVariants = [];

        data.productVariants.forEach(product => {
          cheapestAvailableVariants.push(product[0]);
        });

        cheapestAvailableVariants.forEach(variant => {
          data.lowestPrice += variant.price;
          data.regularPrice += parseFloat(variant.regular_price);
        });

        [data.lowestPrice, data.regularPrice] = [
          data.lowestPrice.toFixed(2),
          data.regularPrice.toFixed(2),
        ];

        primaryPriceField.html(/*html*/ `
          <span class="k-price-preheading"">from</span>
          ${data.currency}${data.lowestPrice}
          <span class="k-strikethrough">${data.currency}${data.regularPrice}</span>
        `);
      },

      jumpToFlavor: $this => {
        window.location.href = $this.val();
      },

      setBlankAttr: () => {
        const { $nodes } = module;
        $nodes.imageLinks.attr('target', '_blank');
        $nodes.imageLinks.attr('rel', 'noopener noreferrer');
      },

      setBundleSettings: () => {
        const { $nodes, data } = module;
        data.bundleSettings.min = $nodes.minMaxStore.data('min');
        data.bundleSettings.max = $nodes.minMaxStore.data('max');
      },

      setDropdownText: () => {
        /**
         * Client wants to change dropdown text that will affect bundles.
         * Currently, there are only two bundles where this text will be applicable.
         * To reduce future web edits to undo this change, just change it client-side
         * instead.
         */
        const { $nodes } = module;
        const { variationTables } = $nodes;

        variationTables.each(function(index, el) {
          const $this = $(el);
          const label = $this.find('label');

          if (label.length === 1) {
            const onlyOption = label.text().split(' ')[0];
            const dropdownLabel = $this
              .parent()
              .siblings('.bundled_product_optional_checkbox');
            const textNode = dropdownLabel.contents().last();
            textNode[0].textContent = onlyOption;

            if (onlyOption === 'Strength') {
              label.html(`
                Milligrams <abbr class="required">*</abbr>
              `);
            }
          }
        });
      },

      setProductVariants: () => {
        const { data } = module;
        const { primaryPriceField, variantStores } = module.$nodes;

        // set the currency symbol
        data.currency = primaryPriceField
          .find('.woocommerce-Price-currencySymbol')
          .text();

        /**
         * Gets the data dumped out by product-bundles
         * and sets it in module.data.productVariants
         */
        variantStores.each(function(index, el) {
          if (index < data.bundleSettings.max) {
            data.productVariants.push(
              JSON.parse(el.dataset.product_variations)
            );
          }
        });
      },
    },
  };
  module.hooks.mounted(module.$nodes);
};

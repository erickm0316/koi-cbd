<?php
/*
 * @see 	    https://docs.woocommerce.com/document/template-structure/
 * @package 	WooCommerce/Templates
 * @version     1.6.4
 */
if (!defined('ABSPATH')) {
	exit;
}

get_header();

while (have_posts()) : the_post();

  /* 
  * Multiple types of product classes are being used in this store.
  * Need to check or else some $product methods/props will produce a fatal error.
  *
  * I've found that there are at least two classes in play here:
  *
  * WC_Product_Variable - https://docs.woocommerce.com/wc-apidocs/class-WC_Product_Variable.html
  * and
  * WC_Product_Simple - https://docs.woocommerce.com/wc-apidocs/class-WC_Product_Simple.html
  */
  global $woocommerce;
  $all_variants;
  $all_image_ids;
  $all_bundled_items;

  if (get_class($product) === 'WC_Product_Variable') {
    // "variations" include their own attached images, we can get those from that object
    $all_variants = $product->get_available_variations();
  } else if (get_class($product) === 'WC_Product_Simple') {
    // assume this is not a Variable product, just get the images straight from the post
    $all_image_ids = $product->get_gallery_image_ids();
  } else if (get_class($product) === 'WC_Product_Bundle') {
    $all_bundled_items = $product->get_bundled_items();
  }

  $product_id = $product->get_id();
  $product_acf = get_fields();
  $product_type = get_the_terms($product->get_id(), 'product_cat')[0]->name;

  // NOTE: all `include`s get access to vars from this scope
  include(locate_template('partials/product-hero.php'));
  // WC()->cart->empty_cart();
  // WC()->cart->add_to_cart($product_id, 1, 205492);
  include(locate_template('partials/product-details.php'));
  include(locate_template('partials/product-latest-batch.php'));
  include(locate_template('partials/product-faq-accordion.php'));
  include(locate_template('partials/product-reviews.php'));
  include(locate_template('partials/product-video.php'));

  $slider_fields = array(
    'headline' => 'Shop Customer Favorites',
    'products' => $product_acf['other_recommended_products'],
  );

  include(locate_template('partials/promo-slider.php'));
  get_template_part('partials/cta-takeover');

endwhile;

get_footer();

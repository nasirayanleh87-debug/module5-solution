// script.js
// Make sure jQuery is loaded before this file

// Collapse mobile menu after click / blur
$(function () { // Same as document.addEventListener("DOMContentLoaded"...)
  $("#navbarToggle").blur(function () {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {

  var dc = {};

  // -------------------- URLs for snippets & data --------------------
  var homeHtmlUrl         = "snippets/home-snippet.html";
  var allCategoriesUrl    =
    "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml        = "snippets/category-snippet.html";
  var menuItemsUrl        =
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml  = "snippets/menu-items-title.html";
  var menuItemHtml        = "snippets/menu-item.html";

  // -------------------- Utility helpers --------------------

  // Insert HTML for element identified by `selector`
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading icon inside element identified by `selector`
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Replace all occurrences of {{propName}} in `string`
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    return string.replace(new RegExp(propToReplace, "g"), propValue);
  };

  // Switch CSS class "active" from Home button to Menu button
  var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // -------------------- Home page load --------------------

  document.addEventListener("DOMContentLoaded", function () {
    // On first load, show home view
    showLoading("#main-content");

    // *** STEP 0/1: get ALL categories data first (JSON) ***
    // so we can pick a random one for "Specials"
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowHomeHTML,   // response handler
      true                    // treat response as JSON and convert
    );
  });

  // Build home page HTML with a RANDOM category wired into Specials tile
  function buildAndShowHomeHTML(categories) {
    // `categories` is already a JS object/array (because isJsonResponse=true)

    // Load the home-snippet HTML
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {

        // *** STEP 2: choose a random category from `categories` ***
        var chosenCategory = chooseRandomCategory(categories);
        var chosenCategoryShortName = chosenCategory.short_name;

        // *** STEP 3: surround short_name with quotes so it works
        // inside onclick="$dc.loadMenuItems('SP');"
        chosenCategoryShortName = "'" + chosenCategoryShortName + "'";

        // *** STEP 4: insert that into the home snippet ***
        var homeHtmlToInsertIntoMainPage =
          insertProperty(homeHtml,
                         "randomCategoryShortName",
                         chosenCategoryShortName);

        // and render it
        insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
      },
      false // regular HTML, not JSON
    );
  }

  // Pick and return a random category object from the array
  function chooseRandomCategory(categories) {
    var randomArrayIndex = Math.floor(Math.random() * categories.length);
    return categories[randomArrayIndex];
  }

  // -------------------- Public methods: dc.* --------------------

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowCategoriesHTML
    );
  };

  // Load the menu items view
  // `categoryShort` is a short_name for a category
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  // -------------------- Categories page builders --------------------

  // Builds HTML for the categories page based on data from the server
  function buildAndShowCategoriesHTML(categories) {
    // Load title snippet of categories page
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        // Retrieve single category snippet
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            // Switch CSS class active to menu button
            switchMenuToActive();

            var categoriesViewHtml =
              buildCategoriesViewHtml(categories,
                                      categoriesTitleHtml,
                                      categoryHtml);
            insertHtml("#main-content", categoriesViewHtml);
          },
          false);
      },
      false);
  }

  // Using categories data and snippets HTML, build categories view HTML
  function buildCategoriesViewHtml(categories,
                                   categoriesTitleHtml,
                                   categoryHtml) {

    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over categories
    for (var i = 0; i < categories.length; i++) {
      // Insert category values
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;

      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // -------------------- Single category (menu items) builders --------------------

  // Builds HTML for the single category page based on the data from the server
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Load title snippet of menu items page
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        // Retrieve single menu item snippet
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            // Switch CSS class active to menu button
            switchMenuToActive();

            var menuItemsViewHtml =
              buildMenuItemsViewHtml(categoryMenuItems,
                                     menuItemsTitleHtml,
                                     menuItemHtml);
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false);
      },
      false);
  }

  // Using category & menu items data and snippets HTML,
  // build menu items view HTML
  function buildMenuItemsViewHtml(categoryMenuItems,
                                  menuItemsTitleHtml,
                                  menuItemHtml) {

    menuItemsTitleHtml =
      insertProperty(menuItemsTitleHtml,
                     "name",
                     categoryMenuItems.category.name);
    menuItemsTitleHtml =
      insertProperty(menuItemsTitleHtml,
                     "special_instructions",
                     categoryMenuItems.category.special_instructions);

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over menu items
    var menuItems   = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;

    for (var i = 0; i < menuItems.length; i++) {
      // Insert menu item values
      var html = menuItemHtml;

      html = insertProperty(html, "short_name",    menuItems[i].short_name);
      html = insertProperty(html, "catShortName",  catShortName);

      html = insertItemPrice(html, "price_small",
                             menuItems[i].price_small);
      html = insertItemPortionName(html, "small_portion_name",
                                   menuItems[i].small_portion_name);

      html = insertItemPrice(html, "price_large",
                             menuItems[i].price_large);
      html = insertItemPortionName(html, "large_portion_name",
                                   menuItems[i].large_portion_name);

      html = insertProperty(html, "name",        menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      // Add clearfix after every second menu item on md/lg screens
      if (i % 2 !== 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // -------------------- Price / portion helpers --------------------

  // Appends price with '$' if price exists
  function insertItemPrice(html, pricePropName, priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Appends portion name in parens if it exists
  function insertItemPortionName(html, portionPropName, portionValue) {
    // If not specified, return original string
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

  // Expose namespace
  global.$dc = dc;

})(window);

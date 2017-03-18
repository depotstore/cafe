$(function () { //the same as $(document).ready(function(){ ..});
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });
});

(function (global) {
  var dc = {};
  var homeHtml = "snippets/home-snippet.html";
  var allCategoriesUrl =
  "http://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
  "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

//convinice function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    var targetElement = document.querySelector(selector);
    targetElement.innerHTML = html;
    // $(selector).innerHTML = html; //refactored
  };
// show loading icon inside element identified by 'selector'.
  // var showLoading = function (selector) {
  //   var html = "<div class='text-center'>";
  //   html += "<img src='images/ajax-loader.gif'></div>";
  //   insertHtml(selector, html);
  // };
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    // console.log("string" + string);
    return string;
  }
  //remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
    //remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;
    //add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf('active') == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  $(function () {//refactored
    // showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        insertHtml("#main-content", responseText);
      // document.querySelector("#main-content").innerHTML = responseText;
      },
      false
    );
  });
  // document.addEventListener('DOMContentLoaded', function (event) {
  //   //on first load, show home view
  //   $ajaxUtils.sendGetRequest(
  //     homeHtml,
  //     function (responseText) {
  //     document.querySelector("#main-content").innerHTML = responseText;
  //     },
  //     false
  //   );
  // });

// load the menu categories view
  dc.loadMenuCategories = function () {
  $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHtml);
  };

  dc.loadMenuItems = function (categoryShort) {
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort, buildAndShowMenuItemsHtml);
  };

//builds HTML for the categories page based on the data from server
  function buildAndShowCategoriesHtml(categories) {
      //load title snippet of categories page
      $ajaxUtils.sendGetRequest(
        categoriesTitleHtml,
        function (categoriesTitleHtml) {
          //retrive single category shippet
          $ajaxUtils.sendGetRequest(
            categoryHtml,
            function (categoryHtml) {
              //switch CSS class active to menu button
              switchMenuToActive();
              var categoriesViewHtml =
              buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
              insertHtml("#main-content", categoriesViewHtml);
        },
      false
      );
    },
    false
  );
}

  function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    //loop over categories
    for (var i = 0; i < categories.length; i++) {
    //insert categories values
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }
    finalHtml += "</section>"
    return finalHtml;
}
//builds HTML for the single category page based on the data from the server
function buildAndShowMenuItemsHtml(categoryMenuItems) {
  //load title snippet of menu items page
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      //retrive single menu item snippet
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          //switch CSS class active to menu button
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

function buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml) {
  menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,
                                      "name",
                                      categoryMenuItems.category.name);
  menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,
                                      "special_instructions",
                                      categoryMenuItems.category.special_instructions);
  var finalHtml = menuItemsTitleHtml;
  finalHtml += "<section class='row'>";

  //loop over menu items
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    var html = menuItemHtml;
    html = insertProperty(html, "short_name", menuItems[i].short_name);
    html = insertProperty(html, "catShortName", catShortName);
    html = insertItemPrice(html, "price_small", menuItems[i].price_small);
    html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
    html = insertItemPrice(html, "price_large", menuItems[i].price_large);
    html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
    html = insertProperty(html, "name", menuItems[i].name);
    html = insertProperty(html, "description", menuItems[i].description);

    //add clearfix after every second menu item
    if (i % 2 != 0) {
      html += "<div class='clearfix visible-lg-block visible-md-block'></div>"
    }
    finalHtml += html;
  }
  finalHtml += "</section>";
  return finalHtml;

}

//appends price with "$" if price exists
function insertItemPrice(html, pricePropName, priceValue) {
//if not specified, replace with empty string
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }
  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName,priceValue);
  return html;
}

//appends portion name in parents if it exists
function insertItemPortionName(html, portionPropName, portionValue) {
  //if not specified, return original string
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }
  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}

  global.$dc = dc;

})(window);

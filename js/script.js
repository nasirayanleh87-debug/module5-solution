// *** start ***
// On first load, show home view
showLoading("#main-content");
$ajaxUtils.sendGetRequest(
  allCategoriesUrl,
  buildAndShowHomeHTML, // STEP 1: pass the function itself
  true // Explicitly setting the flag to get JSON from server processed into an object literal
);
// *** finish ***

// Builds HTML for the home page based on categories array
// returned from the server.
function buildAndShowHomeHTML (categories) {

  // Load home snippet page
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {

      // STEP 2: pick a random category object and get its short_name
      var chosenCategoryShortName =
        chooseRandomCategory(categories).short_name;

      // STEP 3: surround the short_name with quotes so the call
      // $dc.loadMenuItems({{randomCategoryShortName}})
      // becomes valid JS, e.g. $dc.loadMenuItems('L')
      chosenCategoryShortName = "'" + chosenCategoryShortName + "'";

      var homeHtmlToInsertIntoMainPage = insertProperty(
        homeHtml,
        "randomCategoryShortName",
        chosenCategoryShortName
      );

      // STEP 4: insert the final HTML into the main page
      insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
    },
    false // False here because we are getting plain HTML from the server
  );
}

// Given array of category objects, returns a random category object.
function chooseRandomCategory (categories) {
  // Choose a random index into the array
  var randomArrayIndex = Math.floor(Math.random() * categories.length);

  // Return category object with that random index
  return categories[randomArrayIndex];
}

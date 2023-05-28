var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:id", async (req, res, next) => {
  try {
    let recipeDetails = await recipes_utils.getRecipeDetails(req.params.id);
    let recipeIns = await recipes_utils.getRecipeInstructions(req.params.id);
    let instructions = recipeIns.instructions
    let ingredients = recipeIns.ingredients
    let servings = recipeIns.servings
    const fullRecipe = 
    { 
      ingredients,
      instructions,
      servings,
      recipeDetails
    }
    res.send(fullRecipe);
  } catch (error) {
    next(error); // 404
  }
});

/**
 * This path returns a preview details of recikpes according to its id
 */
router.get("/preview/:id", async (req, res, next) => {
  try {
    const recipeDetails = await recipes_utils.getRecipeDetails(req.params.id);    
    res.send(recipeDetails);
  } catch (error) {
    next(error); // 404
    
  }
});


/**
 * This path returns search result according user query.
 */
router.get("/search", async (req, res, next) => {
  try {
    let query =
    {
      query: req.query.query,
      cuisine: req.query.cuisine,
      diet: req.query.diet,
      intolerance: req.query.intolerance,
      number: req.query.number,
      sort: req.query.sort
    }
    const searchResult = await recipes_utils.getSearchResult(query);    
    res.send(searchResult);
  } catch (error) {
    next(error); // 404
    
  }
});


module.exports = router;

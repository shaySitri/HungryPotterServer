var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");
const DButils = require("./utils/DButils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:id", async (req, res, next) => {

  try {
    let recipeDetails = await recipes_utils.getRecipeDetails(req.params.id, req.session.userid);
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
    
    // if user is logged in, the recipe mark as watch.
      if (req.session.userid != undefined) {
        user_utils.markAsWatched(req.session.userid, req.params.id)
      }
    
  res.status(200).send(fullRecipe);
  } catch (error) {
    next(error); // 404
  }
});

/**
 * This path returns a preview details of recipes according to its id
 */
router.get("/preview/:id", async (req, res, next) => {
  try {
    const recipeDetails = await recipes_utils.getRecipeDetails(req.params.id, req.session.userid);        
    res.send(recipeDetails);
  } catch (error) {
    next(error); // 404
  }
});

module.exports = router;

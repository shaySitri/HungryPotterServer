var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/recipes/:id", async (req, res, next) => {
  try {
    let recipeDetails = await recipes_utils.getRecipeDetails(req.params.id);
    let instructionsRecipe = await recipes_utils.getRecipeInstructions(req.params.id);
    let instructions = instructionsRecipe.instructions
    let ingredients = instructionsRecipe.ingredients
    let servings = instructionsRecipe.servings
    const fullRecipe = 
    { 
      ingredients,
      instructions,
      servings,
      recipeDetails
    }
      
    res.send(fullRecipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

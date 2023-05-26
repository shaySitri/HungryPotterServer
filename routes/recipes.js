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
    //let instructions = await recipes_utils.getRecipeInstructions(req.params.id);
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
    next(error);
  }
});

module.exports = router;

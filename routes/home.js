var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const home_utils = require("./utils/home_utils");
const recipes_utils = require("./utils/recipes_utils");

/**
 * This path generates 3 random recipes
 */
router.get("/randomRecipes", async (req, res, next) => {
    try {
      const random = await home_utils.getRandomRecieps();
      res.send(random);
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
    const searchResult = (await home_utils.getSearchResult(query)).results; 
    
    let randRecipes = []

    console.log(searchResult.results); 

    for (let i = 0; i < searchResult.length; i++) {

      let recipeDetaills = await recipes_utils.getRecipeDetails(searchResult[i].id);
      let recipeInst = await recipes_utils.getRecipeInstructions(searchResult[i].id);
      
      
      randRecipes.push(
            {
                id: searchResult[i].id,
                title: searchResult[i].title,
                readyInMinutes: recipeDetaills.readyInMinutes,
                image: searchResult[i].image,
                popularity: recipeDetaills.aggregateLikes,
                vegan: recipeDetaills.vegan,
                vegetarian: recipeDetaills.vegetarian,
                glutenFree: recipeDetaills.glutenFree,
                instructions: recipeInst.instructions
            }
        )
      }



    res.send(randRecipes);
  } catch (error) {
    next(error); // 404
    
  }
});

module.exports = router;




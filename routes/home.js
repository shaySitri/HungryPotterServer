var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const home_utils = require("./utils/home_utils");
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

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
 * This path send all possible filters for search
 */
router.get("/getFilters", async (req, res, next) => {
  try {
    const filters = await home_utils.getAllFilters();
    res.send(filters);
  } catch (error) {
    next(error); // 404
  }
});

  
  /**
 * This path send all possible units for custome recipe.
 */
  router.get("/getUnits", async (req, res, next) => {
    try {
      const units = await user_utils.getUnits();
      res.send(units);
    } catch (error) {
      next(error); // 404
    }
  });
  

  /**
 * This path returns search result according user query.
 */
router.get("/search", async (req, res, next) => {
  try {
    const user_id = req.userid;
    let query =
    {
      query: req.query.query,
      cuisine: req.query.cuisine,
      diet: req.query.diet,
      intolerances: req.query.intolerances,
      number: req.query.number,
      sort: req.query.sort
    }
    const searchResult = (await home_utils.getSearchResult(query)).results; 
    
    let recipes = []

    // for each result, get its preview details.
    for (let i = 0; i < searchResult.length; i++) {

      let recipeDetaills = await recipes_utils.getRecipeDetails(searchResult[i].id, user_id) ;
      let recipeInst = await recipes_utils.getRecipeInstructions(searchResult[i].id);
            
      recipes.push(
            {
                id: searchResult[i].id,
                title: searchResult[i].title,
                readyInMinutes: recipeDetaills.readyInMinutes,
                image: searchResult[i].image,
                popularity: recipeDetaills.popularity,
                vegan: recipeDetaills.vegan,
                vegetarian: recipeDetaills.vegetarian,
                glutenFree: recipeDetaills.glutenFree,
                instructions: recipeInst.instructions,
                favorite: recipeDetaills.favorite,
                watched: recipeDetaills.watched,
            }
        )
      }

    if (recipes.length == 0)
    {
      res.status(204).send({ message: "No recipes to display", success: true });
    }
    else
    {
      const query = req.query.query;
      req.session.lastSearches = query;
      res.status(200).send(recipes);
    }
  } catch (error) {
    next(error); // 404
  }
});


module.exports = router;



